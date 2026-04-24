import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import {
    Image,
    Mic,
    Smile,
    Send,
    Sparkles,
} from "lucide-react";

import { api } from "@/api/axios";
import echo from "@/echo";
import { useAuth } from "@/context/AuthContext";
import type { User, Message } from "@/types";

const stickers = [
    "/stickers/happy.png",
    "/stickers/laugh.png",
    "/stickers/angry.png",
];

export default function Chat() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const [typingUser, setTypingUser] = useState<number | null>(null);

    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    const [gifSearch, setGifSearch] = useState("");
    const [gifs, setGifs] = useState<string[]>([]);

    const { user } = useAuth();
    const navigate = useNavigate();

    const chatRef = useRef<HTMLDivElement | null>(null);
    const typingTimeout = useRef<number | null>(null);

    const sortMessages = (items: Message[]) => {
        return [...items].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
        );
    };

    useEffect(() => {
        const fetchUsers = () => {
            api.get("/api/users").then((res) => setUsers(res.data));
        };

        fetchUsers();

        const interval = window.setInterval(fetchUsers, 5000);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedUser) return;

        const updated = users.find((u) => u.id === selectedUser.id);

        if (updated) {
            setSelectedUser(updated);
        }
    }, [users]);

    useEffect(() => {
        if (!selectedUser) return;

        api.get(`/api/messages/${selectedUser.id}`).then((res) => {
            setMessages(sortMessages(res.data));
        });

        api.post("/api/messages/seen", {
            user_id: selectedUser.id,
        });
    }, [selectedUser]);

    useEffect(() => {
        if (!user) return;

        const channel = echo.channel(`chat.${user.id}`);

        channel.listen(".MessageSent", (e: any) => {
            if (selectedUser && e.message.sender_id === selectedUser.id) {
                setMessages((prev) => sortMessages([...prev, e.message]));
            }
        });

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

        channel.listen(".UserTyping", (e: any) => {
            if (selectedUser && e.senderId === selectedUser.id) {
                setTypingUser(e.senderId);

                window.setTimeout(() => {
                    setTypingUser(null);
                }, 3000);
            }
        });

        return () => {
            echo.leave(`chat.${user.id}`);
        };
    }, [user, selectedUser]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            api.post("/api/online");
        }, 5000);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        const el = chatRef.current;
        if (!el) return;

        el.scrollTop = el.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (!showGifPicker) return;

        const fetchGifs = async () => {
            const key = "LIVDSRZULELA";

            const url = gifSearch
                ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
                    gifSearch
                )}&key=${key}&limit=12`
                : `https://tenor.googleapis.com/v2/featured?key=${key}&limit=12`;

            const res = await fetch(url);
            const data = await res.json();

            setGifs(
                data.results.map((gif: any) => gif.media_formats.gif.url)
            );
        };

        fetchGifs();
    }, [gifSearch, showGifPicker]);

    const handleTyping = async () => {
        if (!selectedUser) return;

        if (typingTimeout.current) {
            window.clearTimeout(typingTimeout.current);
        }

        try {
            await api.get("/sanctum/csrf-cookie");

            await api.post("/api/typing", {
                receiver_id: selectedUser.id,
            });
        } catch (err) {
            console.error(err);
        }

        typingTimeout.current = window.setTimeout(() => { }, 1000);
    };

    const sendMessage = async () => {
        if (!selectedUser) return;
        if (!text.trim() && !image) return;

        const formData = new FormData();
        formData.append("receiver_id", String(selectedUser.id));

        if (text.trim()) {
            formData.append("message", text);
        }

        if (image) {
            formData.append("image", image);
        }

        const res = await api.post("/api/messages", formData);

        setMessages((prev) => sortMessages([...prev, res.data]));

        setText("");
        setImage(null);
    };

    const sendGif = async (gifUrl: string) => {
        if (!selectedUser) return;

        const res = await api.post("/api/messages", {
            receiver_id: selectedUser.id,
            image: gifUrl,
        });

        setMessages((prev) => sortMessages([...prev, res.data]));

        setShowGifPicker(false);
        setShowStickerPicker(false);
        setGifSearch("");
    };

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
            <div className="flex-1 flex flex-col relative">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#020817]">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    ←
                                </button>

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

                                <div>
                                    <p className="font-medium">
                                        {selectedUser.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {selectedUser.is_online
                                            ? "Online"
                                            : "Offline"}
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
                                        className={`flex gap-3 ${isMe
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        {!isMe && (
                                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                                                {selectedUser.avatar ? (
                                                    <img
                                                        src={
                                                            selectedUser.avatar
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>
                                                        {selectedUser.name[0]}
                                                    </span>
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
                                                    {msg.message && (
                                                        <p>{msg.message}</p>
                                                    )}

                                                    {msg.image && (
                                                        <img
                                                            src={msg.image}
                                                            className="max-w-[220px] rounded-lg cursor-pointer hover:opacity-90 border border-gray-700"
                                                            onClick={() =>
                                                                window.open(
                                                                    msg.image,
                                                                    "_blank"
                                                                )
                                                            }
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

                        {/* GIF Picker */}
                        {showGifPicker && (
                            <div className="absolute bottom-24 left-6 w-80 bg-gray-900 border border-gray-700 rounded-lg p-3 z-50 shadow-xl">
                                <input
                                    value={gifSearch}
                                    onChange={(e) =>
                                        setGifSearch(e.target.value)
                                    }
                                    placeholder="Search GIFs..."
                                    className="w-full mb-2 bg-gray-800 p-2 rounded text-sm outline-none"
                                />

                                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                    {gifs.map((gif, i) => (
                                        <img
                                            key={i}
                                            src={gif}
                                            className="cursor-pointer rounded hover:opacity-80"
                                            onClick={() => sendGif(gif)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sticker Picker */}
                        {showStickerPicker && (
                            <div className="absolute bottom-24 left-6 w-72 bg-gray-900 border border-gray-700 rounded-lg p-3 z-50 shadow-xl">
                                <p className="text-xs text-gray-400 mb-2">
                                    Stickers
                                </p>

                                <div className="grid grid-cols-4 gap-3">
                                    {stickers.map((sticker, i) => (
                                        <img
                                            key={i}
                                            src={sticker}
                                            className="cursor-pointer hover:scale-110 transition"
                                            onClick={() => sendGif(sticker)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Emoji Picker */}
                        {showEmoji && (
                            <div className="absolute bottom-24 right-6 z-50">
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => {
                                        setText(
                                            (prev) => prev + emojiData.emoji
                                        );
                                    }}
                                    theme="dark"
                                />
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-gray-800 bg-[#020817]">
                            {image && (
                                <div className="mb-3 flex items-center gap-2">
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

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-blue-500">
                                    <button className="p-2 rounded-full hover:bg-gray-700 transition">
                                        <Mic size={20} />
                                    </button>

                                    <label className="p-2 rounded-full hover:bg-gray-700 transition cursor-pointer">
                                        <Image size={20} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={(e) =>
                                                setImage(
                                                    e.target.files?.[0] || null
                                                )
                                            }
                                        />
                                    </label>

                                    <button
                                        onClick={() => {
                                            setShowStickerPicker((prev) => !prev);
                                            setShowGifPicker(false);
                                            setShowEmoji(false);
                                        }}
                                        className="p-2 rounded-full hover:bg-gray-700 transition"
                                    >
                                        <Sparkles size={20} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowGifPicker((prev) => !prev);
                                            setShowStickerPicker(false);
                                            setShowEmoji(false);
                                        }}
                                        className="h-8 px-2 text-[11px] font-bold rounded-full hover:bg-gray-700 transition"
                                    >
                                        GIF
                                    </button>
                                </div>

                                <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center">
                                    <input
                                        value={text}
                                        onChange={(e) => {
                                            setText(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
                                        placeholder="Aa"
                                    />

                                    <button
                                        onClick={() => {
                                            setShowEmoji((prev) => !prev);
                                            setShowGifPicker(false);
                                            setShowStickerPicker(false);
                                        }}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <Smile size={20} />
                                    </button>
                                </div>

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