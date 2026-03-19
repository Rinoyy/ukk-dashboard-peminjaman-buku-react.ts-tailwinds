export type BookCopyStatus = 'AVAILABLE' | 'BORROWED' | 'DAMAGED' | 'LOST';

export interface BookCopy {
    id: number;
    bookId: number;
    copyNumber: number;
    qrCode: string;
    status: BookCopyStatus;
}

export interface Book {
    id: number;
    categoryId: number;
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
    totalCopies?: number;
}

export interface BookFormData {
    title: string;
    author: string;
    categoryId?: number;
    description?: string;
    stock?: number;
}

export interface BookFilterParams {
    search?: string;
    categoryId?: number;
}
