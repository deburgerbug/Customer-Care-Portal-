import CommunicationCard from "./CommunicationCard";

function CommunicationSection({
  communications,
  onAdd,
  onChange,
  onRemove,
  errors = {},
}) {
  return (
    <section className="form-card">
      <div className="card-header flex-header">
        <div>
          <h2>Customer Communication Information</h2>
          <p className="section-subtitle">Manage primary and secondary contacts</p>
        </div>

        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAdd}>
          + Add Secondary Contact
        </button>
      </div>

      {errors.communications && <div className="error-banner">{errors.communications}</div>}

      <div className="sub-cards-container">
        {communications.map((communication, index) => (
          <CommunicationCard
            key={communication.id}
            communication={communication}
            index={index}
            onChange={onChange}
            onRemove={onRemove}
            errors={errors}
          />
        ))}
      </div>
    </section>
  );
}

export default CommunicationSection;