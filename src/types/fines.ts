export interface FinesSummary {
    totalPaid: number;
    totalUnpaid: number;
    paidCount: number;
    unpaidCount: number;
}

export interface FineRecord {
    id: number;
    user: { username: string };
    bookCopy: { book: { title: string } };
    lateFee: number;
    damageFee: number;
    totalFine: number;
    isPaid: boolean;
    createdAt: string;
    actualReturnDate: string;
}
