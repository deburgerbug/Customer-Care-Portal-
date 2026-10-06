import { useEffect } from "react";

/**
 * DeleteConfirmModal — Reusable confirmation popup for deleting a customer
 *
 * Used in: CustomerListPage.jsx (delete from table row)
 *          CustomerDetailsPage.jsx (delete from details view)
 *
 * Props:
 *  - isOpen: boolean — controls visibility
 *  - title: heading text (default: "Delete Customer")
 *  - customerName: name shown in the confirmation message
 *  - onConfirm: callback when user clicks "Yes, Delete Permanently"
 *  - onCancel: callback when user clicks "Cancel", presses Escape, or clicks backdrop
 *  - isDeleting: boolean — disables buttons and shows loading text while API call runs
 *
 * Accessibility:
 *  - role="dialog" + aria-modal for screen readers
 *  - Escape key closes the modal
 *  - Clicking the dark backdrop closes the modal
 *  - e.stopPropagation() on the dialog prevents backdrop click from closing when clicking inside
 */
function DeleteConfirmModal({
  isOpen,
  title = "Delete Customer",
  customerName = "this customer",
  onConfirm,
  onCancel,
  isDeleting = false,
}) {
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
    <div
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"
      onClick={!isDeleting ? onCancel : undefined}
    >
      <div
        className="bg-white rounded-lg w-full max-w-sm p-5 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h3 id="modal-title" className="text-base font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1.5">
          Delete <strong className="text-gray-900">{customerName}</strong>? This
          permanently removes addresses and contacts.
        </p>

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            className="flex-1 py-1.5 text-sm bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-60"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
