import { isValidEmail } from "./emailValidation.js";

export function validateCustomer(customer) {
  const errors = {};

  const firstName = (customer?.firstName || "").trim();
  if (!firstName) {
    errors.firstName = "First name is required";
  }

  const lastName = (customer?.lastName || "").trim();
  if (!lastName) {
    errors.lastName = "Last name is required";
  }

  if (!customer?.gender) {
    errors.gender = "Gender is required";
  }

  if (!customer?.dob) {
    errors.dob = "Date of birth is required";
  } else {
    const selectedDate = new Date(customer.dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      errors.dob = "Date of birth cannot be in the future";
    }
  }

  const addresses = customer?.addresses || [];
  if (addresses.length === 0) {
    errors.addresses = "At least one address is required";
  }

  addresses.forEach((address, index) => {
    if (!(address?.address || "").trim()) {
      errors[`address-${index}`] = "Address is required";
    }

    if (!(address?.pincode || "").trim()) {
      errors[`pincode-${index}`] = "Pincode is required";
    }

    if (!(address?.city || "").trim()) {
      errors[`city-${index}`] = "City is required";
    }

    if (!(address?.state || "").trim()) {
      errors[`state-${index}`] = "State is required";
    }

    if (!(address?.country || "").trim()) {
      errors[`country-${index}`] = "Country is required";
    }
  });

  const communications = customer?.communications || [];
  if (communications.length === 0) {
    errors.communications = "At least one communication is required";
  }

  communications.forEach((communication, index) => {
    const countryCode = (communication?.countryCode || communication?.countrycode || "").trim();
    if (!countryCode) {
      errors[`countryCode-${index}`] = "Country code is required";
    }

    const mobile = (communication?.mobile || "").trim();
    const isIndia = countryCode === "+91";

    if (!mobile) {
      errors[`mobile-${index}`] = "Mobile number is required";
    } else if (isIndia) {
      if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
        errors[`mobile-${index}`] = "Mobile number must be exactly 10 digits";
      }
    } else {
      if (!/^\d{6,15}$/.test(mobile)) {
        errors[`mobile-${index}`] = "Mobile number must be between 6 and 15 digits";
      }
    }

    const email = (communication?.email || "").trim();
    if (!isValidEmail(email)) {
      errors[`email-${index}`] = "Enter a valid email address";
    }
  });

  return errors;
}