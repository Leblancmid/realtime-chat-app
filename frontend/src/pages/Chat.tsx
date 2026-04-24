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

    // 🔥 USE HOOK (THIS REPLACES ALL LOGIC)
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

    // UI-only state (keep here)
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    const [gifSearch, setGifSearch] = useState("");
    const [gifs, setGifs] = useState<string[]>([]);

    const stickers = [
        "/stickers/happy.png",
        "/stickers/laugh.png",
        "/stickers/angry.png",
    ];

    // 🔹 GIF FETCH (UI logic only)
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

    const handleSendGif = async (gifUrl: string) => {
        await sendGif(gifUrl);

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