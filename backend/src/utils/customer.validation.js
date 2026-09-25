export function validateCustomerData(customerData) {
  if (customerData.dob) {
    const dob = new Date(customerData.dob);
    if (dob > new Date()) {
      throw new Error("Date of birth cannot be in the future");
    }
  }

  const { addresses, communications } = customerData;

  if (!addresses || addresses.length === 0) {
    throw new Error("At least one address is required");
  }

  if (!communications || communications.length === 0) {
    throw new Error("At least one communication record is required");
  }

  const primaryAddresses = addresses.filter(
    (address) => address.type === "primary"
  );

  if (primaryAddresses.length !== 1) {
    throw new Error("Customer must have exactly one primary address");
  }

  const primaryCommunications = communications.filter(
    (communication) => communication.type === "primary"
  );

  if (primaryCommunications.length !== 1) {
    throw new Error(
      "Customer must have exactly one primary communication"
    );
  }

  communications.forEach((comm, idx) => {
    const mobile = (comm?.mobile || "").trim();
    const countryCode = (comm?.countryCode || comm?.countrycode || "+91").trim();
    if (!mobile) {
      throw new Error(`Mobile number in communication #${idx + 1} is required`);
    }

    if (countryCode === "+91") {
      if (!/^\d{10}$/.test(mobile)) {
        throw new Error(
          `Mobile number in communication #${idx + 1} for India (+91) must be exactly 10 digits`
        );
      }
    } else {
      if (!/^\d{6,15}$/.test(mobile)) {
        throw new Error(
          `Mobile number in communication #${idx + 1} must be between 6 and 15 digits`
        );
      }
    }
  });
}