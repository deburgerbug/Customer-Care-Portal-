import CountryCodeDropdown from "./CountryCodeDropdown.jsx";
import { isIndia as checkIsIndia } from "../../constants/countries.js";

function CommunicationCard({
  communication,
  index,
  onChange,
  onRemove,
  errors = {},
}) {
  const isPrimary = communication.type === "primary";
  const countryCodeError = errors[`countryCode-${index}`];
  const mobileError = errors[`mobile-${index}`];
  const emailError = errors[`email-${index}`];

  const currentCountryCode = communication.countryCode || "+91";
  const isIndia = checkIsIndia(currentCountryCode);

  return (
    <div className={`sub-card ${isPrimary ? "primary-subcard" : "secondary-subcard"}`}>
      <div className="sub-card-header">
        <div className="title-with-badge">
          <span className={`badge ${isPrimary ? "badge-primary" : "badge-secondary"}`}>
            {isPrimary ? "Primary Communication" : `Secondary Contact #${index}`}
          </span>
        </div>

        {!isPrimary && (
          <button
            type="button"
            className="btn-icon-danger"
            title="Remove secondary communication"
            onClick={() => onRemove(communication.id)}
          >
            &minus; Remove
          </button>
        )}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor={`countryCode-${communication.id}`}>Country Code *</label>
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
          {countryCodeError && <span className="error-text">{countryCodeError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`mobile-${communication.id}`}>Mobile Number *</label>
          <input
            id={`mobile-${communication.id}`}
            name="mobile"
            type="tel"
            inputMode="numeric"
            maxLength={isIndia ? 10 : 15}
            placeholder={isIndia ? "10-digit mobile number" : "Mobile number"}
            value={communication.mobile}
            onChange={(event) => onChange(communication.id, event)}
            className={mobileError ? "input-error" : ""}
          />
          {mobileError && <span className="error-text">{mobileError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`email-${communication.id}`}>Email Address *</label>
          <input
            id={`email-${communication.id}`}
            name="email"
            type="email"
            placeholder="example@domain.com"
            value={communication.email}
            onChange={(event) => onChange(communication.id, event)}
            className={emailError ? "input-error" : ""}
          />
          {emailError && <span className="error-text">{emailError}</span>}
        </div>
      </div>
    </div>
  );
}

export default CommunicationCard;