import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCustomers, deleteCustomer } from "../services/customerAPI";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

function CustomerListPage() {
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

  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch paginated customer records
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

  async function confirmDeleteCustomer() {
    if (!customerToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);

      // If last item on current page deleted, go to previous page if page > 1
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

  const startRecord = pagination.totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, pagination.totalCount);

  return (
    <div className="list-page-container">
      {/* Top Header */}
      <div className="list-top-bar">
        <div>
          <h1 className="page-title">Customer Care Directory</h1>
          <p className="page-subtitle">
            Manage customer records &bull; Showing First Name &amp; Last Name
          </p>
        </div>

        <Link to="/customers/new" className="btn btn-primary btn-lg">
          + Add New Customer
        </Link>
      </div>

      {/* Filter & Controls Bar */}
      <div className="list-controls-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              &times;
            </button>
          )}
        </div>

        <div className="pagination-quick-controls">
          <label className="rows-per-page-label">
            Rows:
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rows-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>

          <div className="count-badge">
            {pagination.totalCount > 0
              ? `Showing ${startRecord}–${endRecord} of ${pagination.totalCount}`
              : "0 Customers"}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner alert-danger">
          <strong>Error:</strong> {error}
          <button type="button" className="btn btn-sm ml-4" onClick={loadCustomers}>
            Retry
          </button>
        </div>
      )}

      {/* Loading & Empty States */}
      {isLoading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p>Fetching customer records...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="state-container empty-state">
          <div className="empty-icon">&#128101;</div>
          <h3>
            {pagination.totalCount === 0 && !debouncedSearch
              ? "No Customers Registered Yet"
              : "No Matching Customers Found"}
          </h3>
          <p>
            {!debouncedSearch
              ? "Get started by creating your first customer profile using the form."
              : `No customer records matched "${debouncedSearch}".`}
          </p>
          {!debouncedSearch ? (
            <Link to="/customers/new" className="btn btn-primary mt-4">
              + Create First Customer
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-secondary mt-4"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Customer Table */
        <div className="table-responsive-card">
          <table className="customers-table">
            <thead>
              <tr>
                <th className="col-index">#</th>
                <th className="col-fname">First Name</th>
                <th className="col-lname">Last Name</th>
                <th className="col-actions text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => {
                const customerFullName = `${customer.firstName || ""} ${customer.lastName || ""}`;

                return (
                  <tr key={customer._id} className="customer-row">
                    <td className="col-index text-muted">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="col-fname font-semibold">
                      {customer.firstName}
                    </td>
                    <td className="col-lname font-semibold">
                      {customer.lastName}
                    </td>
                    <td className="col-actions text-right">
                      <div className="table-actions-cluster">
                        <Link
                          to={`/customers/${customer._id}`}
                          className="btn btn-outline-primary btn-sm"
                          title="View customer application form"
                        >
                          &#128065; View Form
                        </Link>
                        <Link
                          to={`/customers/${customer._id}/edit`}
                          className="btn btn-outline-secondary btn-sm"
                          title="Edit customer information"
                        >
                          &#9998; Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Navigation Footer */}
          {pagination.totalPages > 1 && (
            <div className="pagination-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                &larr; Previous
              </button>

              <div className="page-numbers-group">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`btn-page ${pageNum === page ? "active" : ""}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
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