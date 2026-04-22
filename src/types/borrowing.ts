import type { User } from './user';

export type BorrowStatus = 'PENDING' | 'BORROWED' | 'RETURN_PENDING' | 'RETURNED' | 'REJECTED' | 'CANCELLED';

export type ReturnCondition = 'GOOD' | 'DAMAGED' | 'LOST';

export interface Borrowing {
    id: number;
    userId: number;
    bookCopyId: number;
    status: BorrowStatus;
    borrowDate: string;
    dueDate?: string;
    actualReturnDate?: string;
    condition?: ReturnCondition;
    lateFee: number;
    damageFee: number;
    totalFine: number;
    isPickedUp: boolean;
    isPaid: boolean;
    rejectReason?: string;
    createdAt: string;
    bookCopy?: {
        id: number;
        copyNumber: number;
        book: {
            title: string;
            author: string;
            price?: number;
        };
    };
    user?: User;
}
