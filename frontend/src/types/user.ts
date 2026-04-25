export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    is_online?: boolean;
    banner?: string;
    last_seen?: string;
};