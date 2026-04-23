import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-4">
                <h2 className="text-xl font-bold mb-6">My App</h2>

                <nav className="flex flex-col gap-3">
                    <Link to="/dashboard" className="hover:text-blue-500">
                        Dashboard
                    </Link>
                </nav>
            </aside>

            {/* Main */}
            <div className="flex-1">
                {/* Topbar */}
                <header className="bg-white shadow p-4 flex justify-between">
                    <span>Welcome {user?.name}</span>
                    <button
                        onClick={logout}
                        className="text-red-500 hover:underline"
                    >
                        Logout
                    </button>
                </header>

                {/* Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}