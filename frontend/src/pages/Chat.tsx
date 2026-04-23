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

    const { user } = useAuth();
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // 🔹 Load users
    useEffect(() => {
        api.get("/api/users").then((res) => setUsers(res.data));
    }, []);

    // 🔹 Load messages when selecting user
    useEffect(() => {
        if (!selectedUser) return;

        api
            .get(`/api/messages/${selectedUser.id}`)
            .then((res) => setMessages(res.data));
    }, [selectedUser]);

    // 🔥 Realtime listener (FIXED)
    useEffect(() => {
        if (!user) return;

        const channel = echo.channel(`chat.${user.id}`);

        channel.listen(".MessageSent", (e: any) => {
            console.log("🔥 REALTIME EVENT:", e);

            // only append if currently chatting with sender
            if (selectedUser && e.message.sender_id === selectedUser.id) {
                setMessages((prev) => [...prev, e.message]);
            }
        });

        return () => {
            echo.leave(`chat.${user.id}`);
        };
    }, [user, selectedUser]);

    // 🔥 Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 🔹 Send message (FIXED)
    const sendMessage = async () => {
        if (!selectedUser || !text.trim()) return;

        const res = await api.post("/api/messages", {
            receiver_id: selectedUser.id,
            message: text,
        });

        // ✅ update UI instantly for sender
        setMessages((prev) => [...prev, res.data]);

        setText("");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r flex flex-col">
                <h2 className="p-4 font-bold border-b">Users</h2>

                <div className="flex-1 overflow-y-auto">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`p-3 cursor-pointer transition 
                            ${selectedUser?.id === u.id
                                    ? "bg-blue-100 font-semibold"
                                    : "hover:bg-gray-100"}`}
                        >
                            {u.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b bg-white font-semibold shadow-sm">
                            Chat with {selectedUser.name}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-2">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`
                                            px-4 py-2 rounded-2xl max-w-xs
                                            ${isMe
                                                    ? "bg-blue-500 text-white rounded-br-none"
                                                    : "bg-gray-200 text-gray-800 rounded-bl-none"}
                                        `}
                                        >
                                            {msg.message}

                                            <div className="text-xs mt-1 opacity-70 text-right">
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </div>
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
                                onChange={(e) => setText(e.target.value)}
                                className="flex-1 border px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                        💬 Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}