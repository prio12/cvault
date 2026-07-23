import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/authentications/Login";
import Register from "./pages/authentications/Register";
import AuthSuccessPage from "./pages/authentications/AuthSuccess";
import Profile from "./pages/Profile";
import Attributes from "./pages/Attributes";
import Positions from "./pages/Positions";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-success" element={<AuthSuccessPage />} />

        <Route path="/positions" element={<Positions />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attributes"
          element={
            <ProtectedRoute>
              <Attributes />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/positions" replace />} />
        <Route path="*" element={<Navigate to="/positions" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
