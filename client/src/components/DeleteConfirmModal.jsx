import React, { useEffect } from "react";

function DeleteConfirmModal({
  isOpen,
  title = "Delete Customer",
  customerName = "this customer",
  onConfirm,
  onCancel,
  isDeleting = false,
}) {
  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={!isDeleting ? onCancel : undefined}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-icon-wrapper">
          <div className="modal-icon-danger">&#128465;</div>
        </div>

        <div className="modal-content">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <p className="modal-description">
            Are you sure you want to delete <strong>{customerName}</strong>?
          </p>
          <div className="modal-warning-box">
            <span className="warning-icon">&#9888;</span>
            <span>
              This will permanently delete this customer record, including all addresses and communication contacts. This action cannot be undone.
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting Permanently..." : "Yes, Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
