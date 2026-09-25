import { COUNTRIES } from "../../constants/countries.js";

function CountryCodeDropdown({ value = "+91", onChange, id = "country-code-select", error, disabled = false }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={error ? "input-error" : ""}
    >
      {COUNTRIES.map((country) => (
        <option key={`${country.code}-${country.dialCode}`} value={country.dialCode}>
          {country.flag} {country.name} ({country.dialCode})
        </option>
      ))}
    </select>
  );
}

export default CountryCodeDropdown;
