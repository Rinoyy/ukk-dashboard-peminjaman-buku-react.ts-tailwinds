import { useState, useCallback } from 'react';
import { getBorrowings, adminApproveBorrow, adminVerifyReturn, payFine } from '../services/borrow.service';
import type { Borrowing, PaymentSuccessResponse } from '../types';

export const useBorrow = () => {
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBorrowings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getBorrowings();
            setBorrowings(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch borrowings');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleApprove = async (id: number, status: 'BORROWED' | 'REJECTED') => {
        try {
            await adminApproveBorrow(id, status);
            fetchBorrowings();
            return true;
        } catch (err) {
            alert('Failed to update status');
            return false;
        }
    };

    const handleVerifyReturn = async (
        id: number,
        status: 'RETURNED' | 'BORROWED',
        condition?: 'GOOD' | 'DAMAGED' | 'LOST',
        damageFee?: number
    ) => {
        try {
            const result = await adminVerifyReturn(id, status, condition, damageFee);
            fetchBorrowings();
            return result;
        } catch (err) {
            alert('Failed to verify return');
            return false;
        }
    };

    const handlePayFine = async (id: number, amountPaid: number) => {
        try {
            const result = await payFine(id, amountPaid);
            fetchBorrowings();
            return result;
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to process payment');
            return null;
        }
    };

    return {
        borrowings,
        loading,
        error,
        fetchBorrowings,
        adminApproveBorrow: handleApprove,
        adminVerifyReturn: handleVerifyReturn,
        payFine: handlePayFine
    };
};
