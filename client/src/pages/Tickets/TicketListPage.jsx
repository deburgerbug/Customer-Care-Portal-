import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketAPI";
import { getEmployees } from "../../services/userAPI";

/**
 * TicketListPage — Shared view for listing support tickets.
 * Routes: /customer/support, /employee/support, /admin/support
 * Displays a table of tickets. The data returned adapts to the user's role 
 */
export default function TicketListPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [searchParams] = useSearchParams();
  const [assignedFilter, setAssignedFilter] = useState(searchParams.get("assignedTo") || "all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isStaff = user.role === "admin" || user.role === "employee";
  const basePath = user.role === "customer" ? "/customer" : `/${user.role}`;

  useEffect(() => {
    async function fetchTickets() {
      try {
        setIsLoading(true);
        const params = { page, limit: 10 };
        if (assignedFilter !== "all") {
          params.assignedTo = assignedFilter;
        }
        const data = await getTickets(params);
        setTickets(data.tickets || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      } catch (err) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [assignedFilter, page]);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [assignedFilter]);

  useEffect(() => {
    if (isStaff) {
      getEmployees().then(res => setEmployees(res.data || [])).catch(err => console.error(err));
    }
  }, [isStaff]);

  function getStatusColor(status) {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "urgent":
      case "high":
        return "text-red-600 font-bold";
      case "medium":
        return "text-yellow-600 font-semibold";
      case "low":
      default:
        return "text-gray-500";
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Support Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isStaff
              ? "Manage and resolve customer support requests"
              : "View and track your support requests"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isStaff && (
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            >
              <option value="all">All Tickets</option>
              {user.role === "employee" && (
                <option value={user.id || user._id}>Me</option>
              )}
              <option value="unassigned">Others</option>
              {/* <option disabled>──────────</option> */}
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} {emp.ticketCount !== undefined ? `(${emp.ticketCount})` : ''}
                </option>
              ))}
            </select>
          )}

          {user.role === "customer" && (
            <Link
              to={`${basePath}/support/new`}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
            >
              + New Support Ticket
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <p className="text-lg font-medium text-gray-900 mb-1">No tickets found</p>
            <p className="text-sm">
              {isStaff ? "Your queue is empty!" : "You haven't submitted any support requests yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-6 font-semibold">Ticket</th>
                  {isStaff && <th className="py-3 px-6 font-semibold">Customer</th>}
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Priority</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    {isStaff && (
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-700">
                          {ticket.customerId?.firstName} {ticket.customerId?.lastName}
                        </span>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-bold border rounded-full capitalize ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`capitalize ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`${basePath}/support/${ticket._id}`}
                        className="text-blue-600 font-semibold hover:text-blue-800 transition text-sm"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
