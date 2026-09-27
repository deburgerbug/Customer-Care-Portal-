import { COUNTRIES } from "../../constants/countries.js";

/**
 * CountryCodeDropdown — Native <select> for picking a country dial code
 *
 * Used in: CommunicationCard.jsx — one per communication entry
 *
 * Props:
 *  - value: currently selected dial code (e.g. "+91")
 *  - onChange: callback that receives the new dial code string
 *  - id: HTML id for the <select> (used for label htmlFor linking)
 *  - error: if truthy, shows red error border styling
 *  - disabled: disables the dropdown
 *
 * Data source: COUNTRIES array from constants/countries.js
 * Each option shows: 🇮🇳 India (+91)
 */
function CountryCodeDropdown({ value = "+91", onChange, id = "country-code-select", error, disabled = false }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      // Normal state: gray border | Error state: red border + red background
      className={`w-full px-3 py-2.5 border rounded-md bg-white text-gray-900 outline-none transition
        focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15
        ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
    >
      {/* Loop through COUNTRIES array to render each option */}
      {COUNTRIES.map((country) => (
        <option key={`${country.code}-${country.dialCode}`} value={country.dialCode}>
          {country.flag} {country.name} ({country.dialCode})
        </option>
      ))}
    </select>
  );
}

export default CountryCodeDropdown;
