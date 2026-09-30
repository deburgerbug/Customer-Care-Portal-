import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTicketById, addComment, updateTicketStatus, assignTicket } from "../../services/ticketAPI";
import { getEmployees } from "../../services/userAPI";
import HasPermission from "../../components/HasPermission.jsx";
import { PERMISSIONS } from "../../config/permissions.js";

/**
 * TicketDetailsPage — Shared view for viewing a specific ticket and its communication thread.
 * Routes: /customer/support/:id, /employee/support/:id, /admin/support/:id
 * Allows customers to chat with staff. Allows staff to reply, leave internal notes, 
 * and update the ticket status.
 */
export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment form state
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaff = user.role === "admin" || user.role === "employee";
  const basePath = user.role === "customer" ? "/customer" : `/${user.role}`;

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchTicket();
    if (user.role === "admin") {
      getEmployees().then(res => setEmployees(res.data || [])).catch(err => console.error(err));
    }
  }, [id]);

  async function fetchTicket() {
    try {
      setIsLoading(true);
      const res = await getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      setError(err.message || "Failed to load ticket details");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    try {
      const res = await updateTicketStatus(id, newStatus);
      setTicket(prev => ({ ...prev, status: res.data.status }));
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  }

  async function handleAssignTicket(e) {
    const employeeId = e.target.value;
    try {
      const res = await assignTicket(id, employeeId);
      setTicket(prev => ({ ...prev, assignedTo: res.data.assignedTo }));
    } catch (err) {
      alert(err.message || "Failed to assign ticket");
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await addComment(id, { text: newComment, isInternal });
      setTicket(res.data);
      setNewComment("");
      setIsInternal(false);
    } catch (err) {
      alert(err.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center mt-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-4">
          <p className="font-bold">{error || "Ticket not found"}</p>
        </div>
        <Link to={`${basePath}/support`} className="text-blue-600 font-semibold hover:underline">
          &larr; Back to Support Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to={`${basePath}/support`}
          className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition"
        >
          &larr;
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{ticket.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${ticket.status === 'open' ? 'bg-green-100 text-green-800 border-green-200' :
                ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Ticket ID: {ticket._id} &bull; Created: {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Description + Comments) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Request */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 mb-4">
              Original Request
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Comments Thread */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 mb-6">
              Communication Thread
            </h3>

            <div className="space-y-6 mb-8">
              {ticket.comments?.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">No comments yet.</p>
              ) : (
                ticket.comments.map((comment) => {
                  const isOwnComment = comment.userId?._id === user._id || comment.userId === user._id;

                  return (
                    <div key={comment._id} className={`flex ${isOwnComment ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${comment.isInternal
                          ? 'bg-yellow-50 border border-yellow-200'
                          : isOwnComment
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold ${isOwnComment ? 'text-blue-100' : 'text-gray-900'}`}>
                            {comment.userId?.name || "User"} {comment.isInternal && "(Internal Note)"}
                          </span>
                          <span className={`text-[10px] ${isOwnComment ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-sm whitespace-pre-wrap ${isOwnComment ? 'text-white' : 'text-gray-700'}`}>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Add Comment Form */}
            {ticket.status !== "closed" && (user.role !== "employee" || ticket.assignedTo?._id === (user.id || user._id) || user.role === "admin") ? (
              <form onSubmit={handleAddComment} className="border-t border-gray-100 pt-6 mt-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your message here..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition resize-y mb-3"
                  required
                ></textarea>
                <div className="flex items-center justify-between">
                  <HasPermission required={PERMISSIONS.TICKET_INTERNAL_COMMENT}>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      Internal Note (Hidden from customer)
                    </label>
                  </HasPermission>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            ) : ticket.status !== "closed" && user.role === "employee" && (
              <div className="border-t border-gray-100 pt-6 mt-6 text-center">
                <p className="text-sm text-gray-500 italic">You must be assigned to this ticket to add comments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Ticket Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                {/* Check if user has permission AND meets the scope rule (is admin or is assigned) */}
                {(user.permissions?.includes("*") || ticket.assignedTo?._id === (user.id || user._id)) ? (
                  <HasPermission required={PERMISSIONS.TICKET_UPDATE}>
                    <select
                      value={ticket.status}
                      onChange={handleStatusChange}
                      className="w-full text-sm font-semibold p-2 border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </HasPermission>
                ) : (
                  <p className="text-sm font-semibold capitalize text-gray-900">{ticket.status}</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <p className="text-sm font-semibold capitalize text-gray-900">{ticket.priority}</p>
              </div>

              {isStaff && ticket.customerId && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <Link to={`/admin/customers/${ticket.customerId._id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    {ticket.customerId.firstName} {ticket.customerId.lastName}
                  </Link>
                </div>
              )}

              <HasPermission required={PERMISSIONS.TICKET_ASSIGN}>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Assigned Agent</p>
                  <select
                    value={ticket.assignedTo?._id || ""}
                    onChange={handleAssignTicket}
                    className="w-full text-sm font-semibold p-2 border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </HasPermission>

              {!user.permissions?.includes("*") && !user.permissions?.includes(PERMISSIONS.TICKET_ASSIGN) && ticket.assignedTo && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Assigned Agent</p>
                  <p className="text-sm font-semibold text-gray-900">{ticket.assignedTo.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
