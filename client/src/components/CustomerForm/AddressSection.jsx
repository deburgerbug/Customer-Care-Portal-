import AddressCard from "./AddressCard";

/**
 * AddressSection — Container for all address cards (primary + secondaries)
 *
 * Used in: CustomerForm.jsx — renders below BasicInformation
 *
 * Props:
 *  - addresses: array of address objects from customer state
 *  - onAdd: callback to add a new secondary address
 *  - onChange: callback passed down to each AddressCard for field changes
 *  - onRemove: callback passed down to each AddressCard for removing a secondary address
 *  - onPincodeLookup: callback to auto-fill city/state from pincode (India only)
 *  - errors: validation errors object (e.g. { addresses: "...", "address-0": "..." })
 *
 * This component is a thin wrapper — the actual form fields are inside AddressCard.jsx
 */
function AddressSection({ addresses, onAdd, onChange, onRemove, onPincodeLookup, errors = {} }) {
  return (
    // Card wrapper — same style as BasicInformation section
    <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm">

      {/* Header row — title on left, "Add" button on right */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Customer Residence Information</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage primary and secondary addresses</p>
        </div>

        {/* Button to add a new secondary address card */}
        <button
          type="button"
          className="px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-md bg-transparent hover:bg-blue-50 hover:border-blue-600 transition"
          onClick={onAdd}
        >
          + Add Secondary
        </button>
      </div>

      {/* Error banner — shows if no addresses exist (validation: "At least one address is required") */}
      {errors.addresses && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
          {errors.addresses}
        </div>
      )}

      {/* Stack of address cards — one per address (primary first, then secondaries) */}
      <div className="flex flex-col gap-4">
        {addresses.map((address, index) => (
          <AddressCard
            key={address.id}
            address={address}
            index={index}
            onChange={onChange}
            onRemove={onRemove}
            onPincodeLookup={onPincodeLookup}
            errors={errors}
          />
        ))}
      </div>
    </section>
  );
}

export default AddressSection;