import AddressCard from "./AddressCard";

function AddressSection({ addresses, onAdd, onChange, onRemove, onPincodeLookup, errors = {} }) {
  return (
    <section className="form-card">
      <div className="card-header flex-header">
        <div>
          <h2>Customer Residence Information</h2>
          <p className="section-subtitle">Manage primary and secondary addresses</p>
        </div>

        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAdd}>
          + Add Secondary Address
        </button>
      </div>

      {errors.addresses && <div className="error-banner">{errors.addresses}</div>}

      <div className="sub-cards-container">
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