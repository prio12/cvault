// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import Login from "./pages/authentications/Login";
import Register from "./pages/authentications/Register";
import AuthSuccessPage from "./pages/authentications/AuthSuccess";
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-success" element={<AuthSuccessPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="aura">
                <div className="card bg-base-100 p-8">
                  <div className="card-body">
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                      }}
                      className="mt-4 rounded bg-red-600 px-4 py-2 text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
