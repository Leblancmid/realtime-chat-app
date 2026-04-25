import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";
import Toast from "@/components/ui/Toast";

import type { RegisterForm } from "@/types";

type Errors = {
    [key: string]: string[];
};

export default function Register() {
    const { fetchUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterForm>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setErrors({});
            setLoading(true);

            await api.get("/sanctum/csrf-cookie");

            await api.post("/register", form);

            await api.post("/login", {
                email: form.email,
                password: form.password,
            });

            await fetchUser();

            setToast({ message: "Account created 🎉", type: "success" });

            setTimeout(() => navigate("/dashboard"), 800);
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setToast({ message: "Something went wrong", type: "error" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
            <form
                onSubmit={handleRegister}
                className="w-[400px] bg-[#020817] border border-gray-800 rounded-2xl p-8 shadow-xl"
            >
                {/* HEADER */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold">
                        Create account
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Join and start chatting
                    </p>
                </div>

                {/* NAME */}
                <div className="mb-3">
                    <input
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    {errors.name && (
                        <p className="text-red-400 text-xs mt-1">
                            {errors.name[0]}
                        </p>
                    )}
                </div>

                {/* EMAIL */}
                <div className="mb-3">
                    <input
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    {errors.email && (
                        <p className="text-red-400 text-xs mt-1">
                            {errors.email[0]}
                        </p>
                    )}
                </div>

                {/* PASSWORD */}
                <div className="relative mb-3">
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
                        {showPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>

                    {errors.password && (
                        <p className="text-red-400 text-xs mt-1">
                            {errors.password[0]}
                        </p>
                    )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative mb-4">
                    <input
                        type={showConfirm ? "text" : "password"}
                        name="password_confirmation"
                        placeholder="Confirm Password"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-2.5 text-gray-400"
                    >
                        {showConfirm ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                {/* BUTTON */}
                <button
                    disabled={loading}
                    className={`w-full py-2 rounded-lg text-sm transition ${loading
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Creating..." : "Create Account"}
                </button>

                {/* FOOTER */}
                <p className="text-xs text-gray-500 mt-6 text-center">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-blue-400 hover:underline"
                    >
                        Login
                    </a>
                </p>
            </form>

            {/* TOAST */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}