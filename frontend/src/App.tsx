import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";

import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";

import { ToastProvider } from "@/context/ToastContext";

function App() {
  return (
    <ToastProvider> {/* ✅ WRAP EVERYTHING */}
      <BrowserRouter>
        <Routes>
          {/* 🔓 Guest Routes */}
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          {/* 🔐 Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;