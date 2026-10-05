import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getCustomerById, deleteCustomer } from "../../services/customerAPI.js";
import { calculateAge } from "../../utils/calculateAge.js";
import DeleteConfirmModal from "../../components/DeleteConfirmModal.jsx";
import HasPermission from "../../components/HasPermission.jsx";
import { PERMISSIONS } from "../../config/permissions.js";
import { getCountryByDialCode } from "../../constants/countries.js";

/**
 * CustomerDetailsPage — Detailed Profile View for a Customer Record
 *
 * Route: /customers/:id (protected route)
 * Used in: App.jsx
 *
 * Capabilities:
 *  1. Fetches customer by ID and displays formatted profile overview
 *  2. Displays Section 1 (Basic Info) prominently in a summary banner
 *  3. Includes an interactive "Details" reveal button that expands/collapses:
 *     - Section 2: Residence Information (Primary & Secondary Addresses)
 *     - Section 3: Communication Information (Interactive tel: and mailto: links)
 *  4. Quick Actions: Navigate to Edit Form, or open Delete Confirmation Modal
 */
function CustomerDetailsPage() {
  const { id: paramId } = useParams();
  const { user } = useAuth();

  // If paramId is missing, assume it's the customer's own profile
  const id = paramId || user?.customerId;

  const navigate = useNavigate();

  // State management
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch full customer details on component mount or id change
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
    } else {
      // If no ID exists, stop loading so we can show the Empty/Not Found state
      setIsLoading(false);
    }
  }, [id]);

  // Handle permanent deletion after user confirms in modal
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

  // Loading state with centered spinner
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">
          Loading application form...
        </p>
      </div>
    );
  }

  // Not found or fetch failure state (or brand new customer with no profile)
  if (error || !customer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-800 mb-6">
          <h3 className="text-lg font-bold mb-1">
            {!id ? "Profile Not Created" : "Customer Not Found"}
          </h3>
          <p className="text-sm">
            {!id
              ? "You haven't set up your customer application form yet."
              : (error || "The requested customer record does not exist.")}
          </p>
        </div>
        <Link
          to={!id && user?.role === "customer" ? "/customer/profile/new" : "/"}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 border border-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition"
        >
          {!id && user?.role === "customer" ? "Create Application Form" : "\u2190 Return to Dashboard"}
        </Link>
      </div>
    );
  }

  // Format dates and age for display
  const age = customer.dob ? calculateAge(customer.dob) : "N/A";
  const formattedDob = customer.dob
    ? new Date(customer.dob).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "N/A";

  return (
    // Outer details container — centered with max-width
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          {/* Back button logic: Employees/Admins go back to list, Customers go to dashboard/profile */}
          {user?.role !== "customer" && (
            <Link
              to={user?.role === "admin" ? "/admin/customers" : "/employee/customers"}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              &larr; Back to Customer Directory
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Customer Application Form
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            Record ID:{" "}
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
              {customer._id}
            </span>{" "}
            &bull; Status:{" "}
            <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full">
              Submitted
            </span>
          </p>
        </div>

        {/* Action Cluster: Edit and Delete buttons */}
        <div className="flex items-center gap-3">
          <HasPermission required={PERMISSIONS.CUSTOMER_UPDATE}>
            <Link
              to={user?.role === "customer"
                ? `/customer/profile/${id}/edit`
                : `/${user?.role === "super_admin" ? "admin" : user?.role}/customers/${id}/edit`}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition inline-flex items-center gap-1.5"
            >
              &#9998; Edit Form
            </Link>
          </HasPermission>
          
          <HasPermission required={PERMISSIONS.CUSTOMER_DELETE}>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleting}
            >
              Delete Customer
            </button>
          </HasPermission>
        </div>
      </div>

      {/* Main Document / Application Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Document Header & Organization Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-2xl">
              &#128100;
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Customer Care Service Portal
              </h2>
              <p className="text-xs text-gray-500">
                Official Customer Record &amp; Profile Summary
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Registered On
            </span>
            <strong className="text-sm font-bold text-gray-800">
              {customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                : "Active"}
            </strong>
          </div>
        </div>

        {/* Section 1: Customer Basic Information (Always Visible) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-bold text-gray-900">
              Customer Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Full Name
              </span>
              <span className="text-base font-bold text-gray-900 mt-0.5 block">
                {customer.firstName} {customer.lastName}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gender
              </span>
              <span className="text-sm font-semibold text-gray-800 mt-0.5 block">
                {customer.gender || "Not specified"}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date of Birth
              </span>
              <span className="text-sm font-semibold text-gray-800 mt-0.5 block">
                {formattedDob}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Calculated Age
              </span>
              <span className="inline-block text-xs font-bold px-2.5 py-1 mt-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {age}
              </span>
            </div>
          </div>
        </section>

        {/* Interactive "Details" Accordion Reveal Button */}
        <div className="my-6">
          <button
            type="button"
            id="detailsToggleBtn"
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm border flex items-center justify-between transition ${showDetails
                ? "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            onClick={() => setShowDetails((prev) => !prev)}
            aria-expanded={showDetails}
          >
            <span className="font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              {showDetails ? "Hide Extended Details" : "View Extended Details"}
            </span>
            <span className="text-xs text-gray-500">
              {showDetails
                ? "▲ Collapse residency & contacts"
                : "▼ Expand residence & communication records"}
            </span>
          </button>
        </div>

        {/* Section 2 & 3: Revealed upon clicking "Details" button */}
        {showDetails && (
          <div className="flex flex-col gap-8 pt-2">
            {/* Section 2: Residence / Address Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Customer Residence Information
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {customer.addresses && customer.addresses.length > 0 ? (
                  customer.addresses.map((addr, index) => {
                    const isPrimary = addr.type === "primary";
                    return (
                      <div
                        key={addr._id || index}
                        className={`border rounded-xl p-5 ${isPrimary
                            ? "border-l-4 border-l-blue-600 bg-white shadow-sm"
                            : "border-l-4 border-l-gray-400 bg-gray-50/70"
                          }`}
                      >
                        <div className="mb-3 pb-2 border-b border-dashed border-gray-200">
                          <span
                            className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${isPrimary
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                          >
                            {isPrimary
                              ? "Primary Residence"
                              : `Secondary Address #${index}`}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="sm:col-span-2 lg:col-span-4">
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Street Address
                            </span>
                            <span className="text-gray-900 font-medium mt-0.5 block">
                              {addr.address}
                            </span>
                          </div>

                          <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Pincode
                            </span>
                            <span className="font-mono text-gray-800 font-medium mt-0.5 block">
                              {addr.pincode}
                            </span>
                          </div>

                          <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              City / District
                            </span>
                            <span className="text-gray-800 font-medium mt-0.5 block">
                              {addr.city}
                            </span>
                          </div>

                          <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              State
                            </span>
                            <span className="text-gray-800 font-medium mt-0.5 block">
                              {addr.state}
                            </span>
                          </div>

                          <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Country
                            </span>
                            <span className="text-gray-800 font-medium mt-0.5 block">
                              {addr.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No address records available.
                  </p>
                )}
              </div>
            </section>

            {/* Section 3: Communication Channels */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Customer Communication Information
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {customer.communications &&
                  customer.communications.length > 0 ? (
                  customer.communications.map((comm, index) => {
                    const isPrimary = comm.type === "primary";
                    const dialCode =
                      comm.countryCode || comm.countrycode || "+91";
                    const countryInfo = getCountryByDialCode(dialCode);

                    return (
                      <div
                        key={comm._id || index}
                        className={`border rounded-xl p-5 ${isPrimary
                            ? "border-l-4 border-l-blue-600 bg-white shadow-sm"
                            : "border-l-4 border-l-gray-400 bg-gray-50/70"
                          }`}
                      >
                        <div className="mb-3 pb-2 border-b border-dashed border-gray-200">
                          <span
                            className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${isPrimary
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                          >
                            {isPrimary
                              ? "Primary Contact"
                              : `Secondary Contact #${index}`}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Phone Number
                            </span>
                            <a
                              href={`tel:${dialCode}${comm.mobile}`}
                              className="text-blue-600 hover:text-blue-800 font-semibold mt-0.5 inline-flex items-center gap-1.5"
                            >
                              <span>{countryInfo.flag}</span>
                              <span>
                                {dialCode} {comm.mobile}
                              </span>
                            </a>
                          </div>

                          <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Email Address
                            </span>
                            <a
                              href={`mailto:${comm.email}`}
                              className="text-blue-600 hover:text-blue-800 font-semibold mt-0.5 inline-flex items-center gap-1.5"
                            >
                              <span>&#9993;</span>
                              <span>{comm.email}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No communication records available.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        customerName={`${customer?.firstName || ""} ${customer?.lastName || ""
          }`}
        onConfirm={confirmDeleteCustomer}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default CustomerDetailsPage;