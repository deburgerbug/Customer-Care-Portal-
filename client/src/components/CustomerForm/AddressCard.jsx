/**
 * AddressCard — Single address form card (primary or secondary)
 *
 * Used in: AddressSection.jsx — one card rendered per address in the addresses array
 *
 * Props:
 *  - address: single address object { id, type, address, pincode, city, state, country }
 *  - index: position in the addresses array (used for error keys and badge label)
 *  - onChange: callback → (addressId, event) — updates field in CustomerForm state
 *  - onRemove: callback → (addressId) — removes this secondary address (hidden for primary)
 *  - onPincodeLookup: callback → (addressId, pincode) — auto-fills city/state from Indian postal API
 *  - errors: validation errors object (e.g. { "address-0": "Required", "pincode-0": "Required" })
 *
 * Primary vs Secondary:
 *  - Primary: blue left border, "Primary Address" badge, no remove button
 *  - Secondary: gray left border, "Secondary Address #N" badge, has remove button
 */
function AddressCard({ address, index, onChange, onRemove, onPincodeLookup, errors = {} }) {
  const isPrimary = address.type === "primary";

  // Extract per-field errors using the index (matches keys set in customerValidation.js)
  const addressError = errors[`address-${index}`];
  const pincodeError = errors[`pincode-${index}`];
  const cityError = errors[`city-${index}`];
  const stateError = errors[`state-${index}`];
  const countryError = errors[`country-${index}`];

  // Reusable Tailwind classes for inputs
  const baseInput = "w-full px-3 py-2 border rounded-md bg-white text-gray-900 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition";
  const errorBorder = "border-red-500 bg-red-50";
  const normalBorder = "border-gray-200";
  // Read-only fields (city, state) — grayed out, not editable
  const readonlyInput = "w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm cursor-not-allowed outline-none";

  return (
    // Card container — blue left border for primary, gray for secondary
    <div className={`border rounded-lg p-4 ${isPrimary ? "border-l-4 border-l-blue-600 bg-white" : "border-l-4 border-l-gray-400 bg-gray-50"}`}>

      {/* Card header — badge on left, remove button on right (secondary only) */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-gray-200">
        {/* Primary/Secondary badge */}
        <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full
          ${isPrimary
            ? "bg-blue-50 text-blue-600 border border-blue-200"
            : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {isPrimary ? "Primary Address" : `Secondary Address #${index}`}
        </span>

        {/* Remove button — only shown for secondary addresses (primary cannot be removed) */}
        {!isPrimary && (
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-600 hover:text-white transition"
            title="Remove secondary address"
            onClick={() => onRemove(address.id)}
          >
            &minus; Remove
          </button>
        )}
      </div>

      {/* Form fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">

        {/* Address field — spans full width of the grid */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
          <label htmlFor={`address-${address.id}`} className="text-xs font-semibold text-gray-700">Address *</label>
          <input
            id={`address-${address.id}`}
            name="address"
            type="text"
            placeholder="Flat / House no, street, locality"
            value={address.address}
            onChange={(event) => onChange(address.id, event)}
            className={`${baseInput} ${addressError ? errorBorder : normalBorder}`}
          />
          {addressError && <span className="text-xs font-medium text-red-600">{addressError}</span>}
        </div>

        {/* Pincode field — triggers auto-fill on blur (onPincodeLookup) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`pincode-${address.id}`} className="text-xs font-semibold text-gray-700">
            Pincode * <small className="font-normal text-gray-500">(Auto-fetches City/State)</small>
          </label>
          <input
            id={`pincode-${address.id}`}
            name="pincode"
            type="text"
            placeholder="6-digit PIN code"
            maxLength={6}
            value={address.pincode}
            onChange={(event) => onChange(address.id, event)}
            onBlur={() => onPincodeLookup(address.id, address.pincode)}
            className={`${baseInput} ${pincodeError ? errorBorder : normalBorder}`}
          />
          {pincodeError && <span className="text-xs font-medium text-red-600">{pincodeError}</span>}
        </div>

        {/* City field — read-only, auto-filled by pincode lookup */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`city-${address.id}`} className="text-xs font-semibold text-gray-700">City / District *</label>
          <input
            id={`city-${address.id}`}
            name="city"
            type="text"
            placeholder="Auto-filled via Pincode"
            value={address.city}
            readOnly
            className={`${readonlyInput} ${cityError ? errorBorder : ""}`}
          />
          {cityError && <span className="text-xs font-medium text-red-600">{cityError}</span>}
        </div>

        {/* State field — read-only, auto-filled by pincode lookup */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`state-${address.id}`} className="text-xs font-semibold text-gray-700">State *</label>
          <input
            id={`state-${address.id}`}
            name="state"
            type="text"
            placeholder="Auto-filled via Pincode"
            value={address.state}
            readOnly
            className={`${readonlyInput} ${stateError ? errorBorder : ""}`}
          />
          {stateError && <span className="text-xs font-medium text-red-600">{stateError}</span>}
        </div>

        {/* Country field — editable text input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`country-${address.id}`} className="text-xs font-semibold text-gray-700">Country *</label>
          <input
            id={`country-${address.id}`}
            name="country"
            type="text"
            placeholder="Country (e.g. India)"
            value={address.country}
            onChange={(event) => onChange(address.id, event)}
            className={`${baseInput} ${countryError ? errorBorder : normalBorder}`}
          />
          {countryError && <span className="text-xs font-medium text-red-600">{countryError}</span>}
        </div>
      </div>
    </div>
  );
}

export default AddressCard;