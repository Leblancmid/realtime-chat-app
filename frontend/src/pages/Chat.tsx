import { useEffect, useState, useRef } from "react";
import { api } from "@/api/axios";
import echo from "@/echo";
import { useAuth } from "@/context/AuthContext";

type User = {
    id: number;
    name: string;
    email: string;
    is_online?: boolean;
};

type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: string;
    seen?: boolean;
};

export default function Chat() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [typingUser, setTypingUser] = useState<number | null>(null);

    const { user } = useAuth();
    const chatRef = useRef<HTMLDivElement | null>(null);
    const typingTimeout = useRef<any>(null);

    // 🔹 Load users (auto refresh)
    useEffect(() => {
        const fetchUsers = () => {
            api.get("/api/users").then((res) => setUsers(res.data));
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 5000);

        return () => clearInterval(interval);
    }, []);

    // 🔹 Load messages when selecting user
    useEffect(() => {
        if (!selectedUser) return;

        api
            .get(`/api/messages/${selectedUser.id}`)
            .then((res) => setMessages(res.data));
    }, [selectedUser]);

    // 🔹 Online heartbeat
    useEffect(() => {
        const interval = setInterval(() => {
            api.post("/api/online");
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedUser) return;

        const updated = users.find(u => u.id === selectedUser.id);

        if (updated) {
            setSelectedUser(updated);
        }
    }, [users]);

    // 🔥 Realtime listeners
    useEffect(() => {
        if (!user) return;

        const channel = echo.channel(`chat.${user.id}`);

        // MESSAGE
        channel.listen(".MessageSent", (e: any) => {
            if (selectedUser && e.message.sender_id === selectedUser.id) {
                setMessages((prev) => [...prev, e.message]);
            }
        });

        // TYPING
        channel.listen(".UserTyping", (e: any) => {
            if (selectedUser && e.senderId === selectedUser.id) {
                setTypingUser(e.senderId);

                setTimeout(() => {
                    setTypingUser(null);
                }, 1500);
            }
        });

        return () => {
            echo.leave(`chat.${user.id}`);
        };
    }, [user, selectedUser]);

    // 🔹 Smart auto-scroll
    useEffect(() => {
        const el = chatRef.current;
        if (!el) return;

        const isNearBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 100;

        if (isNearBottom) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    // 🔹 Typing handler
    const handleTyping = async () => {
        if (!selectedUser) return;

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        try {
            await api.get("/sanctum/csrf-cookie");

            await api.post("/api/typing", {
                receiver_id: selectedUser.id,
            });
        } catch (err) {
            console.error(err);
        }

        typingTimeout.current = setTimeout(() => { }, 1000);
    };

    // 🔹 Send message
    const sendMessage = async () => {
        if (!selectedUser || !text.trim()) return;

        const res = await api.post("/api/messages", {
            receiver_id: selectedUser.id,
            message: text,
        });

        setMessages((prev) => [...prev, res.data]);
        setText("");
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* Sidebar */}
            <div className="w-72 bg-[#020817] border-r border-gray-800">
                <div className="p-4 font-semibold border-b border-gray-800">
                    Messages
                </div>

                <div className="p-2 space-y-1">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${selectedUser?.id === u.id
                                ? "bg-gray-800"
                                : "hover:bg-gray-800/60"
                                }`}
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                                {u.name[0]}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="text-xs text-gray-400">
                                    {u.is_online ? "Online" : "Offline"}
                                </p>
                            </div>

                            {/* Online dot */}
                            <span
                                className={`w-2 h-2 rounded-full ${u.is_online ? "bg-green-500" : "bg-gray-500"
                                    }`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-[#020817]">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                {selectedUser.name[0]}
                            </div>

                            <div>
                                <p className="font-medium">{selectedUser.name}</p>
                                <p className="text-xs text-gray-400">
                                    {selectedUser.is_online
                                        ? "Online"
                                        : "Offline"}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={chatRef}
                            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                        >
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">
                                                {selectedUser.name[0]}
                                            </div>
                                        )}

                                        <div
                                            className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${isMe
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-800 text-gray-200"
                                                }`}
                                        >
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing */}
                            {typingUser === selectedUser.id && (
                                <div className="text-sm text-gray-400">
                                    {selectedUser.name} is typing...
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="px-6 py-4 border-t border-gray-800 bg-[#020817]">
                            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
                                <input
                                    value={text}
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        handleTyping();
                                    }}
                                    className="flex-1 bg-transparent outline-none text-sm"
                                    placeholder="Message..."
                                />

                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-full text-sm transition"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}