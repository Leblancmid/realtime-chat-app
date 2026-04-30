import { useState } from "react";
import type { Message, User, Reaction } from "@/types";
import { api } from "@/api/axios";

type Props = {
    msg: Message;
    isMe: boolean;
    isLast: boolean;
    selectedUser: User;
    currentUser: User;
    onImageClick: (url: string) => void;
};

export default function ChatMessageItem({
    msg,
    isMe,
    isLast,
    selectedUser,
    currentUser,
    onImageClick,
}: Props) {
    const BASE_URL = import.meta.env.VITE_API_URL;

    const [showReactions, setShowReactions] = useState(false);

    // ✅ local state (no mutation)
    const [reactions, setReactions] = useState<Reaction[]>(
        msg.reactions || []
    );

    // 🔥 Handle reaction
    const handleReaction = async (emoji: string) => {
        const res = await api.post("/api/messages/react", {
            message_id: msg.id,
            reaction: emoji,
        });

        setReactions((prev) => {
            // ❌ remove
            if (res.data.removed) {
                return prev.filter((r) => r.user_id !== currentUser.id);
            }

            // 🔁 update or add
            const existingIndex = prev.findIndex(
                (r) => r.user_id === currentUser.id
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = res.data;
                return updated;
            }

            return [...prev, res.data];
        });
    };

    // 🔥 Group reactions
    const grouped = reactions.reduce<Record<string, number>>((acc, r) => {
        acc[r.reaction] = (acc[r.reaction] || 0) + 1;
        return acc;
    }, {});

    return (
        <div
            className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"
                }`}
        >
            {/* Avatar */}
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

            {/* Message Wrapper */}
            <div
                className="relative max-w-xs"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
            >
                {/* Reaction Picker */}
                {showReactions && (
                    <div
                        className={`absolute -top-8 flex gap-2 bg-gray-800 px-2 py-1 rounded shadow-lg text-sm ${isMe ? "right-0" : "left-0"
                            }`}
                    >
                        {["👍", "🔥", "😂", "❤️"].map((r) => {
                            const isActive = reactions.some(
                                (x) =>
                                    x.user_id === currentUser.id &&
                                    x.reaction === r
                            );

                            return (
                                <button
                                    key={r}
                                    onClick={() => handleReaction(r)}
                                    className={`transition hover:scale-125 ${isActive
                                        ? "bg-blue-600 rounded px-1"
                                        : ""
                                        }`}
                                >
                                    {r}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Message Bubble */}
                <div
                    className={`px-4 py-2 rounded-2xl text-sm ${isMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-200"
                        }`}
                >
                    <div className="space-y-2">
                        {/* Text */}
                        {msg.message && <p>{msg.message}</p>}

                        {/* Image */}
                        {msg.image && (
                            <img
                                src={
                                    msg.image.startsWith("http")
                                        ? msg.image
                                        : `${BASE_URL}${msg.image}`
                                }
                                className="max-w-[220px] rounded-lg cursor-pointer hover:opacity-90 border border-gray-700"
                                onClick={() =>
                                    onImageClick(
                                        msg.image.startsWith("http")
                                            ? msg.image
                                            : `${BASE_URL}${msg.image}`
                                    )
                                }
                            />
                        )}
                    </div>
                </div>

                {/* Reaction Display */}
                {Object.keys(grouped).length > 0 && (
                    <div className="flex gap-2 mt-1 text-xs flex-wrap">
                        {Object.entries(grouped).map(([emoji, count]) => (
                            <span
                                key={emoji}
                                className="bg-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                                {emoji} {count}
                            </span>
                        ))}
                    </div>
                )}

                {/* Seen / Delivered */}
                {isMe && isLast && (
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
}