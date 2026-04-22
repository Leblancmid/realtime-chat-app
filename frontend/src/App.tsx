import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";

function App() {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      <nav style={{ marginBottom: "20px" }}>
        {!user ? (
          <>
            <Link to="/register">Register</Link> |{" "}
            <Link to="/login">Login</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link> |{" "}
            <button onClick={logout} style={{ marginLeft: "10px" }}>
              Logout
            </button>
          </>
        )}
      </nav>

      {user && <p>Logged in as {user.name}</p>}

      <Routes>
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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;