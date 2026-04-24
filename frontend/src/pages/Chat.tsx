import { useEffect, useRef, useState } from "react";

import { api } from "@/api/axios";
import echo from "@/echo";
import { useAuth } from "@/context/AuthContext";
import type { User, Message } from "@/types";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

import GifPicker from "@/components/chat/ChatPickers/GifPicker";
import StickerPicker from "@/components/chat/ChatPickers/StickerPicker";

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

    const chatRef = useRef<HTMLDivElement | null>(null);
    const typingTimeout = useRef<number | null>(null);

    const stickers = [
        "/stickers/happy.png",
        "/stickers/laugh.png",
        "/stickers/angry.png",
    ];

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
                <ChatSidebar
                    users={users}
                    selectedUser={selectedUser}
                    onSelectUser={setSelectedUser}
                />
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col relative">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <ChatHeader user={selectedUser} />

                        {/* Messages */}
                        <ChatMessages
                            messages={messages}
                            currentUser={user}
                            selectedUser={selectedUser}
                            typingUser={typingUser}
                        />

                        {showGifPicker && (
                            <GifPicker
                                gifs={gifs}
                                gifSearch={gifSearch}
                                setGifSearch={setGifSearch}
                                onSelectGif={sendGif}
                            />
                        )}

                        {showStickerPicker && (
                            <StickerPicker
                                stickers={stickers}
                                onSelectSticker={sendGif}
                            />
                        )}


                        {/* Input */}
                        <ChatInput
                            text={text}
                            setText={setText}
                            sendMessage={sendMessage}
                            image={image}
                            setImage={setImage}
                            handleTyping={handleTyping}
                            showEmoji={showEmoji}
                            setShowEmoji={setShowEmoji}
                            showGifPicker={showGifPicker}
                            setShowGifPicker={setShowGifPicker}
                            showStickerPicker={showStickerPicker}
                            setShowStickerPicker={setShowStickerPicker}
                        />
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