import { useState, useCallback, useEffect } from 'react';
import { borrowService } from '../services/borrow.service';

interface FinesSummary {
    totalPaid: number;
    totalUnpaid: number;
    paidCount: number;
    unpaidCount: number;
}

interface FineRecord {
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

export const useFines = () => {
    const [summary, setSummary] = useState<FinesSummary | null>(null);
    const [fines, setFines] = useState<FineRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchFinesRecap = useCallback(async () => {
        setLoading(true);
        try {
            const data = await borrowService.getFinesRecap();
            setSummary(data.summary);
            setFines(data.fines);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinesRecap();
    }, [fetchFinesRecap]);

    return { summary, fines, loading, error, fetchFinesRecap };
};
