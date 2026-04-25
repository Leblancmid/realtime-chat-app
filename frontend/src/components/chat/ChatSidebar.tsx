import type { User } from "@/types";
import { formatLastSeen } from "@/utils/time";

type ChatSidebarProps = {
    users: User[];
    selectedUser: User | null;
    onSelectUser: (user: User) => void;
};

export default function ChatSidebar({
    users,
    selectedUser,
    onSelectUser,
}: ChatSidebarProps) {
    return (
        <div className="w-72 bg-[#020817] border-r border-gray-800 rounded-l-xl">
            <div className="p-4 font-semibold border-b border-gray-800">
                Messages
            </div>

            <div className="p-2 space-y-1">
                {users.map((u) => (
                    <div
                        key={u.id}
                        onClick={() => onSelectUser(u)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedUser?.id === u.id
                            ? "bg-gray-800"
                            : "hover:bg-gray-800/60"
                            }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-sm">
                            {u.avatar ? (
                                <img
                                    src={u.avatar}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{u.name[0]}</span>
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-gray-400">
                                {u.is_online
                                    ? "Online"
                                    : formatLastSeen(u.last_seen)}
                            </p>
                        </div>

                        <span
                            className={`w-2 h-2 rounded-full ${u.is_online ? "bg-green-500" : "bg-gray-500"
                                }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}