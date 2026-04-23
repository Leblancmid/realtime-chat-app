import { useEffect, useState } from "react";
import { api } from "@/api/axios";

type Message = {
    id: number;
    message: string;
    sender_id: number;
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");

    const userId = 1; // temp target user

    const fetchMessages = async () => {
        const res = await api.get(`/api/messages/${userId}`);
        setMessages(res.data);
    };

    const sendMessage = async () => {
        await api.post("/api/messages", {
            receiver_id: userId,
            message: text,
        });

        setText("");
        fetchMessages();
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div>
            <div>
                {messages.map((m) => (
                    <p key={m.id}>{m.message}</p>
                ))}
            </div>

            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}