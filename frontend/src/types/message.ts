export type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: string;
    delivered_at?: string;
    read_at?: string;
    image: string;
};