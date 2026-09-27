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
  // Listen for Escape key to close the modal (only when open and not mid-delete)
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    // Backdrop — dark semi-transparent overlay, covers entire screen
    // Clicking the backdrop closes the modal (unless mid-delete)
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
      onClick={!isDeleting ? onCancel : undefined}
    >
      {/* Modal dialog box — white card centered on screen */}
      {/* stopPropagation prevents clicks inside the dialog from triggering backdrop's onCancel */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center border border-gray-200 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Danger icon — red circle with trash icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-3xl">
            &#128465;
          </div>
        </div>

        {/* Modal content — title, description, warning */}
        <div>
          <h3 id="modal-title" className="text-xl font-bold text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600 mt-2">
            Are you sure you want to delete <strong className="text-gray-900 font-bold">{customerName}</strong>?
          </p>

          {/* Warning box — red background with caution message */}
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg mt-5 text-left">
            <span className="text-red-600 text-lg shrink-0">&#9888;</span>
            <span>
              This will permanently delete this customer record, including all addresses and communication contacts. This action cannot be undone.
            </span>
          </div>
        </div>

        {/* Action buttons — Cancel and Delete */}
        <div className="flex gap-3 mt-7 pt-5 border-t border-gray-200">
          {/* Cancel button — secondary style */}
          <button
            type="button"
            className="flex-1 py-2.5 bg-white text-gray-600 font-semibold border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          {/* Delete button — danger style, shows loading text while deleting */}
          <button
            type="button"
            className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
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
