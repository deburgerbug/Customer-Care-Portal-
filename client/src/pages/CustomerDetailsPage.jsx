import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCustomerById, deleteCustomer } from "../services/customerAPI";
import { calculateAge } from "../utils/calculateAge";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getCountryByDialCode } from "../constants/countries.js";

function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setIsLoading(true);
        setError("");
        const response = await getCustomerById(id);
        const data = response.data || response;
        setCustomer(data);
      } catch (err) {
        setError(err.message || "Failed to load customer profile");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  async function confirmDeleteCustomer() {
    try {
      setIsDeleting(true);
      await deleteCustomer(id);
      navigate("/");
    } catch (err) {
      alert(`Error deleting customer: ${err.message}`);
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Loading application form...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="state-container">
        <div className="error-banner">
          <h3>Customer Not Found</h3>
          <p>{error || "The requested customer record does not exist."}</p>
        </div>
        <Link to="/" className="btn btn-secondary mt-4">
          &larr; Return to Customer List
        </Link>
      </div>
    );
  }

  const age = customer.dob ? calculateAge(customer.dob) : "N/A";
  const formattedDob = customer.dob
    ? new Date(customer.dob).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="details-container">
      {/* Top Navigation / Action Bar */}
      <div className="details-top-bar">
        <div>
          <Link to="/" className="nav-back-link">
            &larr; Back to Customer Directory
          </Link>
          <h1 className="page-title mt-2">
            Customer Application Form
          </h1>
          <p className="page-subtitle">
            Record ID: <span className="mono-text">{customer._id}</span> &bull; Status: <span className="status-badge">Submitted</span>
          </p>
        </div>

        <div className="actions-cluster">
          <Link to={`/customers/${id}/edit`} className="btn btn-primary">
            &#9998; Edit Form
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
          >
            Delete Customer
          </button>
        </div>
      </div>

      {/* Main Submitted Application Layout */}
      <div className="application-paper">
        {/* Paper Header */}
        <div className="paper-header">
          <div className="organization-brand">
            <div className="brand-logo-icon">&#128100;</div>
            <div>
              <h2>Customer Care Service Portal</h2>
              <p>Official Customer Record &amp; Profile Summary</p>
            </div>
          </div>
          <div className="record-date">
            <span>Registered On</span>
            <strong>
              {customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString()
                : "Active"}
            </strong>
          </div>
        </div>

        {/* Grid 1: Basic Information (Always Visible) */}
        <section className="summary-grid-section">
          <div className="section-legend">
            <span className="grid-number">1</span>
            <h3>Customer Basic Information</h3>
          </div>

          <div className="info-display-grid">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value highlight-name">
                {customer.firstName} {customer.lastName}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{customer.gender || "Not specified"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{formattedDob}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Calculated Age</span>
              <span className="info-value badge-age">{age}</span>
            </div>
          </div>
        </section>

        {/* The "Details" Reveal Highlight Button */}
        <div className="details-toggle-wrapper">
          <button
            type="button"
            id="detailsToggleBtn"
            className={`details-toggle-btn ${showDetails ? "active" : ""}`}
            onClick={() => setShowDetails((prev) => !prev)}
            aria-expanded={showDetails}
          >
            <span className="toggle-highlight-text">
              {showDetails ? "Hide Details" : "Details"}
            </span>
            <span className="toggle-icon">
              {showDetails ? "▲ (Click to collapse)" : "▼ (Click to view full residence & communication details)"}
            </span>
          </button>
        </div>

        {/* Grid 2 & Grid 3: Revealed upon clicking "Details" */}
        {showDetails && (
          <div className="expandable-details-section">
            {/* Grid 2: Residence Information */}
            <section className="summary-grid-section mt-6">
              <div className="section-legend">
                <span className="grid-number">2</span>
                <h3>Customer Residence Information</h3>
              </div>

              <div className="sub-entities-list">
                {customer.addresses && customer.addresses.length > 0 ? (
                  customer.addresses.map((addr, index) => {
                    const isPrimary = addr.type === "primary";
                    return (
                      <div
                        key={addr._id || index}
                        className={`summary-card ${
                          isPrimary ? "summary-card-primary" : ""
                        }`}
                      >
                        <div className="summary-card-header">
                          <span
                            className={`badge ${
                              isPrimary ? "badge-primary" : "badge-secondary"
                            }`}
                          >
                            {isPrimary
                              ? "Primary Residence"
                              : `Secondary Address #${index}`}
                          </span>
                        </div>

                        <div className="info-display-grid">
                          <div className="info-item span-full">
                            <span className="info-label">Street Address</span>
                            <span className="info-value">{addr.address}</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Pincode</span>
                            <span className="info-value mono-text">
                              {addr.pincode}
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">City / District</span>
                            <span className="info-value">{addr.city}</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">State</span>
                            <span className="info-value">{addr.state}</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Country</span>
                            <span className="info-value">{addr.country}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-data-text">No address records available.</p>
                )}
              </div>
            </section>

            {/* Grid 3: Communication Information */}
            <section className="summary-grid-section mt-6">
              <div className="section-legend">
                <span className="grid-number">3</span>
                <h3>Customer Communication Information</h3>
              </div>

              <div className="sub-entities-list">
                {customer.communications && customer.communications.length > 0 ? (
                  customer.communications.map((comm, index) => {
                    const isPrimary = comm.type === "primary";
                    const dialCode = comm.countryCode || comm.countrycode || "+91";
                    const countryInfo = getCountryByDialCode(dialCode);

                    return (
                      <div
                        key={comm._id || index}
                        className={`summary-card ${
                          isPrimary ? "summary-card-primary" : ""
                        }`}
                      >
                        <div className="summary-card-header">
                          <span
                            className={`badge ${
                              isPrimary ? "badge-primary" : "badge-secondary"
                            }`}
                          >
                            {isPrimary
                              ? "Primary Contact"
                              : `Secondary Contact #${index}`}
                          </span>
                        </div>

                        <div className="info-display-grid">
                          <div className="info-item">
                            <span className="info-label">Phone Number</span>
                            <span className="info-value">
                              <a
                                href={`tel:${dialCode}${comm.mobile}`}
                                className="contact-link"
                              >
                                <span className="country-flag">{countryInfo.flag}</span>{" "}
                                {dialCode} {comm.mobile}
                              </a>
                            </span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Email Address</span>
                            <span className="info-value">
                              <a
                                href={`mailto:${comm.email}`}
                                className="contact-link"
                              >
                                &#9993; {comm.email}
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-data-text">No communication records available.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        customerName={`${customer?.firstName || ""} ${customer?.lastName || ""}`}
        onConfirm={confirmDeleteCustomer}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default CustomerDetailsPage;