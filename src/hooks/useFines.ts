import { useState, useCallback, useEffect } from 'react';
import { borrowService } from '../services/borrowService';
import type { FinesSummary, FineRecord } from '../types';

export const useFines = () => {
    const [summary, setSummary] = useState<FinesSummary | null>(null);
    const [fines, setFines] = useState<FineRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFinesRecap = useCallback(async () => {
        setLoading(true);
        try {
            const data = await borrowService.getFinesRecap();
            setSummary(data.summary);
            setFines(data.fines);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Gagal mengambil data denda');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinesRecap();
    }, [fetchFinesRecap]);

    return { summary, fines, loading, error, fetchFinesRecap };
};
