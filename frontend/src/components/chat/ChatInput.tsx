import { Image, Mic, Smile, Send, Sparkles } from "lucide-react";
import EmojiPickerWrapper from "./ChatPickers/EmojiPickerWrapper";

type Props = {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;

    image: File | null;
    setImage: React.Dispatch<React.SetStateAction<File | null>>;

    handleTyping: () => void;

    showEmoji: boolean;
    setShowEmoji: React.Dispatch<React.SetStateAction<boolean>>;

    showGifPicker: boolean;
    setShowGifPicker: React.Dispatch<React.SetStateAction<boolean>>;

    showStickerPicker: boolean;
    setShowStickerPicker: React.Dispatch<React.SetStateAction<boolean>>;
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
    return (
        <div className="px-4 py-3 border-t border-gray-800 bg-[#020817] relative">
            {/* IMAGE PREVIEW */}
            {image && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={URL.createObjectURL(image)}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                        />

                        <button
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-1.5"
                        >
                            ✕
                        </button>
                    </div>
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
                        className="text-gray-400 hover:text-white"
                    >
                        <Smile size={20} />
                    </button>
                </div>

                {/* SEND */}
                <button
                    onClick={sendMessage}
                    disabled={!text.trim() && !image}
                    className={`p-2 rounded-full ${text.trim() || image
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
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