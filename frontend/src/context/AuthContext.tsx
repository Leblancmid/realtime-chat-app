import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/axios";
import type { User } from "@/types";

type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await api.get("/api/user");
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await api.post("/logout");
        setUser(null);
    };

    useEffect(() => {
        fetchUser(); // run once on app load
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, fetchUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};