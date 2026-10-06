import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getCustomers, deleteCustomer } from "../../services/customerAPI";
import { useAuth } from "../../context/AuthContext";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

/**
 * CustomerListPage — Main Customer Directory Table View
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

  const ActionsRenderer = useCallback((params) => {
    const customer = params.data;
    const customerFullName = `${customer.firstName || ""} ${customer.lastName || ""}`;
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
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
    );
  }, [basePath, user, setCustomerToDelete]);

  const colDefs = useMemo(() => [
    { 
      headerName: "#", 
      valueGetter: (params) => (page - 1) * limit + (params.node?.rowIndex || 0) + 1,
      width: 70,
      suppressSizeToFit: true,
      filter: false
    },
    { field: "firstName", headerName: "First Name", flex: 1, filter: true },
    { field: "lastName", headerName: "Last Name", flex: 1, filter: true },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
    }
  ], [page, limit, ActionsRenderer]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  // Calculate record display range (e.g., "Showing 1–5 of 12")
  const startRecord = pagination.totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, pagination.totalCount);

  return (
    <div className="max-w-5xl h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 shrink-0">
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

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
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
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3 shrink-0">
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

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm mt-2">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
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
          <div className="ag-theme-quartz w-full h-full">
            <AgGridReact
              rowData={customers}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              animateRows={true}
            />
          </div>
        )}
      </div>

      {/* Custom Pagination Footer linked to server-side data */}
      {customers.length > 0 && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2.5 border border-t-0 border-gray-200 bg-gray-50/60 rounded-b-lg shrink-0 mt-0">
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