import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "../api/axios";

type LoginForm = {
    email: string;
    password: string;
};

export default function Login() {
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

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setError("");

            await api.get("/sanctum/csrf-cookie");

            await api.post("/login", form);

            alert("Logged in!");
        } catch {
            setError("Invalid credentials");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <input name="email" placeholder="Email" onChange={handleChange} />
            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
            />

            {error && <p>{error}</p>}

            <button type="submit">Login</button>
        </form>
    );
}