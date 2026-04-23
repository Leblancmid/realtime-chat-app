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
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r">
                <h2 className="p-4 font-bold border-b">Users</h2>

                {users.map((u) => (
                    <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`p-3 cursor-pointer flex items-center gap-2 ${selectedUser?.id === u.id
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                            }`}
                    >
                        {/* 🟢 Online indicator */}
                        <span
                            className={`w-2 h-2 rounded-full ${u.is_online
                                ? "bg-green-500"
                                : "bg-gray-400"
                                }`}
                        />
                        {u.name}
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b bg-white">
                            <div className="font-bold">
                                {selectedUser.name}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span
                                    className={`w-2 h-2 rounded-full ${selectedUser?.is_online
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                        }`}
                                />
                                {selectedUser?.is_online
                                    ? "Online"
                                    : "Offline"}
                            </div>
                        </div>

                        {/* Typing indicator */}
                        <div className="px-4 h-6 flex items-center">
                            {typingUser === selectedUser.id && (
                                <div className="flex items-center gap-1 text-gray-400 text-sm">
                                    <span>
                                        {selectedUser.name} is typing
                                    </span>
                                    <span className="animate-bounce">.</span>
                                    <span className="animate-bounce delay-150">
                                        .
                                    </span>
                                    <span className="animate-bounce delay-300">
                                        .
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div
                            ref={chatRef}
                            className="flex-1 p-4 overflow-y-auto space-y-2"
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
                                        <div
                                            className={`px-4 py-2 rounded-2xl max-w-xs ${isMe
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-black"
                                                }`}
                                        >
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t flex gap-2 bg-white">
                            <input
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    handleTyping();
                                }}
                                className="flex-1 border px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Type a message..."
                            />

                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
                            >
                                Send
                            </button>
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