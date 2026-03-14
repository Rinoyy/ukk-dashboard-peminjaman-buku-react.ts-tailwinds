// Dashboard Types
export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'SISWA';
    qrCode?: string;
    createdAt: string;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    _count?: {
        books: number;
    };
}

export interface Book {
    categoryId: number;
    id: number;
    title: string;
    author: string;
    category: {
        id: number;
        name: string;
    };
    description?: string;
    image?: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
    copies?: BookCopy[];
    totalCopies?: number; // Helper for UI
}

export interface BookCopy {
    id: number;
    bookId: number;
    copyNumber: number;
    qrCode: string;
    status: 'AVAILABLE' | 'BORROWED' | 'DAMAGED' | 'LOST';
}

export interface Borrowing {
    id: number;
    userId: number;
    bookCopyId: number;
    status: 'PENDING' | 'BORROWED' | 'RETURN_PENDING' | 'RETURNED' | 'REJECTED';
    borrowDate: string;
    dueDate?: string;
    actualReturnDate?: string;
    condition?: 'GOOD' | 'DAMAGED' | 'LOST';
    lateFee: number;
    damageFee: number;
    totalFine: number;
    isPaid: boolean;
    createdAt: string;
    bookCopy?: {
        id: number;
        copyNumber: number;
        book: {
            title: string;
            author: string;
        };
    };
    user?: User;
}

export interface Visit {
    id: number;
    userId: number;
    visitDate: string;
    user: User;
}

export interface PaymentSuccessResponse {
    message: string;
    totalFine: number;
    amountPaid: number;
    change: number;
}
