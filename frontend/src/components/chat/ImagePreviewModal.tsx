type Props = {
    imageUrl: string;
    onClose: () => void;
};

export default function ImagePreviewModal({ imageUrl, onClose }: Props) {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
        >
            <button
                onClick={onClose}
                className="absolute top-5 right-6 text-white text-2xl"
            >
                ×
            </button>

            <img
                src={imageUrl}
                onClick={(e) => e.stopPropagation()}
                className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
            />
        </div>
    );
}