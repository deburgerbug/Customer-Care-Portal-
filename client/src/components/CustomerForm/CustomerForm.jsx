import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import BasicInformation from "./BasicInformation";
import AddressSection from "./AddressSection";
import CommunicationSection from "./CommunicationSection";

import { getPincodeDetails } from "../../services/pincodeAPI";
import {createCustomer,updateCustomer,getCustomerById,} from "../../services/customerAPI";
import { validateCustomer } from "../../utils/customerValidation";

function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
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

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

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

  function handleChange(event) {
    const { name, value } = event.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

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

          // If typing a mobile number, strip non-digits and limit length
          if (name === "mobile") {
            const countryCode = (comm.countryCode || "+91").trim();
            const maxDigits = countryCode === "+91" ? 10 : 15;
            const cleanedMobile = value.replace(/\D/g, "").slice(0, maxDigits);
            return { ...comm, mobile: cleanedMobile };
          }

          // For any other field (countryCode, email), just update directly
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

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const validationErrors = validateCustomer(customer);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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
      addresses: customer.addresses.map(sanitizeItem),
      communications: customer.communications.map(sanitizeItem),
    };

    try {
      setIsSubmitting(true);
      if (isEditMode) {
        await updateCustomer(id, payload);
        navigate(`/customers/${id}`);
      } else {
        const response = await createCustomer(payload);
        const createdId = response.data?._id || response._id;
        navigate(`/customers/${createdId}`);
      }
    } catch (error) {
      setServerError(error.message || "Failed to save customer");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Loading customer information...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-top-bar">
        <div>
          <h1 className="page-title">
            {isEditMode ? "Edit Customer Form" : "New Customer Application Form"}
          </h1>
          <p className="page-subtitle">
            Customer Care Service Portal &bull; Fill in the customer profile details
          </p>
        </div>
        <Link to="/" className="btn btn-secondary">
          &larr; Back to Customer List
        </Link>
      </div>

      {serverError && (
        <div className="error-banner alert-danger">
          <strong>Error:</strong> {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <BasicInformation
          customer={customer}
          onChange={handleChange}
          errors={errors}
        />

        <AddressSection
          addresses={customer.addresses}
          onAdd={addAddress}
          onChange={updateAddress}
          onRemove={removeAddress}
          onPincodeLookup={handlePincodeLookup}
          errors={errors}
        />

        <CommunicationSection
          communications={customer.communications}
          onAdd={addCommunication}
          onChange={updateCommunication}
          onRemove={removeCommunication}
          errors={errors}
        />

        <div className="form-actions-bar">
          <Link to="/" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditMode
                ? "Updating Customer..."
                : "Saving Customer..."
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