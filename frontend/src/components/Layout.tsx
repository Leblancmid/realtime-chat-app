import { useEffect, useState } from "react";
import { LayoutDashboard, MessageCircle, Moon, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import ProfileModal from "./ProfileModal";

export default function Layout({ children }: any) {
    const navigate = useNavigate();
    const [dark, setDark] = useState(false);
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const saved = localStorage.getItem("dark");
        if (saved === "true") {
            setDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleDark = () => {
        const newDark = !dark;
        setDark(newDark);

        document.documentElement.classList.toggle("dark", newDark);
        localStorage.setItem("dark", String(newDark));
    };

    const navItem = (path: string) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${location.pathname === path
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`;

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* SIDEBAR */}
            <div className="w-64 bg-[#020817] border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                        M
                    </div>
                    <span className="ml-3 font-semibold text-lg">
                        My App
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/dashboard" className={navItem("/dashboard")}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </a>

                    <a href="/chat" className={navItem("/chat")}>
                        <MessageCircle size={18} />
                        Chat
                    </a>
                </nav>



                {/* Bottom section */}
                <div className="p-4 border-t border-gray-800">
                    <div className="relative">
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-3 w-full hover:bg-gray-800 p-2 rounded-lg transition"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm">{user?.name?.[0]}</span>
                                )}
                            </div>

                            {/* Name */}
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-gray-400">Online</p>
                            </div>
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute bottom-14 left-0 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                                <button
                                    onClick={() => {
                                        setOpen(false); // close dropdown
                                        setOpenProfile(true);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                >
                                    Profile
                                </button>

                                <button
                                    onClick={async () => {
                                        await logout();
                                        navigate("/login");
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                >
                                    Logout
                                </button>

                                <div className="border-t border-gray-700" />

                                <button
                                    onClick={toggleDark}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-700"
                                >
                                    {dark ? <Sun size={14} /> : <Moon size={14} />}
                                    Toggle Theme
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
                {children}
            </div>

            {/* 🔥 PROFILE MODAL */}
            {openProfile && (
                <ProfileModal onClose={() => setOpenProfile(false)} />
            )}
        </div>
    );
}