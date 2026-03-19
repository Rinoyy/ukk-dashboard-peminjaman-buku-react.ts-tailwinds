import type { User } from './user';

export interface Visit {
    id: number;
    userId: number;
    visitDate: string;
    user: User;
}
