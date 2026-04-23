import { useEffect, useState } from "react";
import { LayoutDashboard, MessageCircle, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Layout({ children }: any) {
    const [dark, setDark] = useState(false);
    const location = useLocation();

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
                <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-sm text-gray-400">User</span>

                    <button
                        onClick={toggleDark}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                    >
                        {dark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
                {children}
            </div>
        </div>
    );
}