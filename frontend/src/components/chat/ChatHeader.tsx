import type { User } from "@/types";
import { useNavigate } from "react-router-dom";

type ChatHeaderProps = {
    user: User;
};

export default function ChatHeader({ user }: ChatHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#020817]">
            <div className="flex items-center gap-4">
                {/* Back */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-400 hover:text-white transition"
                >
                    ←
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span>{user.name[0]}</span>
                    )}
                </div>

                {/* Info */}
                <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">
                        {user.is_online ? "Online" : "Offline"}
                    </p>
                </div>
            </div>
        </div>
    );
}