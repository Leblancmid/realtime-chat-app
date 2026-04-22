import { useEffect } from "react";
import { api } from "./api/axios";

function App() {
  useEffect(() => {
    const testAuth = async () => {
      try {
        // 1. Get CSRF cookie
        await api.get("/sanctum/csrf-cookie");
        console.log(document.cookie);

        // Register
        await api.post("/api/register", {
          name: "Test User",
          email: "test4@example.com",
          password: "password",
        });

        // Login
        await api.post("/api/login", {
          email: "test4@example.com",
          password: "password",
        });

        // Get user
        const res = await api.get("/api/user");

      } catch (err) {
        console.error(err);
      }
    };

    testAuth();
  }, []);

  return <h1>Testing Auth...</h1>;
}

export default App;