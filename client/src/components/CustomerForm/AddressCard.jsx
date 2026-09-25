function AddressCard({ address, index, onChange, onRemove, onPincodeLookup, errors = {} }) {
  const isPrimary = address.type === "primary";
  const addressError = errors[`address-${index}`];
  const pincodeError = errors[`pincode-${index}`];
  const cityError = errors[`city-${index}`];
  const stateError = errors[`state-${index}`];
  const countryError = errors[`country-${index}`];

  return (
    <div className={`sub-card ${isPrimary ? "primary-subcard" : "secondary-subcard"}`}>
      <div className="sub-card-header">
        <div className="title-with-badge">
          <span className={`badge ${isPrimary ? "badge-primary" : "badge-secondary"}`}>
            {isPrimary ? "Primary Address" : `Secondary Address #${index}`}
          </span>
        </div>

        {!isPrimary && (
          <button
            type="button"
            className="btn-icon-danger"
            title="Remove secondary address"
            onClick={() => onRemove(address.id)}
          >
            &minus; Remove
          </button>
        )}
      </div>

      <div className="form-grid">
        <div className="form-group span-full">
          <label htmlFor={`address-${address.id}`}>Address *</label>
          <input
            id={`address-${address.id}`}
            name="address"
            type="text"
            placeholder="Flat / House no, street, locality"
            value={address.address}
            onChange={(event) => onChange(address.id, event)}
            className={addressError ? "input-error" : ""}
          />
          {addressError && <span className="error-text">{addressError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`pincode-${address.id}`}>
            Pincode * <small className="hint-text">(Auto-fetches City/State)</small>
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
            className={pincodeError ? "input-error" : ""}
          />
          {pincodeError && <span className="error-text">{pincodeError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`city-${address.id}`}>City / District *</label>
          <input
            id={`city-${address.id}`}
            name="city"
            type="text"
            placeholder="Auto-filled via Pincode"
            value={address.city}
            readOnly
            className={`input-readonly ${cityError ? "input-error" : ""}`}
          />
          {cityError && <span className="error-text">{cityError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`state-${address.id}`}>State *</label>
          <input
            id={`state-${address.id}`}
            name="state"
            type="text"
            placeholder="Auto-filled via Pincode"
            value={address.state}
            readOnly
            className={`input-readonly ${stateError ? "input-error" : ""}`}
          />
          {stateError && <span className="error-text">{stateError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor={`country-${address.id}`}>Country *</label>
          <input
            id={`country-${address.id}`}
            name="country"
            type="text"
            placeholder="Country (e.g. India)"
            value={address.country}
            onChange={(event) => onChange(address.id, event)}
            className={countryError ? "input-error" : ""}
          />
          {countryError && <span className="error-text">{countryError}</span>}
        </div>
      </div>
    </div>
  );
}

export default AddressCard;