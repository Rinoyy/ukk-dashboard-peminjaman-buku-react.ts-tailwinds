import { useState, useCallback } from 'react';
import { visitService, type Visit } from '../services/visitService';

export const useVisits = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [todayCount, setTodayCount] = useState(0);
    const [loading, setLoading] = useState(false);

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

    return { visits, todayCount, loading, fetchVisits, fetchTodayCount };
};
