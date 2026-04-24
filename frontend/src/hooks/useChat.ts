import { useEffect, useRef, useState } from "react";
import { api } from "@/api/axios";
import echo from "@/echo";
import type { User, Message } from "@/types";

export function useChat(currentUser: User | null) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const [typingUser, setTypingUser] = useState<number | null>(null);

    const typingTimeout = useRef<any>(null);

    // utils
    const sortMessages = (items: Message[]) => {
        return [...items].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
        );
    };

    // 🔹 USERS
    useEffect(() => {
        const fetchUsers = () => {
            api.get("/api/users").then((res) => setUsers(res.data));
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 5000);

        return () => clearInterval(interval);
    }, []);

    // 🔹 SYNC selected user
    useEffect(() => {
        if (!selectedUser) return;

        const updated = users.find((u) => u.id === selectedUser.id);
        if (updated) setSelectedUser(updated);
    }, [users]);

    // 🔹 LOAD MESSAGES
    useEffect(() => {
        if (!selectedUser) return;

        api.get(`/api/messages/${selectedUser.id}`).then((res) => {
            setMessages(sortMessages(res.data));
        });

        api.post("/api/messages/seen", {
            user_id: selectedUser.id,
        });
    }, [selectedUser]);

    // 🔥 REALTIME
    useEffect(() => {
        if (!currentUser) return;

        const channel = echo.channel(`chat.${currentUser.id}`);

        channel.listen(".MessageSent", (e: any) => {
            if (selectedUser && e.message.sender_id === selectedUser.id) {
                setMessages((prev) => sortMessages([...prev, e.message]));
            }
        });

        channel.listen(".MessageSeen", () => {
            setMessages((prev) => {
                const lastIndex = [...prev]
                    .reverse()
                    .findIndex((msg) => msg.sender_id === currentUser.id);

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

                setTimeout(() => setTypingUser(null), 3000);
            }
        });

        return () => {
            echo.leave(`chat.${currentUser.id}`);
        };
    }, [currentUser, selectedUser]);

    // 🔹 ONLINE HEARTBEAT
    useEffect(() => {
        const interval = setInterval(() => {
            api.post("/api/online");
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // 🔹 TYPING
    const handleTyping = async () => {
        if (!selectedUser) return;

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        try {
            await api.get("/sanctum/csrf-cookie");

            await api.post("/api/typing", {
                receiver_id: selectedUser.id,
            });
        } catch (err) {
            console.error(err);
        }

        typingTimeout.current = setTimeout(() => { }, 1000);
    };

    // 🔹 SEND MESSAGE
    const sendMessage = async () => {
        if (!selectedUser) return;
        if (!text.trim() && !image) return;

        const formData = new FormData();
        formData.append("receiver_id", String(selectedUser.id));

        if (text.trim()) formData.append("message", text);
        if (image) formData.append("image", image);

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
    };

    return {
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
    };
}