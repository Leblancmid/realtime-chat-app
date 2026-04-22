// src/App.tsx
import { useEffect } from "react";
import { api } from "./api/axios";

function App() {
  useEffect(() => {
    api.get("/user")
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }, []);

  return <h1 className="text-2xl">Chat App</h1>;
}

export default App;