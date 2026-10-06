import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketAPI";
import { getEmployees } from "../../services/userAPI";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

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
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isStaff = user.role === "admin" || user.role === "employee";
  const basePath = user.role === "customer" ? "/customer" : `/${user.role}`;

  useEffect(() => {
    async function fetchTickets() {
      try {
        setIsLoading(true);
        const params = { page, limit: 10 };
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        if (departmentFilter !== "all") {
          params.department = departmentFilter;
        }
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
  }, [assignedFilter, departmentFilter, statusFilter, page]);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [assignedFilter, departmentFilter, statusFilter]);

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

  const colDefs = useMemo(() => {
    const cols = [
      {
        headerName: "Ticket",
        flex: 2,
        filter: true,
        cellRenderer: (params) => (
          <div className="leading-tight py-1.5">
            <p className="font-medium text-gray-900 truncate">{params.data.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {new Date(params.data.createdAt).toLocaleDateString()}
            </p>
          </div>
        )
      }
    ];

    if (isStaff) {
      cols.push({
        headerName: "Customer",
        flex: 1.5,
        filter: true,
        valueGetter: (params) => {
          const cust = params.data.customerId;
          return cust ? `${cust.firstName || ""} ${cust.lastName || ""}` : "—";
        }
      });
      cols.push({
        headerName: "Assigned To",
        flex: 1.5,
        filter: true,
        valueGetter: (params) => {
          const emp = params.data.assignedTo;
          return emp ? emp.name : "Unassigned";
        }
      });
    }

    cols.push({
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded capitalize mt-1.5 ${getStatusColor(
            params.value
          )}`}
        >
          {params.value}
        </span>
      )
    });

    cols.push({
      field: "priority",
      headerName: "Priority",
      flex: 1,
      cellRenderer: (params) => (
        <span className={`capitalize inline-block mt-2 ${getPriorityColor(params.value)}`}>
          {params.value}
        </span>
      )
    });

    cols.push({
      headerName: "Action",
      flex: 0.8,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="mt-1.5">
          <Link
            to={`${basePath}/support/${params.data._id}`}
            className="text-blue-600 font-medium hover:text-blue-800 text-sm"
          >
            View →
          </Link>
        </div>
      )
    });

    return cols;
  }, [isStaff, basePath]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="max-w-5xl h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">
            {isStaff
              ? "Manage customer support requests"
              : "Track your support requests"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.role === "admin" && (
            <>
              {/* Assigned Filter */}
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
              >
                <option value="all">All Tickets</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                    {emp.ticketCount !== undefined ? ` (${emp.ticketCount})` : ""}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
              >
                <option value="all">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Billing">Billing</option>
                <option value="HR">HR</option>
                <option value="Network">Network</option>
                <option value="Management">Management</option>
              </select>
            </>
          )}

          {user.role === "customer" && (
            <Link
              to={`${basePath}/support/new`}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
            >
              + New Ticket
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm shrink-0">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center flex-1 items-center">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
            <p className="text-sm font-medium text-gray-900 mb-0.5">No tickets found</p>
            <p className="text-sm">
              {isStaff
                ? "Your queue is empty."
                : "You haven't submitted any support requests yet."}
            </p>
          </div>
        ) : (
          <div className="ag-theme-quartz w-full h-full">
            <AgGridReact
              rowData={tickets}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              animateRows={true}
            />
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {tickets.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2.5 border border-t-0 border-gray-200 bg-gray-50/60 rounded-b-lg shrink-0 mt-0">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
