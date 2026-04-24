import { useEffect, useState, useRef } from "react";
import { api } from "@/api/axios";
import echo from "@/echo";
import { useAuth } from "@/context/AuthContext";
import type { User, Message } from "@/types";
import { useNavigate } from "react-router-dom";

import {
    Image,
    Mic,
    Smile,
    Send,
    Sparkles
} from "lucide-react";

export default function Chat() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [typingUser, setTypingUser] = useState<number | null>(null);

    const { user } = useAuth();
    const chatRef = useRef<HTMLDivElement | null>(null);
    const typingTimeout = useRef<any>(null);

    const navigate = useNavigate();

    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState(false);

    // 🔹 Load users
    useEffect(() => {
        const fetchUsers = () => {
            api.get("/api/users").then((res) => setUsers(res.data));
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 5000);

        return () => clearInterval(interval);
    }, []);

    // 🔹 Load messages
    useEffect(() => {
        if (!selectedUser) return;

        api.get(`/api/messages/${selectedUser.id}`).then((res) => {
            setMessages(
                res.data.sort(
                    (a: Message, b: Message) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                )
            );
        });

        // mark as seen
        api.post("/api/messages/seen", {
            user_id: selectedUser.id,
        });
    }, [selectedUser]);

    // 🔥 Realtime listeners
    useEffect(() => {
        if (!user) return;

        const channel = echo.channel(`chat.${user.id}`);

        // MESSAGE
        channel.listen(".MessageSent", (e: any) => {
            if (selectedUser && e.message.sender_id === selectedUser.id) {
                setMessages((prev) =>
                    [...prev, e.message].sort(
                        (a, b) =>
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                    )
                );
            }
        });

        // SEEN
        channel.listen(".MessageSeen", () => {
            setMessages((prev) => {
                const lastIndex = [...prev]
                    .reverse()
                    .findIndex((msg) => msg.sender_id === user.id);

                if (lastIndex === -1) return prev;

                const realIndex = prev.length - 1 - lastIndex;

                return prev.map((msg, index) =>
                    index === realIndex
                        ? { ...msg, read_at: new Date().toISOString() }
                        : msg
                );
            });
        });

        // TYPING
        channel.listen(".UserTyping", (e: any) => {
            if (selectedUser && e.senderId === selectedUser.id) {
                setTypingUser(e.senderId);

                setTimeout(() => setTypingUser(null), 5000);
            }
        });

        return () => {
            echo.leave(`chat.${user.id}`);
        };
    }, [user, selectedUser]);

    // 🔹 ONLINE HEARTBEAT
    useEffect(() => {
        const interval = setInterval(() => {
            api.post("/api/online");
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // 🔹 Auto-scroll
    useEffect(() => {
        const el = chatRef.current;
        if (!el) return;

        el.scrollTop = el.scrollHeight;
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
        if (!selectedUser) return;

        const formData = new FormData();
        formData.append("receiver_id", String(selectedUser.id));

        if (text.trim()) {
            formData.append("message", text);
        }

        if (image) {
            formData.append("image", image);
        }

        if (!text.trim() && !image) return;

        const res = await api.post("/api/messages", formData);

        setMessages((prev) =>
            [...prev, res.data].sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
            )
        );

        setText("");
        setImage(null); // 🔥 CLEAR PREVIEW
    };

    // Sync online
    useEffect(() => {
        if (!selectedUser) return;

        const updated = users.find(u => u.id === selectedUser.id);

        if (updated) {
            setSelectedUser(updated);
        }
    }, [users]);

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* Sidebar */}
            <div className="w-72 bg-[#020817] border-r border-gray-800 rounded-l-xl">
                <div className="p-4 font-semibold border-b border-gray-800">
                    Messages
                </div>

                <div className="p-2 space-y-1">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedUser?.id === u.id
                                ? "bg-gray-800"
                                : "hover:bg-gray-800/60"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-sm">
                                {u.avatar ? (
                                    <img
                                        src={u.avatar}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{u.name[0]}</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="text-xs text-gray-400">
                                    {u.is_online ? "Online" : "Offline"}
                                </p>
                            </div>

                            <span
                                className={`w-2 h-2 rounded-full ${u.is_online
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                    }`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#020817]">
                            <div className="flex items-center gap-4">
                                {/* 🔙 Back Button */}
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    ←
                                </button>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                                    {selectedUser.avatar ? (
                                        <img
                                            src={selectedUser.avatar}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{selectedUser.name[0]}</span>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <p className="font-medium">{selectedUser.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {selectedUser.is_online ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={chatRef}
                            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                        >
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user?.id;

                                const lastSentIndex = messages
                                    .map((m) => m.sender_id)
                                    .lastIndexOf(user?.id || 0);

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        {!isMe && (
                                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                                                {selectedUser.avatar ? (
                                                    <img
                                                        src={selectedUser.avatar}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{selectedUser.name[0]}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="max-w-xs">
                                            <div
                                                className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-800 text-gray-200"
                                                    }`}
                                            >
                                                <div className="space-y-2">
                                                    {msg.message && <p>{msg.message}</p>}

                                                    {msg.image && (
                                                        <img
                                                            src={msg.image}
                                                            className="max-w-[220px] rounded-lg cursor-pointer hover:opacity-90 border border-gray-700"
                                                            onClick={() => window.open(msg.image, "_blank")}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {isMe &&
                                                index === lastSentIndex && (
                                                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                                                        {msg.read_at
                                                            ? "✔✔ Seen"
                                                            : msg.delivered_at
                                                                ? "✔✔ Delivered"
                                                                : "✔ Sent"}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}

                            {typingUser === selectedUser.id && (
                                <div className="text-sm text-gray-400">
                                    {selectedUser.name} is typing...
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-gray-800 bg-[#020817]">
                            <div className="flex items-center gap-3">

                                {/* LEFT ICONS */}
                                <div className="flex items-center gap-3 text-blue-500">

                                    {/* MIC */}
                                    <button className="hover:scale-110 transition">
                                        <Mic size={20} />
                                    </button>

                                    {/* IMAGE */}
                                    <button className="hover:scale-110 transition">
                                        <Image size={20} />
                                    </button>


                                    {/* STICKERS */}
                                    <button
                                        onClick={() => setShowStickerPicker(true)}
                                        className="hover:scale-110 transition"
                                    >
                                        <Sparkles size={20} />
                                    </button>

                                    {/* GIF */}
                                    <button
                                        onClick={() => setShowGifPicker(true)}
                                        className="hover:scale-110 transition text-xs font-bold"
                                    >
                                        GIF
                                    </button>

                                </div>

                                {/* INPUT */}
                                <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center">
                                    <input
                                        value={text}
                                        onChange={(e) => {
                                            setText(e.target.value);
                                            handleTyping();
                                        }}
                                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
                                        placeholder="Aa"
                                    />

                                    <button className="text-gray-400 hover:text-white">
                                        <Smile size={20} />
                                    </button>
                                </div>

                                {/* RIGHT BUTTON */}
                                <button
                                    onClick={sendMessage}
                                    disabled={!text.trim() && !image}
                                    className={`transition p-2 rounded-full ${text.trim() || image
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>

                            {/* IMAGE PREVIEW */}
                            {image && (
                                <div className="mt-3 flex items-center gap-2">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                                    />
                                    <button
                                        onClick={() => setImage(null)}
                                        className="text-red-400 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a user
                    </div>
                )}
            </div>
        </div>
    );
}