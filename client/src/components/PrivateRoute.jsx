import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// DEV BYPASS FLAG (opt-in via VITE_BYPASS_AUTH=true)
const DEV_BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';

const PrivateRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return null; 
  }

  if (DEV_BYPASS_AUTH) {
    return children;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
