import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

import GifPicker from "@/components/chat/ChatPickers/GifPicker";
import StickerPicker from "@/components/chat/ChatPickers/StickerPicker";

import { useChat } from "@/hooks/useChat";

export default function Chat() {
    const { user } = useAuth();

    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate((n) => n + 1);
        }, 60000); // every 1 minute

        return () => clearInterval(interval);
    }, []);

    const {
        users,
        selectedUser,
        setSelectedUser,
        messages,
        text,
        setText,
        image,
        setImage,
        typingUser,
        handleTyping,
        sendMessage,
        sendGif,
    } = useChat(user);

    // UI state
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    const [gifSearch, setGifSearch] = useState("");
    const [gifs, setGifs] = useState<string[]>([]);

    const [isDragging, setIsDragging] = useState(false);

    const stickers = [
        "/stickers/happy.png",
        "/stickers/laugh.png",
        "/stickers/angry.png",
    ];

    // GIF fetch
    useEffect(() => {
        if (!showGifPicker) return;

        const fetchGifs = async () => {
            const key = "LIVDSRZULELA";

            const url = gifSearch
                ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(gifSearch)}&key=${key}&limit=12`
                : `https://tenor.googleapis.com/v2/featured?key=${key}&limit=12`;

            const res = await fetch(url);
            const data = await res.json();

            setGifs(
                data.results.map((gif: any) => gif.media_formats.gif.url)
            );
        };

        fetchGifs();
    }, [gifSearch, showGifPicker]);

    const handleSendGif = async (gifUrl: string) => {
        await sendGif(gifUrl);

        setShowGifPicker(false);
        setShowStickerPicker(false);
        setGifSearch("");
    };

    // 🔥 DRAG HANDLER (applies to WHOLE CHAT)
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        const images = files.filter((f) =>
            f.type.startsWith("image/")
        );

        if (images.length > 0) {
            setImage(images[0]); // single image for now
        }
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">

            {/* SIDEBAR */}
            <div className="w-72 bg-[#020817] border-r border-gray-800">
                <ChatSidebar
                    users={users}
                    selectedUser={selectedUser}
                    onSelectUser={setSelectedUser}
                />
            </div>

            {/* CHAT AREA */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex-1 flex flex-col relative ${isDragging ? "bg-gray-800/40" : ""
                    }`}
            >
                {selectedUser ? (
                    <>
                        <ChatHeader user={selectedUser} />

                        <ChatMessages
                            messages={messages}
                            currentUser={user}
                            selectedUser={selectedUser}
                            typingUser={typingUser}
                        />

                        {/* GIF */}
                        {showGifPicker && (
                            <GifPicker
                                gifs={gifs}
                                gifSearch={gifSearch}
                                setGifSearch={setGifSearch}
                                onSelectGif={handleSendGif}
                            />
                        )}

                        {/* STICKERS */}
                        {showStickerPicker && (
                            <StickerPicker
                                stickers={stickers}
                                onSelectSticker={handleSendGif}
                            />
                        )}

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

                        {/* 🔥 DRAG OVERLAY (Messenger style) */}
                        {isDragging && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                                <div className="border-2 border-dashed border-white/40 p-10 rounded-xl text-lg">
                                    Drop images to upload
                                </div>
                            </div>
                        )}
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