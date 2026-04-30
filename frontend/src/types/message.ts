export type Reaction = {
    id: number;
    user_id: number;
    message_id: number;
    reaction: string;
};

export type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    message?: string;
    image?: string;
    created_at: string;
    read_at?: string;
    delivered_at?: string;

    reactions?: Reaction[]; // ✅ ADD THIS
};