export function formatLastSeen(time?: string | null) {
    if (!time) return "Offline";

    const now = new Date();
    const last = new Date(time);

    const diff = Math.floor((now.getTime() - last.getTime()) / 1000);

    if (diff < 60) return "Last seen just now";

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `Last seen ${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Last seen ${hours} hr ago`;

    const days = Math.floor(hours / 24);
    return `Last seen ${days} day ago`;
}