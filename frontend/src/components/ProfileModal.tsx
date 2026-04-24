import { useState } from "react";
import { api } from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

export default function ProfileModal({ onClose }: any) {
    const { user, setUser } = useAuth();

    const [tab, setTab] = useState<"profile" | "password">("profile");

    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

    const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
    const [previewBanner, setPreviewBanner] = useState<string | null>(user?.banner || null);

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const [loading, setLoading] = useState(false);

    const updateProfile = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);

        if (avatar) formData.append("avatar", avatar);
        if (banner) formData.append("banner", banner);

        const res = await api.post("/api/profile", formData);
        setUser(res.data);

        setLoading(false);
    };

    const updatePassword = async () => {
        try {
            await api.post("/api/change-password", {
                current: passwords.current,
                new: passwords.new,
                new_confirmation: passwords.confirm, // ✅ IMPORTANT
            });

            alert("Password updated");
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || "Error updating password");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="w-[800px] h-[500px] bg-[#1e1f22] rounded-xl flex overflow-hidden">

                {/* Sidebar */}
                <div className="w-52 bg-[#2b2d31] p-4 space-y-2">
                    <button
                        onClick={() => setTab("profile")}
                        className={`block w-full text-left px-3 py-2 rounded ${tab === "profile" ? "bg-gray-700" : "hover:bg-gray-700"
                            }`}
                    >
                        Profile
                    </button>

                    <button
                        onClick={() => setTab("password")}
                        className={`block w-full text-left px-3 py-2 rounded ${tab === "password" ? "bg-gray-700" : "hover:bg-gray-700"
                            }`}
                    >
                        Password
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {tab === "profile" && (
                        <>
                            {/* Banner */}
                            <div className="h-32 bg-gray-800 rounded-lg relative overflow-hidden">
                                {previewBanner && (
                                    <img
                                        src={previewBanner}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setBanner(file);
                                        setPreviewBanner(URL.createObjectURL(file));
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Avatar */}
                            <div className="-mt-10 mb-4">
                                <div className="w-20 h-20 rounded-full border-4 border-[#1e1f22] overflow-hidden relative cursor-pointer">
                                    {previewAvatar ? (
                                        <img
                                            src={previewAvatar}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="bg-gray-700 w-full h-full flex items-center justify-center">
                                            {user?.name?.[0]}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setAvatar(file);
                                            setPreviewAvatar(URL.createObjectURL(file));
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-800 p-3 rounded mb-4"
                            />

                            <button
                                onClick={updateProfile}
                                className="bg-blue-600 px-4 py-2 rounded"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    )}

                    {tab === "password" && (
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="Current password"
                                onChange={(e) =>
                                    setPasswords({ ...passwords, current: e.target.value })
                                }
                                className="w-full bg-gray-800 p-3 rounded"
                            />

                            <input
                                type="password"
                                placeholder="New password"
                                onChange={(e) =>
                                    setPasswords({ ...passwords, new: e.target.value })
                                }
                                className="w-full bg-gray-800 p-3 rounded"
                            />

                            <input
                                type="password"
                                placeholder="Confirm password"
                                onChange={(e) =>
                                    setPasswords({ ...passwords, confirm: e.target.value })
                                }
                                className="w-full bg-gray-800 p-3 rounded"
                            />

                            <button
                                onClick={updatePassword}
                                className="bg-red-600 px-4 py-2 rounded"
                            >
                                Update Password
                            </button>
                        </div>
                    )}
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}