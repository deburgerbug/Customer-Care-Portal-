import { useState, useEffect } from "react";
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

  // Reload customer list whenever page, limit, or search query changes
  useEffect(() => {
    loadCustomers();
  }, [page, limit, debouncedSearch]);

  async function loadCustomers() {
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
  }

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
    // Directory container — centered with max-width and vertical padding
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header Bar — title, subtitle, and primary "+ Add" action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Customer Care Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer records &bull; Showing First Name &amp; Last Name
          </p>
        </div>

        {/* Primary "+ Add New Customer" CTA button */}
        <Link
          to={`${basePath}/customers/new`}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition inline-flex items-center gap-2"
        >
          <span>+</span> Add New Customer
        </Link>
      </div>

      {/* Filter & Controls Bar — Search input and Rows-per-page selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input field with search icon & clear button */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            &#128269;
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-lg"
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Quick controls: Rows-per-page dropdown and Count badge */}
        <div className="flex items-center justify-between sm:justify-end gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-600 font-medium">
            Rows:
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>

          {/* Record counter badge */}
          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
            {pagination.totalCount > 0
              ? `Showing ${startRecord}–${endRecord} of ${pagination.totalCount}`
              : "0 Customers"}
          </div>
        </div>
      </div>

      {/* Error Banner with Retry button */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          <div>
            <strong className="font-bold text-red-800">Error:</strong> {error}
          </div>
          <button
            type="button"
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-xs transition"
            onClick={loadCustomers}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 bg-white border border-gray-200 rounded-xl p-12 shadow-sm">
          <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">
            Fetching customer records...
          </p>
        </div>
      ) : customers.length === 0 ? (
        /* Empty state placeholder when no records exist or match */
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">&#128101;</div>
          <h3 className="text-lg font-bold text-gray-900">
            {pagination.totalCount === 0 && !debouncedSearch
              ? "No Customers Registered Yet"
              : "No Matching Customers Found"}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-6">
            {!debouncedSearch
              ? "Get started by creating your first customer profile using the form."
              : `No customer records matched "${debouncedSearch}".`}
          </p>
          {!debouncedSearch ? (
            <Link
              to={`${basePath}/customers/new`}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm text-sm transition inline-block"
            >
              + Create First Customer
            </Link>
          ) : (
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Main Customer Table Card */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">#</th>
                  <th className="py-3.5 px-6">First Name</th>
                  <th className="py-3.5 px-6">Last Name</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-1 divide-gray-100 text-sm">
                {customers.map((customer, index) => {
                  const customerFullName = `${customer.firstName || ""} ${customer.lastName || ""}`;

                  return (
                    <tr
                      key={customer._id}
                      className="hover:bg-blue-50/40 transition group"
                    >
                      {/* Row Index Number */}
                      <td className="py-3.5 px-4 text-center text-gray-400 font-mono text-xs">
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* Customer First Name */}
                      <td className="py-3.5 px-6 font-semibold text-gray-900">
                        {customer.firstName}
                      </td>

                      {/* Customer Last Name */}
                      <td className="py-3.5 px-6 font-semibold text-gray-900">
                        {customer.lastName}
                      </td>

                      {/* Row Actions Cluster: View, Edit, Delete */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* View Form Button */}
                          <Link
                            to={`${basePath}/customers/${customer._id}`}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50/60 border border-blue-200 rounded-md hover:bg-blue-600 hover:text-white transition"
                            title="View customer application form"
                          >
                            &#128065; View
                          </Link>

                          {/* Edit Button */}
                          <Link
                            to={`${basePath}/customers/${customer._id}/edit`}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                            title="Edit customer information"
                          >
                            &#9998; Edit
                          </Link>

                          {/* Delete Button (Admins Only) */}
                          {user?.role === "admin" && (
                            <button
                              type="button"
                              className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50/60 border border-red-200 rounded-md hover:bg-red-600 hover:text-white transition"
                              title="Delete customer"
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

          {/* Pagination Navigation Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              {/* Previous Page Button */}
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                &larr; Previous
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`w-8 h-8 text-xs font-semibold rounded-md transition ${pageNum === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-100"
                        }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((prev) => Math.min(pagination.totalPages, prev + 1))
                }
              >
                Next &rarr;
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