import { Image, Mic, Smile, Send, Sparkles } from "lucide-react";
import EmojiPickerWrapper from "./ChatPickers/EmojiPickerWrapper";
import { useState } from "react";


type Props = {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    image: File | null;
    setImage: (f: File | null) => void;
    handleTyping: () => void;

    showEmoji: boolean;
    setShowEmoji: (v: boolean) => void;

    showGifPicker: boolean;
    setShowGifPicker: (v: boolean) => void;

    showStickerPicker: boolean;
    setShowStickerPicker: (v: boolean) => void;
};

export default function ChatInput({
    text,
    setText,
    sendMessage,
    image,
    setImage,
    handleTyping,
    showEmoji,
    setShowEmoji,
    showGifPicker,
    setShowGifPicker,
    showStickerPicker,
    setShowStickerPicker,
}: Props) {

    const [isDragging, setIsDragging] = useState(false);

    return (

        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);

                const file = e.dataTransfer.files?.[0];

                if (file && file.type.startsWith("image/")) {
                    setImage(file);
                }
            }}
            className={`px-4 py-3 border-t border-gray-800 bg-[#020817] relative ${isDragging ? "bg-gray-800" : ""
                }`}
        >
            {/* IMAGE PREVIEW */}
            {image && (
                <div className="mb-3 flex items-center gap-2">
                    <img
                        src={URL.createObjectURL(image)}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                        onClick={() => setImage(null)}
                        className="text-red-400 text-sm"
                    >
                        Remove
                    </button>
                </div>
            )}

            <div className="flex items-center gap-3">

                {/* LEFT ICONS */}
                <div className="flex items-center gap-2 text-blue-500">

                    <button className="p-2 rounded-full hover:bg-gray-700">
                        <Mic size={20} />
                    </button>

                    <label className="p-2 rounded-full hover:bg-gray-700 cursor-pointer">
                        <Image size={20} />
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) =>
                                setImage(e.target.files?.[0] || null)
                            }
                        />
                    </label>

                    <button
                        onClick={() => {
                            setShowStickerPicker(!showStickerPicker);
                            setShowGifPicker(false);
                            setShowEmoji(false);
                        }}
                        className="p-2 rounded-full hover:bg-gray-700"
                    >
                        <Sparkles size={20} />
                    </button>

                    <button
                        onClick={() => {
                            setShowGifPicker(!showGifPicker);
                            setShowStickerPicker(false);
                            setShowEmoji(false);
                        }}
                        className="text-xs font-bold px-2 py-1 rounded hover:bg-gray-700"
                    >
                        GIF
                    </button>
                </div>

                {/* INPUT */}
                <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center">
                    <input
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
                        placeholder="Aa"
                    />

                    <button
                        onClick={() => {
                            setShowEmoji(!showEmoji);
                            setShowGifPicker(false);
                            setShowStickerPicker(false);
                        }}
                    >
                        <Smile size={20} />
                    </button>
                </div>

                {/* SEND */}
                <button
                    onClick={sendMessage}
                    disabled={!text.trim() && !image}
                    className={`p-2 rounded-full ${text.trim() || image
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-700 text-gray-400"
                        }`}
                >
                    <Send size={18} />
                </button>
            </div>

            {/* EMOJI */}
            {showEmoji && (
                <EmojiPickerWrapper
                    onSelect={(emoji) =>
                        setText((prev) => prev + emoji)
                    }
                />
            )}
        </div>
    );
}