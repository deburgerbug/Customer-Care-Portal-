export async function getPincodeDetails(pincode) {
  const response = await fetch(
    `https://api.postalpincode.in/pincode/${pincode}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pincode details");
  }

  const data = await response.json();

  if (
    !Array.isArray(data) ||
    data[0]?.Status !== "Success" ||
    !data[0]?.PostOffice?.length
  ) {
    throw new Error("Pincode not found");
  }

  const postOffice = data[0].PostOffice[0];

  return {
    city: postOffice.District,
    state: postOffice.State,
  };
}