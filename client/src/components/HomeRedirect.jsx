// components/HomeRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HomePage from "../pages/HomePage";

const HomeRedirect = () => {
  const { user } = useAuth(); // or isAuthenticated

  if (user) {
    return <Navigate to="/city-map" replace />;
  }

  return <HomePage />;
};

export default HomeRedirect;
