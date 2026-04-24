import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";

import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";

function App() {
  return (
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

        {/* 🔐 Protected Routes (grouped) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 🔁 Redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* ❌ 404 fallback */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;