import { useState } from "react";
import type { Message, User } from "@/types";

type Props = {
    msg: Message;
    isMe: boolean;
    isLast: boolean;
    selectedUser: User;
    onImageClick: (url: string) => void;
};

export default function ChatMessageItem({
    msg,
    isMe,
    isLast,
    selectedUser,
    onImageClick,
}: Props) {
    const BASE_URL = import.meta.env.VITE_API_URL;

    const [showReactions, setShowReactions] = useState(false);
    const [reaction, setReaction] = useState<string | null>(null);

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

            {/* Message Wrapper (IMPORTANT) */}
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
                        {["👍", "🔥", "😂", "❤️"].map((r) => (
                            <button
                                key={r}
                                onClick={() => setReaction(r)}
                                className="hover:scale-125 transition"
                            >
                                {r}
                            </button>
                        ))}
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
                {reaction && (
                    <div
                        className={`mt-1 text-xs ${isMe ? "text-right" : "text-left"
                            }`}
                    >
                        {reaction}
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