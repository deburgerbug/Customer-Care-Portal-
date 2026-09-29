import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import BasicInformation from "./BasicInformation";
import AddressSection from "./AddressSection";
import CommunicationSection from "./CommunicationSection";

import { getPincodeDetails } from "../../services/pincodeAPI";
import {
  createCustomer,
  updateCustomer,
  getCustomerById,
} from "../../services/customerAPI";
import { validateCustomer } from "../../utils/customerValidation";

/**
 * CustomerForm — Master form component for creating and editing customer records
 *
 * Used in: CustomerPage.jsx (mounted for both /customers/new and /customers/:id/edit)
 *
 * Responsibilities:
 *  1. Edit Mode Detection: Checks for `id` in URL params via useParams()
 *  2. State Management: Manages master `customer` state (basic info, addresses, communications)
 *  3. Auto-fill Integration: Calls getPincodeDetails on 6-digit PIN entry to auto-populate City/State
 *  4. Client-side Validation: Executes validateCustomer() before sending payload to backend
 *  5. Data Sanitization: Strips temporary frontend client `id` properties before POST/PUT
 *  6. API Integration: Calls createCustomer or updateCustomer and redirects to details view on success
 */
function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, saveAuth } = useAuth();
  const basePath = user?.role ? `/${user.role}` : "";
  const isEditMode = Boolean(id);

  // Master customer form state
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    assignedTo: "",
    addresses: [
      {
        id: crypto.randomUUID(),
        type: "primary",
        address: "",
        pincode: "",
        city: "",
        state: "",
        country: "India",
      },
    ],
    communications: [
      {
        id: crypto.randomUUID(),
        type: "primary",
        countryCode: "+91",
        mobile: "",
        email: "",
      },
    ],
  });

  // UI & Network states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Load existing customer data if editing
  useEffect(() => {
    if (!id) return;

    async function loadCustomer() {
      try {
        setIsLoading(true);
        setServerError("");
        const response = await getCustomerById(id);
        const data = response.data || response;

        setCustomer({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender || "",
          dob: data.dob ? data.dob.substring(0, 10) : "",
          assignedTo: data.assignedTo || "",
          addresses: (data.addresses || []).map((addr) => ({
            type: addr.type || "primary",
            address: addr.address || "",
            pincode: addr.pincode || "",
            city: addr.city || "",
            state: addr.state || "",
            country: addr.country || "India",
            id: addr._id || crypto.randomUUID(),
            _id: addr._id,
          })),
          communications: (data.communications || []).map((comm) => ({
            type: comm.type || "primary",
            countryCode: comm.countryCode || comm.countrycode || "+91",
            mobile: comm.mobile || "",
            email: comm.email || "",
            id: comm._id || crypto.randomUUID(),
            _id: comm._id,
          })),
        });
      } catch (err) {
        setServerError(err.message || "Failed to load customer details");
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomer();
  }, [id]);

  // Handler for top-level basic info fields (firstName, lastName, gender, dob)
  function handleChange(event) {
    const { name, value } = event.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  // Address Section handlers
  function addAddress() {
    const newAddress = {
      id: crypto.randomUUID(),
      type: "secondary",
      address: "",
      pincode: "",
      city: "",
      state: "",
      country: "India",
    };

    setCustomer((prev) => ({
      ...prev,
      addresses: [...prev.addresses, newAddress],
    }));
  }

  function updateAddress(addressId, event) {
    const { name, value } = event.target;

    setCustomer((prev) => ({
      ...prev,
      addresses: prev.addresses.map((address) =>
        address.id === addressId
          ? {
              ...address,
              [name]: value,
            }
          : address
      ),
    }));

    const errorKey = `${name}-${customer.addresses.findIndex((a) => a.id === addressId)}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  }

  function removeAddress(addressId) {
    setCustomer((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((address) => address.id !== addressId),
    }));
  }

  // Automatic postal code lookup to populate city and state
  async function handlePincodeLookup(addressId, pincode) {
    if (!pincode || pincode.trim().length !== 6) {
      return;
    }

    try {
      const details = await getPincodeDetails(pincode);

      setCustomer((prev) => ({
        ...prev,
        addresses: prev.addresses.map((address) =>
          address.id === addressId
            ? {
                ...address,
                city: details.city,
                state: details.state,
              }
            : address
        ),
      }));

      const addrIndex = customer.addresses.findIndex((a) => a.id === addressId);
      if (addrIndex !== -1) {
        setErrors((prev) => ({
          ...prev,
          [`city-${addrIndex}`]: "",
          [`state-${addrIndex}`]: "",
        }));
      }
    } catch (error) {
      console.error("Pincode lookup failed:", error);
    }
  }

  // Communication Section handlers
  function addCommunication() {
    const newCommunication = {
      id: crypto.randomUUID(),
      type: "secondary",
      countryCode: "+91",
      mobile: "",
      email: "",
    };

    setCustomer((prev) => ({
      ...prev,
      communications: [...prev.communications, newCommunication],
    }));
  }

  function updateCommunication(communicationId, event) {
    const { name, value } = event.target;

    setCustomer((prev) => {
      return {
        ...prev,
        communications: prev.communications.map((comm) => {
          if (comm.id !== communicationId) return comm;

          // If typing a mobile number, strip non-digits and enforce length
          if (name === "mobile") {
            const countryCode = (comm.countryCode || "+91").trim();
            const maxDigits = countryCode === "+91" ? 10 : 15;
            const cleanedMobile = value.replace(/\D/g, "").slice(0, maxDigits);
            return { ...comm, mobile: cleanedMobile };
          }

          // For any other field (countryCode, email), update directly
          return { ...comm, [name]: value };
        }),
      };
    });

    const errorKey = `${name}-${customer.communications.findIndex((c) => c.id === communicationId)}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  }

  function removeCommunication(communicationId) {
    setCustomer((prev) => ({
      ...prev,
      communications: prev.communications.filter(
        (communication) => communication.id !== communicationId
      ),
    }));
  }

  // Submit Handler
  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    // Run client validation
    const validationErrors = validateCustomer(customer);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Strip temporary frontend IDs before sending payload
    function sanitizeItem(item) {
      const copy = { ...item };
      delete copy.id;
      if (copy.countrycode && !copy.countryCode) {
        copy.countryCode = copy.countrycode;
      }
      return copy;
    }

    const payload = {
      firstName: (customer.firstName || "").trim(),
      lastName: (customer.lastName || "").trim(),
      gender: customer.gender,
      dob: customer.dob,
      assignedTo: customer.assignedTo || null,
      addresses: customer.addresses.map(sanitizeItem),
      communications: customer.communications.map(sanitizeItem),
    };

    try {
      setIsSubmitting(true);
      if (isEditMode) {
        await updateCustomer(id, payload);
        if (user?.role === "customer") {
          navigate("/customer/profile");
        } else {
          navigate(`${basePath}/customers/${id}`);
        }
      } else {
        const response = await createCustomer(payload);
        const createdId = response.data?._id || response._id;
        
        if (user?.role === "customer") {
          // Update the user object in localStorage and AuthContext
          const updatedUser = { ...user, customerId: createdId };
          const tokens = {
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
            user: updatedUser
          };
          saveAuth(tokens);
          navigate("/customer/profile");
        } else {
          navigate(`${basePath}/customers/${createdId}`);
        }
      }
    } catch (error) {
      setServerError(error.message || "Failed to save customer");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading spinner during customer profile fetch
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">
          Loading customer information...
        </p>
      </div>
    );
  }

  return (
    // Form page container — centered with max-width
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Header Bar — title, subtitle, and back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isEditMode ? "Edit Customer Profile" : "New Customer Application"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customer Care Service Portal &bull; Fill in the customer profile details
          </p>
        </div>

        {/* Back to list button */}
        <Link
          to={user?.role === "customer" ? `/customer/profile` : `${basePath}/customers`}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition inline-flex items-center gap-1.5"
        >
          &larr; Back
        </Link>
      </div>

      {/* Server error alert banner */}
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          <span className="font-bold text-red-800">Error:</span> {serverError}
        </div>
      )}

      {/* Main Form containing all 3 structured sections */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Basic Information (Name, Gender, DOB, Age) */}
        <BasicInformation
          customer={customer}
          onChange={handleChange}
          errors={errors}
        />

        {/* Section 2: Addresses (Primary + Secondary cards) */}
        <AddressSection
          addresses={customer.addresses}
          onAdd={addAddress}
          onChange={updateAddress}
          onRemove={removeAddress}
          onPincodeLookup={handlePincodeLookup}
          errors={errors}
        />

        {/* Section 3: Communications (Country code, Phone, Email) */}
        <CommunicationSection
          communications={customer.communications}
          onAdd={addCommunication}
          onChange={updateCommunication}
          onRemove={removeCommunication}
          errors={errors}
        />

        {/* Action bar — Cancel and Submit buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200 mt-4">
          <Link
            to={user?.role === "customer" ? `/customer/profile` : `${basePath}/customers`}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition inline-flex items-center justify-center min-w-[160px]"
          >
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update Customer"
              : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;