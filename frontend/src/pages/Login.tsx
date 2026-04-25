import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "../api/axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/context/ToastContext";

import type { LoginForm } from "@/types";

export default function Login() {
    const { fetchUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const { showToast } = useToast();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);

            await api.get("/sanctum/csrf-cookie");

            await api.post("/login", {
                ...form,
                remember,
            });

            const res = await api.get("/api/user");

            showToast(`Welcome back, ${res.data.name} `, "success");

            await fetchUser();

            setTimeout(() => navigate("/dashboard"), 800);
        } catch {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
            <form
                onSubmit={handleLogin}
                className="w-[380px] bg-[#020817] border border-gray-800 rounded-2xl p-8 shadow-xl"
            >
                {/* HEADER */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold">Welcome back</h1>
                    <p className="text-gray-400 text-sm">
                        Login to your account
                    </p>
                </div>

                {/* EMAIL */}
                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full mb-4 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                />

                {/* PASSWORD */}
                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* REMEMBER */}
                <div className="flex items-center justify-between text-sm mb-4">
                    <label className="flex items-center gap-2 text-gray-400">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={() => setRemember(!remember)}
                        />
                        Remember me
                    </label>

                    <span className="text-blue-400 cursor-pointer hover:underline">
                        Forgot?
                    </span>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                        {error}
                    </div>
                )}

                {/* LOGIN BUTTON */}
                <button
                    disabled={loading}
                    className={`w-full py-2 rounded-lg text-sm transition ${loading
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {/* DIVIDER */}
                <div className="my-5 flex items-center gap-3 text-gray-500 text-xs">
                    <div className="flex-1 h-px bg-gray-700" />
                    OR
                    <div className="flex-1 h-px bg-gray-700" />
                </div>

                {/* SOCIAL BUTTONS (UI only) */}
                <div className="space-y-2">
                    <button className="w-full bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm">
                        Continue with Google
                    </button>
                    <button className="w-full bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm">
                        Continue with GitHub
                    </button>
                </div>

                {/* FOOTER */}
                <p className="text-xs text-gray-500 mt-6 text-center">
                    Don’t have an account?{" "}
                    <a href="/register" className="text-blue-400 hover:underline">
                        Register
                    </a>
                </p>
            </form>
        </div>
    );
}