import { useEffect, useRef, useState } from "react";
import type { Message, User } from "@/types";

import ChatMessageItem from "./ChatMessageItem";
import ImagePreviewModal from "./ImagePreviewModal";

type Props = {
    messages: Message[];
    currentUser: User | null;
    selectedUser: User;
    typingUser: number | null;
};

export default function ChatMessages({
    messages,
    currentUser,
    selectedUser,
    typingUser,
}: Props) {
    const chatRef = useRef<HTMLDivElement | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // 🔹 Auto scroll
    useEffect(() => {
        const el = chatRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages]);

    // 🔹 Last sent message index
    const lastSentIndex = messages
        .map((m) => m.sender_id)
        .lastIndexOf(currentUser?.id || 0);

    return (
        <>
            <div
                ref={chatRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            >
                {messages.map((msg, index) => {
                    const isMe = msg.sender_id === currentUser?.id;

                    return (
                        <ChatMessageItem
                            key={msg.id}
                            msg={msg}
                            currentUser={currentUser}
                            isMe={isMe}
                            isLast={index === lastSentIndex}
                            selectedUser={selectedUser}
                            onImageClick={setPreviewImage}
                        />
                    );
                })}

                {/* Typing */}
                {typingUser === selectedUser.id && (
                    <div className="text-sm text-gray-400">
                        {selectedUser.name} is typing...
                    </div>
                )}
            </div>

            {/* ✅ Modal MUST be outside map */}
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </>
    );
}