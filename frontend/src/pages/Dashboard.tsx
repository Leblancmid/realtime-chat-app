import Layout from "@/components/Layout";

export default function Dashboard() {
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-gray-400 text-sm">
                        Welcome back 👋
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-4 hover:bg-gray-800/50 transition">
                        <p className="text-xs text-gray-400 uppercase">
                            Users
                        </p>
                        <h2 className="text-2xl font-bold mt-1">2</h2>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-4 hover:bg-gray-800/50 transition">
                        <p className="text-xs text-gray-400 uppercase">
                            Messages
                        </p>
                        <h2 className="text-2xl font-bold mt-1">120</h2>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-4 hover:bg-gray-800/50 transition">
                        <p className="text-xs text-gray-400 uppercase">
                            Status
                        </p>
                        <h2 className="text-green-400 font-semibold mt-1">
                            ● Online
                        </h2>
                    </div>
                </div>

                {/* Panels */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Chat Panel */}
                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-5">
                        <h2 className="font-semibold mb-2">💬 Chat</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Start a real-time conversation.
                        </p>

                        <a
                            href="/chat"
                            className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm transition"
                        >
                            Open Chat
                        </a>
                    </div>

                    {/* Activity Panel */}
                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-5">
                        <h2 className="font-semibold mb-2">⚡ Activity</h2>

                        <ul className="text-sm text-gray-400 space-y-2">
                            <li className="hover:text-white transition">
                                • New message received
                            </li>
                            <li className="hover:text-white transition">
                                • User came online
                            </li>
                            <li className="hover:text-white transition">
                                • Chat session active
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
}