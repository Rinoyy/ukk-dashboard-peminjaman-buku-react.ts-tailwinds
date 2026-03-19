import { useState, useCallback } from 'react';
import { visitService, type Visit } from '../services/visitService';

export const useVisits = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [todayCount, setTodayCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<{ type: 'checkin' | 'checkout'; username: string } | null>(null);

    const fetchVisits = useCallback(async (date?: string) => {
        setLoading(true);
        try {
            const data = await visitService.getVisits(date);
            setVisits(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTodayCount = useCallback(async () => {
        try {
            const data = await visitService.getTodayVisitsCount();
            setTodayCount(data.count);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const doCheckIn = useCallback(async (userId: number, currentDate?: string) => {
        setScanLoading(true);
        setScanError(null);
        setScanResult(null);
        try {
            const res = await visitService.checkIn(userId);
            setScanResult({ type: 'checkin', username: res.visit.user.username });
            await fetchVisits(currentDate);
            fetchTodayCount();
        } catch (err) {
            setScanError(err instanceof Error ? err.message : 'Gagal check-in');
        } finally {
            setScanLoading(false);
        }
    }, [fetchVisits, fetchTodayCount]);

    const doCheckOut = useCallback(async (userId: number, currentDate?: string) => {
        setScanLoading(true);
        setScanError(null);
        setScanResult(null);
        try {
            const res = await visitService.checkOut(userId);
            setScanResult({ type: 'checkout', username: res.visit.user.username });
            await fetchVisits(currentDate);
        } catch (err) {
            setScanError(err instanceof Error ? err.message : 'Gagal check-out');
        } finally {
            setScanLoading(false);
        }
    }, [fetchVisits]);

    const clearScan = useCallback(() => {
        setScanError(null);
        setScanResult(null);
    }, []);

    return {
        visits, todayCount, loading,
        scanLoading, scanError, scanResult,
        fetchVisits, fetchTodayCount,
        doCheckIn, doCheckOut, clearScan,
    };
};
