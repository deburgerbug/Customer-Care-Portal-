import CountryCodeDropdown from "./CountryCodeDropdown.jsx";
import { isIndia as checkIsIndia } from "../../constants/countries.js";

/**
 * CommunicationCard — Single card for entering contact information (Country Code, Mobile, Email)
 *
 * Used in: CommunicationSection.jsx (mapped over customer.communications array)
 *
 * Props:
 *  - communication: { id, type: 'primary' | 'secondary', countryCode, mobile, email }
 *  - index: position in communications array (0 = primary, 1+ = secondary)
 *  - onChange: callback fired when any field in this card updates (id, event)
 *  - onRemove: callback fired when user clicks "Remove" on a secondary card (id)
 *  - errors: object with field-level errors (e.g. { "mobile-0": "...", "email-0": "..." })
 *
 * Design / Behavior:
 *  - Visual hierarchy: Primary card has blue left accent; Secondary cards have gray left accent
 *  - Primary card cannot be deleted; Secondary cards render a "Remove" button
 *  - Enforces 10-digit limit when India (+91) is selected; up to 15 digits for international
 */
function CommunicationCard({
  communication,
  index,
  onChange,
  onRemove,
  errors = {},
}) {
  const isPrimary = communication.type === "primary";

  // Extract per-card field error messages using the array index
  const countryCodeError = errors[`countryCode-${index}`];
  const mobileError = errors[`mobile-${index}`];
  const emailError = errors[`email-${index}`];

  const currentCountryCode = communication.countryCode || "+91";
  const isIndia = checkIsIndia(currentCountryCode);

  // Reusable Tailwind classes for inputs (mirrors AddressCard.jsx)
  const baseInput =
    "w-full px-3 py-2.5 border rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition";
  const errorBorder = "border-red-500 bg-red-50";
  const normalBorder = "border-gray-200";

  return (
    // Card container — blue left border for primary, gray for secondary
    <div
      className={`border rounded-lg p-4 ${
        isPrimary
          ? "border-l-4 border-l-blue-600 bg-white"
          : "border-l-4 border-l-gray-400 bg-gray-50"
      }`}
    >
      {/* Card header — badge on left, remove button on right (secondary only) */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-dashed border-gray-200">
        {/* Primary/Secondary badge */}
        <span
          className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            isPrimary
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {isPrimary ? "Primary Communication" : `Secondary Contact #${index}`}
        </span>

        {/* Remove button — only shown for secondary communications (primary cannot be removed) */}
        {!isPrimary && (
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-600 hover:text-white transition"
            title="Remove secondary communication"
            onClick={() => onRemove(communication.id)}
          >
            &minus; Remove
          </button>
        )}
      </div>

      {/* Form fields grid — responsive: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Country Code dropdown */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`countryCode-${communication.id}`}
            className="text-sm font-semibold text-gray-700"
          >
            Country Code *
          </label>
          <CountryCodeDropdown
            id={`countryCode-${communication.id}`}
            value={currentCountryCode}
            onChange={(newCode) => {
              onChange(communication.id, {
                target: { name: "countryCode", value: newCode },
              });
            }}
            error={countryCodeError}
          />
          {countryCodeError && (
            <span className="text-xs font-medium text-red-600">
              {countryCodeError}
            </span>
          )}
        </div>

        {/* Mobile Number field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`mobile-${communication.id}`}
            className="text-sm font-semibold text-gray-700"
          >
            Mobile Number *
          </label>
          <input
            id={`mobile-${communication.id}`}
            name="mobile"
            type="tel"
            inputMode="numeric"
            maxLength={isIndia ? 10 : 15}
            placeholder={isIndia ? "10-digit mobile number" : "Mobile number"}
            value={communication.mobile}
            onChange={(event) => onChange(communication.id, event)}
            className={`${baseInput} ${
              mobileError ? errorBorder : normalBorder
            }`}
          />
          {mobileError && (
            <span className="text-xs font-medium text-red-600">
              {mobileError}
            </span>
          )}
        </div>

        {/* Email Address field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`email-${communication.id}`}
            className="text-sm font-semibold text-gray-700"
          >
            Email Address *
          </label>
          <input
            id={`email-${communication.id}`}
            name="email"
            type="email"
            placeholder="example@domain.com"
            value={communication.email}
            onChange={(event) => onChange(communication.id, event)}
            className={`${baseInput} ${
              emailError ? errorBorder : normalBorder
            }`}
          />
          {emailError && (
            <span className="text-xs font-medium text-red-600">
              {emailError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunicationCard;