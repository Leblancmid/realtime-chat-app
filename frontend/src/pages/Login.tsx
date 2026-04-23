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
                className="bg-white p-8 rounded-xl shadow-lg w-80"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Login
                </h2>

                <input
                    name="email"
                    placeholder="Email"
                    className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                />

                {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition">
                    Login
                </button>
            </form>
        </div>
    );
}