type GifPickerProps = {
    gifs: string[];
    gifSearch: string;
    setGifSearch: (value: string) => void;
    onSelectGif: (gifUrl: string) => void;
};

export default function GifPicker({
    gifs,
    gifSearch,
    setGifSearch,
    onSelectGif,
}: GifPickerProps) {
    return (
        <div className="absolute bottom-24 left-6 w-80 bg-gray-900 border border-gray-700 rounded-lg p-3 z-50 shadow-xl">
            <input
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                placeholder="Search GIFs..."
                className="w-full mb-2 bg-gray-800 p-2 rounded text-sm outline-none"
            />

            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {gifs.map((gif, i) => (
                    <img
                        key={i}
                        src={gif}
                        className="cursor-pointer rounded hover:opacity-80"
                        onClick={() => onSelectGif(gif)}
                    />
                ))}
            </div>
        </div>
    );
}