import { useEffect } from "react";

type Props = {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
};

export default function Toast({ message, type = "success", onClose }: Props) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50">
            <div
                className={`px-4 py-2 rounded-lg shadow-lg text-sm ${type === "success"
                    ? "bg-green-600"
                    : "bg-red-600"
                    }`}
            >
                {message}
            </div>
        </div>
    );
}