type StickerPickerProps = {
    stickers: string[];
    onSelectSticker: (stickerUrl: string) => void;
};

export default function StickerPicker({
    stickers,
    onSelectSticker,
}: StickerPickerProps) {
    return (
        <div className="absolute bottom-24 left-6 w-72 bg-gray-900 border border-gray-700 rounded-lg p-3 z-50 shadow-xl">
            <p className="text-xs text-gray-400 mb-2">Stickers</p>

            <div className="grid grid-cols-4 gap-3">
                {stickers.map((sticker, i) => (
                    <img
                        key={i}
                        src={sticker}
                        className="cursor-pointer hover:scale-110 transition"
                        onClick={() => onSelectSticker(sticker)}
                    />
                ))}
            </div>
        </div>
    );
}