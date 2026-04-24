import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import type { RegisterForm } from "@/types";

type Errors = {
    [key: string]: string[];
};

export default function Register() {
    const [form, setForm] = useState<RegisterForm>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState<Errors>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const { fetchUser } = useAuth();

    const navigate = useNavigate();

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setErrors({});

            await api.get("/sanctum/csrf-cookie");

            await api.post("/register", form);

            await api.post("/login", {
                email: form.email,
                password: form.password,
            });
            await fetchUser();

            alert("Registered & Logged in!");
            navigate("/dashboard");
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                console.error(err);
            }
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h2>Register</h2>

            <input name="name" placeholder="Name" onChange={handleChange} />
            {errors.name && <p>{errors.name[0]}</p>}

            <input name="email" placeholder="Email" onChange={handleChange} />
            {errors.email && <p>{errors.email[0]}</p>}

            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
            />
            {errors.password && <p>{errors.password[0]}</p>}

            <input
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                onChange={handleChange}
            />

            <button type="submit">Register</button>
        </form>
    );
}