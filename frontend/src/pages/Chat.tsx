import { useEffect, useState, useRef } from "react";
import { api } from "@/api/axios";
import echo from "@/echo";
import { useAuth } from "@/context/AuthContext";

type User = {
    id: number;
    name: string;
    email: string;
};

type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: string;
};

export default function Chat() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [typingUser, setTypingUser] = useState<number | null>(null);

    const { user } = useAuth();
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const typingTimeout = useRef<any>(null);

    // 🔹 Load users
    useEffect(() => {
        api.get("/api/users").then((res) => setUsers(res.data));
    }, []);

    // 🔹 Load messages
    useEffect(() => {
        if (!selectedUser) return;

        api
            .get(`/api/messages/${selectedUser.id}`)
            .then((res) => setMessages(res.data));
    }, [selectedUser]);

    // 🔥 Realtime listener (messages + typing)
    useEffect(() => {
        if (!user) return;

        const channel = echo.channel(`chat.${user.id}`);

        // MESSAGE
        channel.listen(".MessageSent", (e: any) => {
            console.log("🔥 REALTIME EVENT:", e);

            if (selectedUser && e.message.sender_id === selectedUser.id) {
                setMessages((prev) => [...prev, e.message]);
            }
        });

        // 🔥 TYPING
        channel.listen(".UserTyping", (e: any) => {
            console.log("🔥 TYPING EVENT:", e);

            setTypingUser(e.senderId);

            setTimeout(() => {
                setTypingUser(null);
            }, 1500);
        });

        return () => {
            echo.leave(`chat.${user.id}`);
        };
    }, [user, selectedUser]);

    // 🔹 Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 🔥 Typing handler
    const handleTyping = async () => {
        console.log("Typing triggered");

        if (!selectedUser) {
            console.log("❌ No selected user");
            return;
        }

        console.log("✅ Sending typing to:", selectedUser.id);

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        try {
            await api.get("/sanctum/csrf-cookie");

            await api.post("/api/typing", {
                receiver_id: selectedUser.id,
            });

            console.log("✅ Typing API success");
        } catch (err) {
            console.error("❌ Typing API error:", err);
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
                        className={`p-3 cursor-pointer ${selectedUser?.id === u.id
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                            }`}
                    >
                        {u.name}
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b font-bold bg-white">
                            Chat with {selectedUser.name}
                        </div>

                        <div className="px-4 h-6">
                            {typingUser === selectedUser?.id && (
                                <p className="text-sm text-gray-400 italic animate-pulse">
                                    {selectedUser.name} is typing...
                                </p>
                            )}
                        </div>
                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-2">
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

                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t flex gap-2 bg-white">
                            <input
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    handleTyping();
                                }}
                                className="flex-1 border px-4 py-2 rounded-full"
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white px-4 rounded-full"
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