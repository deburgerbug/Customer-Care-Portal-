import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCustomers, deleteCustomer } from "../../services/customerAPI";
import { useAuth } from "../../context/AuthContext";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

/**
 * CustomerListPage — Main Customer Directory Table View
 *
 * Route: / (protected route)
 * Used in: App.jsx
 *
 * Core Features:
 *  1. Server-Side Pagination: queries backend with page & limit params
 *  2. 300ms Debounced Search: searches across firstName, lastName, phone, email
 *  3. Dynamic Rows per Page: selector for 5, 10, or 20 records per page
 *  4. Quick Actions: View Details, Edit Form, and Delete with Confirmation Modal
 *  5. Loading & Empty States: clean visual placeholders for all states
 */
function CustomerListPage() {
  const { user } = useAuth();
  const basePath = user?.role ? `/${user.role}` : "";

  // Customer list & pagination state
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Modal deletion state
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input by 300ms to reduce backend query load
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getCustomers({
        page,
        limit,
        search: debouncedSearch,
      });

      setCustomers(Array.isArray(response.data) ? response.data : []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load customer list");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  // Reload customer list whenever page, limit, or search query changes
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Deletion confirmed from DeleteConfirmModal
  async function confirmDeleteCustomer() {
    if (!customerToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);

      // If last item on page deleted, go back one page if page > 1
      if (customers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        loadCustomers();
      }
    } catch (err) {
      alert(`Failed to delete customer: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  // Calculate record display range (e.g., "Showing 1–5 of 12")
  const startRecord = pagination.totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, pagination.totalCount);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Search and manage customer records</p>
        </div>

        <Link
          to={`${basePath}/customers/new`}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
        >
          + Add Customer
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            Rows
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:border-blue-600"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>

          <span className="text-xs text-gray-500">
            {pagination.totalCount > 0
              ? `${startRecord}–${endRecord} of ${pagination.totalCount}`
              : "0 customers"}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
          <span>{error}</span>
          <button
            type="button"
            className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium"
            onClick={loadCustomers}
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 bg-white border border-gray-200 rounded-lg">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-base font-semibold text-gray-900">
            {pagination.totalCount === 0 && !debouncedSearch
              ? "No customers yet"
              : "No matching customers"}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            {!debouncedSearch
              ? "Create the first customer profile to get started."
              : `No records matched "${debouncedSearch}".`}
          </p>
          {!debouncedSearch ? (
            <Link
              to={`${basePath}/customers/new`}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md inline-block"
            >
              + Create Customer
            </Link>
          ) : (
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="py-2 px-3 w-12 text-center">#</th>
                  <th className="py-2 px-3">First Name</th>
                  <th className="py-2 px-3">Last Name</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {customers.map((customer, index) => {
                  const customerFullName = `${customer.firstName || ""} ${customer.lastName || ""}`;

                  return (
                    <tr key={customer._id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 text-center text-gray-400 text-xs">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {customer.firstName}
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {customer.lastName}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            to={`${basePath}/customers/${customer._id}`}
                            className="px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200 rounded hover:bg-blue-50"
                          >
                            View
                          </Link>
                          <Link
                            to={`${basePath}/customers/${customer._id}/edit`}
                            className="px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          {(user?.role === "admin" || user?.role === "super_admin") && (
                            <button
                              type="button"
                              className="px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200 rounded hover:bg-red-50"
                              onClick={() =>
                                setCustomerToDelete({
                                  id: customer._id,
                                  name: customerFullName,
                                })
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2.5 border-t border-gray-200 bg-gray-50/60">
              <button
                type="button"
                className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`w-7 h-7 text-xs font-medium rounded transition ${
                        pageNum === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((prev) => Math.min(pagination.totalPages, prev + 1))
                }
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(customerToDelete)}
        customerName={customerToDelete?.name}
        onConfirm={confirmDeleteCustomer}
        onCancel={() => setCustomerToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default CustomerListPage;