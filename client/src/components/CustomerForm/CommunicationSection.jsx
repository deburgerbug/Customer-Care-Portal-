import CommunicationCard from "./CommunicationCard";

/**
 * CommunicationSection — Container for all communication cards (primary + secondaries)
 *
 * Used in: CustomerForm.jsx — renders below AddressSection
 *
 * Props:
 *  - communications: array of communication objects from customer state
 *  - onAdd: callback to add a new secondary communication entry
 *  - onChange: callback passed down to each CommunicationCard for field changes
 *  - onRemove: callback passed down to each CommunicationCard for removing a secondary entry
 *  - errors: validation errors object (e.g. { communications: "...", "mobile-0": "..." })
 *
 * This component is a thin wrapper — the actual form fields are inside CommunicationCard.jsx
 * Structure mirrors AddressSection.jsx exactly (same layout pattern)
 */
function CommunicationSection({ communications, onAdd, onChange, onRemove, errors = {} }) {
  return (
    // Card wrapper — same style as AddressSection
    <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm">

      {/* Header row — title on left, "Add" button on right */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Customer Communication Information</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage primary and secondary contacts</p>
        </div>

        {/* Button to add a new secondary communication card */}
        <button
          type="button"
          className="px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-md bg-transparent hover:bg-blue-50 hover:border-blue-600 transition"
          onClick={onAdd}
        >
          + Add Secondary
        </button>
      </div>

      {/* Error banner — shows if no communications exist (validation: "At least one communication is required") */}
      {errors.communications && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
          {errors.communications}
        </div>
      )}

      {/* Stack of communication cards — one per entry (primary first, then secondaries) */}
      <div className="flex flex-col gap-4">
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