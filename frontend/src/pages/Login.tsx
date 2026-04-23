import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "../api/axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

type LoginForm = {
    email: string;
    password: string;
};

export default function Login() {

    const { fetchUser } = useAuth();

    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [error, setError] = useState<string>("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setError("");

            await api.get("/sanctum/csrf-cookie");

            await api.post("/login", form);
            await fetchUser();

            alert("Logged in!");

            navigate("/dashboard");
        } catch {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-6 rounded shadow-md w-80"
            >
                <h2 className="text-xl font-bold mb-4">Login</h2>

                <input
                    name="email"
                    placeholder="Email"
                    className="w-full mb-3 p-2 border rounded"
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full mb-3 p-2 border rounded"
                    onChange={handleChange}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button className="w-full bg-blue-500 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}