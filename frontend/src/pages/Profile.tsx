import { useState } from "react";
import { api } from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
    const { user, setUser } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(user?.avatar || null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        setAvatar(file);
        setPreview(URL.createObjectURL(file)); // 🔥 preview
    };

    const updateProfile = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);

        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            const res = await api.post("/api/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setUser(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-xl">
                        {preview ? (
                            <img
                                src={preview}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.name?.[0]
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-gray-400 mb-2">
                            Profile Picture
                        </p>

                        <input
                            type="file"
                            onChange={(e) =>
                                handleFileChange(e.target.files?.[0] || null)
                            }
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Email (readonly) */}
                <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <input
                        value={user?.email || ""}
                        disabled
                        className="w-full mt-1 bg-gray-800 border border-gray-700 p-3 rounded-lg opacity-60 cursor-not-allowed"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}