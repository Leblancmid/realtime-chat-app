import { useEffect, useState } from "react";
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
};

export default function Chat() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");

    // 🔹 Load users
    useEffect(() => {
        api.get("/api/users").then((res) => setUsers(res.data));
    }, []);

    // 🔹 Load messages when user selected
    useEffect(() => {
        if (!selectedUser) return;

        api
            .get(`/api/messages/${selectedUser.id}`)
            .then((res) => setMessages(res.data));
    }, [selectedUser]);

    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        echo.channel(`chat.${user.id}`)
            .listen(".MessageSent", (e: any) => {
                console.log("🔥 REALTIME EVENT:", e);

                // ✅ Only update if current chat is open
                if (selectedUser && e.message.sender_id === selectedUser.id) {
                    setMessages((prev) => [...prev, e.message]);
                }
            });

        return () => {
            echo.leave(`chat.${user.id}`);
        };
    }, [user, selectedUser]);

    const sendMessage = async () => {
        if (!selectedUser || !text) return;

        const res = await api.post("/api/messages", {
            receiver_id: selectedUser.id,
            message: text,
        });

        // ✅ update UI instantly for sender
        setMessages((prev) => [...prev, res.data]);

        setText("");

        // const res = await api.get(`/api/messages/${selectedUser.id}`);
        // setMessages(res.data);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r">
                <h2 className="p-4 font-bold border-b">Users</h2>
                {users.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user.id ? "bg-gray-200" : ""
                            }`}
                    >
                        {user.name}
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b font-bold">
                            {selectedUser.name}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-2">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-2 rounded max-w-xs ${msg.sender_id === selectedUser.id
                                        ? "bg-gray-200"
                                        : "bg-blue-500 text-white ml-auto"
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t flex gap-2">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="flex-1 border p-2 rounded"
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white px-4 rounded"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}