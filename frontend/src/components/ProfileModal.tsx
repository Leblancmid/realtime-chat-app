import { useState } from "react";
import { api } from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

    const navigate = useNavigate();

    const updateProfile = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name);

            if (avatar) formData.append("avatar", avatar);
            if (banner) formData.append("banner", banner);

            const res = await api.post("/api/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setUser(res.data);

            toast.success("Profile updated successfully");

            onClose(); // close modal

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000); // allow toast to show

        } catch (err: any) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-[900px] h-[550px] bg-[#1e1f22] rounded-2xl flex overflow-hidden shadow-2xl relative">

                {/* Sidebar */}
                <div className="w-56 bg-[#2b2d31] p-4 flex flex-col">
                    <h2 className="text-xs text-gray-400 uppercase mb-3 px-2">
                        User Settings
                    </h2>

                    <button
                        onClick={() => setTab("profile")}
                        className={`px-3 py-2 rounded-md text-sm text-left transition ${tab === "profile"
                            ? "bg-gray-700 text-white"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        Profile
                    </button>

                    <button
                        onClick={() => setTab("password")}
                        className={`px-3 py-2 rounded-md text-sm text-left transition ${tab === "password"
                            ? "bg-gray-700 text-white"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        Password
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {tab === "profile" && (
                        <div className="space-y-6 px-2">
                            {/* Banner */}
                            <div className="relative h-36 rounded-xl overflow-hidden bg-linear-to-r from-blue-600 to-purple-600 group cursor-pointer">
                                {previewBanner && (
                                    <img
                                        src={previewBanner}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm">
                                    Change Banner
                                </div>

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
                            <div className="-mt-16 flex items-center gap-4 px-2">
                                <div className="w-24 h-24 rounded-full border-4 border-[#1e1f22] overflow-hidden relative shrink-0 group cursor-pointer">
                                    {previewAvatar ? (
                                        <img
                                            src={previewAvatar}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="bg-gray-700 w-full h-full flex items-center justify-center text-xl">
                                            {user?.name?.[0]}
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs">
                                        Change
                                    </div>

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

                                <div className="py-10">
                                    <p className="text-lg font-semibold leading-tight">
                                        {user?.name}
                                    </p>
                                    <p className="text-sm text-gray-400 leading-tight">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="text-xs text-gray-400 uppercase">
                                    Display Name
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full mt-2 px-4 py-3 bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Save */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={updateProfile}
                                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    {tab === "password" && (
                        <div className="space-y-5 max-w-md">
                            <h2 className="text-lg font-semibold">
                                Change Password
                            </h2>

                            <input
                                type="password"
                                placeholder="Current password"
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        current: e.target.value,
                                    })
                                }
                                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg"
                            />

                            <input
                                type="password"
                                placeholder="New password"
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        new: e.target.value,
                                    })
                                }
                                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg"
                            />

                            <input
                                type="password"
                                placeholder="Confirm password"
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        confirm: e.target.value,
                                    })
                                }
                                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg"
                            />

                            <button
                                onClick={updatePassword}
                                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
                            >
                                Update Password
                            </button>
                        </div>
                    )}
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}