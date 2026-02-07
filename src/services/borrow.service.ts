import api from './api';
import type { Borrowing, PaymentSuccessResponse } from '../types';

export const getBorrowings = async () => {
    const response = await api.get<Borrowing[]>('/borrow');
    return response.data;
};

export const adminApproveBorrow = async (id: number, status: 'BORROWED' | 'REJECTED') => {
    const response = await api.post<Borrowing>(`/borrow/${id}/approve`, { status });
    return response.data;
};

export const adminVerifyReturn = async (
    id: number,
    status: 'RETURNED' | 'BORROWED',
    condition?: 'GOOD' | 'DAMAGED' | 'LOST',
    damageFee?: number
) => {
    const response = await api.post<Borrowing>(`/borrow/${id}/verify-return`, {
        status,
        condition,
        damageFee
    });
    return response.data;
};

export const payFine = async (id: number, amountPaid: number) => {
    const response = await api.post<PaymentSuccessResponse>(`/borrow/${id}/pay`, { amountPaid });
    return response.data;
};

export const getFinesRecap = async () => {
    const response = await api.get<any>('/borrow/fines-recap');
    return response.data;
};
