import { useEffect, useState } from "react";

export default function Layout({ children }: any) {
    const [dark, setDark] = useState(false);

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

        if (newDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        localStorage.setItem("dark", String(newDark));
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* LEFT ICON SIDEBAR (Discord style) */}
            <div className="w-16 bg-[#020817] flex flex-col items-center py-4 gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center font-bold">
                    M
                </div>

                <div className="w-10 h-10 rounded-2xl bg-gray-700 hover:bg-blue-500 flex items-center justify-center cursor-pointer transition">
                    💬
                </div>

                <div className="w-10 h-10 rounded-2xl bg-gray-700 hover:bg-green-500 flex items-center justify-center cursor-pointer transition">
                    📊
                </div>
            </div>

            {/* MAIN SIDEBAR */}
            <div className="w-64 bg-[#020817] border-r border-gray-800 flex flex-col">
                <div className="p-4 font-bold text-lg border-b border-gray-800">
                    My App
                </div>

                <nav className="flex-1 p-3 space-y-2">
                    <a
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 transition"
                    >
                        📊 Dashboard
                    </a>

                    <a
                        href="/chat"
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 transition"
                    >
                        💬 Chat
                    </a>
                </nav>

                {/* Bottom user / actions */}
                <div className="p-4 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-sm text-gray-400">User</span>

                    <button
                        onClick={toggleDark}
                        className="bg-gray-700 px-2 py-1 rounded text-xs"
                    >
                        {dark ? "☀️" : "🌙"}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col">
                {/* HEADER */}
                <div className="h-14 px-6 flex items-center justify-between border-b border-gray-800 bg-[#020817]">
                    <h2 className="font-semibold text-lg">Dashboard</h2>
                </div>

                {/* CONTENT */}
                <div className="flex-1 p-6 overflow-y-auto bg-[#0f172a]">
                    {children}
                </div>
            </div>
        </div>
    );
}