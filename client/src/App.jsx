import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CityMap from './pages/CityMap';
import IntersectionDashboard from './pages/IntersectionDashboard';
import Reports from './pages/Reports';
import Monitoring from './pages/Monitoring';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import HomeRedirect from "./components/HomeRedirect";
import AboutUs from "./pages/AboutUs";
import Help from "./pages/Help";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/help" element={<Help />} />
      <Route path="/city-map" element={<PrivateRoute><CityMap /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/intersection/:id" element={<PrivateRoute><IntersectionDashboard /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/monitoring" element={<PrivateRoute><Monitoring /></PrivateRoute>} />
      <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
    </>
  )
);


function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

