import CustomerForm from "../components/CustomerForm/CustomerForm";

/**
 * CustomerPage — Page-level wrapper for creating and editing customer profiles
 *
 * Routes:
 *  - /customers/new      (Create mode)
 *  - /customers/:id/edit (Edit mode)
 *
 * Used in: App.jsx as a protected route
 *
 * Delegates all form state, pincode lookup, validation, and API interactions to CustomerForm.jsx
 */
function CustomerPage() {
  return (
    // Page wrapper with subtle neutral background
    <main className="min-h-[85vh] bg-gray-50 py-4">
      <CustomerForm />
    </main>
  );
}

export default CustomerPage;