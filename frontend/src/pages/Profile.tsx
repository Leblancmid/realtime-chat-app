import { useState } from "react";
import { api } from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState<File | null>(null);

    const updateProfile = async () => {
        const formData = new FormData();
        formData.append("name", name);

        if (avatar) {
            formData.append("avatar", avatar);
        }

        const res = await api.post("/api/profile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        setUser(res.data); // update frontend user
    };

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>

            <div className="space-y-4">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800 p-3 rounded"
                    placeholder="Your name"
                />

                <input
                    type="file"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    className="text-sm"
                />

                <button
                    onClick={updateProfile}
                    className="bg-blue-600 px-4 py-2 rounded"
                >
                    Save
                </button>
            </div>
        </div>
    );
}