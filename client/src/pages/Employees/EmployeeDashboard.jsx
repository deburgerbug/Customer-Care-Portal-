import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTickets } from "../../services/ticketAPI.js";

function EmployeeDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ assignedTickets: 0 });
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
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Assigned Tickets
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {metrics.assignedTickets}
            </p>
            <Link
              to={`/employee/support?assignedTo=${employeeId}`}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              View tickets →
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Quick Actions
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link
                to="/employee/customers"
                className="text-sm text-gray-700 hover:text-blue-700"
              >
                Open customers →
              </Link>
              <Link
                to="/employee/support"
                className="text-sm text-gray-700 hover:text-blue-700"
              >
                Open support →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
