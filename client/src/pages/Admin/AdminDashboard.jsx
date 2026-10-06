import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCustomers } from "../../services/customerAPI";
import { getEmployees } from "../../services/userAPI";
import { getTickets } from "../../services/ticketAPI";

function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    totalTickets: 0,
    openTickets: 0,
    urgentTickets: 0,
  });
  const [recentData, setRecentData] = useState({
    customers: [],
    tickets: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const [
          customersRes,
          employeesRes,
          latestTicketsRes,
          openTicketsRes,
          urgentTicketsRes,
        ] = await Promise.all([
          getCustomers({ limit: 5 }),
          getEmployees(),
          getTickets({ limit: 5 }),
          getTickets({ status: "open", limit: 1 }),
          getTickets({ status: "open", priority: "urgent", limit: 1 }),
        ]);

        const employees = employeesRes.data || [];
        
        setMetrics({
          totalCustomers: customersRes.pagination?.totalCount || 0,
          totalEmployees: employees.length,
          activeEmployees: employees.filter((emp) => emp.isActive).length,
          totalTickets: latestTicketsRes.pagination?.totalCount || 0,
          openTickets: openTicketsRes.pagination?.totalCount || 0,
          urgentTickets: urgentTicketsRes.pagination?.totalCount || 0,
        });

        setRecentData({
          customers: customersRes.customers || [],
          tickets: latestTicketsRes.tickets || [],
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  function getStatusColor(status) {
    switch (status) {
      case "open": return "bg-green-100 text-green-800 border-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/customers/new" className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition">
            + Customer
          </Link>
          <Link to="/admin/employees/new" className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
            + Employee
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{metrics.totalCustomers}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Staff</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {metrics.activeEmployees} <span className="text-sm font-normal text-gray-400">/ {metrics.totalEmployees}</span>
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Open Tickets</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{metrics.openTickets}</p>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm bg-red-50/30">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Urgent & Open</p>
              <p className="text-2xl font-semibold text-red-700 mt-1">{metrics.urgentTickets}</p>
            </div>
          </div>

          {/* Activity Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tickets */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-900">Recent Support Tickets</h2>
                <Link to="/admin/support" className="text-xs font-medium text-blue-600 hover:text-blue-800">View All</Link>
              </div>
              <div className="divide-y divide-gray-100 flex-1">
                {recentData.tickets.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No recent tickets.</p>
                ) : (
                  recentData.tickets.map(ticket => (
                    <div key={ticket._id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center">
                      <div className="min-w-0 pr-4">
                        <Link to={`/admin/support/${ticket._id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block">
                          {ticket.title}
                        </Link>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {ticket.customerId?.firstName} {ticket.customerId?.lastName}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-block px-2 py-0.5 text-[10px] font-medium border rounded capitalize ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Customers */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-900">Recently Onboarded Customers</h2>
                <Link to="/admin/customers" className="text-xs font-medium text-blue-600 hover:text-blue-800">View All</Link>
              </div>
              <div className="divide-y divide-gray-100 flex-1">
                {recentData.customers.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No recent customers.</p>
                ) : (
                  recentData.customers.map(customer => (
                    <div key={customer._id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center">
                      <div className="min-w-0">
                        <Link to={`/admin/customers/${customer._id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block">
                          {customer.firstName} {customer.lastName}
                        </Link>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {customer.communications?.[0]?.email}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
