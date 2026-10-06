import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTicket } from "../../services/ticketAPI";

/**
 * TicketFormPage — Customer view for creating a new support ticket.
 * Route: /customer/support/new
 * Allows customers to submit a request with a title, description, and priority.
 */
export default function TicketFormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError("Title and description are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await createTicket(formData);
      navigate("/customer/support");
    } catch (err) {
      setError(err.message || "Failed to create support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/customer/support"
          className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-md text-sm"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Support Ticket</h1>
          <p className="text-sm text-gray-500">Describe your issue</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Issue updating my address"
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:ring-1 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:ring-1 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your issue in detail..."
              rows="4"
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:ring-1 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm resize-y"
              required
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
          <Link
            to="/customer/support"
            className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
