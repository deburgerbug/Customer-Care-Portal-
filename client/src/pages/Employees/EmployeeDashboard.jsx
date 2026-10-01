import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketAPI.js";

/**
 * EmployeeDashboard — Overview metrics for the Employee role
 * Route: /employee/dashboard
 */
function EmployeeDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    assignedTickets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const employeeId = user?.id || user?._id;

  useEffect(() => {
    async function fetchMetrics() {
      if (!employeeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch tickets assigned to this employee
        const response = await getTickets({ assignedTo: employeeId, limit: 1 });
        setMetrics({
          assignedTickets: response.pagination?.totalCount || 0,
        });
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [employeeId]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Metric Card: Assigned Tickets */}
          <div className="w-40 bg-white border border-gray-500 rounded-md p-4 shadow-lm flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Tickets</p>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{metrics.assignedTickets}</h3>
            </div>
            <div className="mt-2 pt-1 border-t border-gray-100">
              <Link to={`/employee/support?assignedTo=${user.id || user._id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1">
                View &rarr;
              </Link>
            </div>
          </div>


          {/* Call to Action Card */}
          {/* <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-6 shadow-md flex flex-col justify-between text-white">
            <div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Daily Operations</p>
              <h3 className="text-2xl font-bold mt-1">Ready for Outreach?</h3>
              <p className="text-sm text-blue-200 mt-2">Check your assigned customers list to follow up on pending communications and requests.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500/30">
              <Link to="/employee/customers" className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition inline-flex items-center gap-2">
                Start Working
              </Link>
            </div>
          </div> */}

        </div>
      )}

      {/* Recent Activity / Notices Placeholder */}
      {/* <h2 className="text-lg font-bold text-gray-900 mb-4">System Notices</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
            &#128276;
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Portal Update</h4>
            <p className="text-sm text-gray-500 mt-1">The customer management module has been updated. You can now edit secondary addresses for your assigned customers.</p>
            <span className="text-xs text-gray-400 mt-2 block">Today at 9:00 AM</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default EmployeeDashboard;
