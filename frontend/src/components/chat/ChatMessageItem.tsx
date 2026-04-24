import type { Message, User } from "@/types";

type Props = {
    msg: Message;
    isMe: boolean;
    isLast: boolean;
    selectedUser: User;
};

export default function ChatMessageItem({
    msg,
    isMe,
    isLast,
    selectedUser,
}: Props) {
    return (
        <div className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
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
                                src={`http://localhost${msg.image}`}
                                className="max-w-[220px] rounded-lg cursor-pointer border border-gray-700"
                                onClick={() => window.open(msg.image, "_blank")}
                            />
                        )}
                    </div>
                </div>

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