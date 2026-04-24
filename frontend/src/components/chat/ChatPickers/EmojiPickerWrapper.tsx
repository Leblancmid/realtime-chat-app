import EmojiPicker, { Theme } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

type Props = {
    onSelect: (emoji: string) => void;
};

export default function EmojiPickerWrapper({ onSelect }: Props) {
    return (
        <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker
                onEmojiClick={(emojiData: EmojiClickData) =>
                    onSelect(emojiData.emoji)
                }
                theme={Theme.DARK}
            />
        </div>
    );
}