import { useAuth } from "../context/AuthContext";

export default function HasPermission({ required, children }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(required)) {
    return null; // Don't render the children if permission is missing
  }

  return children;
}
