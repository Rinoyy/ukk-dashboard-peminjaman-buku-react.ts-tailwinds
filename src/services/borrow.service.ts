import { API_URL, getHeaders, handleResponse } from './api';
import type { Borrowing, PaymentSuccessResponse } from '../types';

class BorrowService {
    async getBorrowings(): Promise<Borrowing[]> {
        const response = await fetch(`${API_URL}/borrow`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }

    async adminApproveBorrow(id: number, status: 'BORROWED' | 'REJECTED'): Promise<Borrowing> {
        const response = await fetch(`${API_URL}/borrow/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        return handleResponse(response);
    }

    async adminVerifyReturn(
        id: number,
        status: 'RETURNED' | 'BORROWED',
        condition?: 'GOOD' | 'DAMAGED' | 'LOST',
        damageFee?: number
    ): Promise<Borrowing> {
        const response = await fetch(`${API_URL}/borrow/${id}/verify-return`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ status, condition, damageFee }),
        });
        return handleResponse(response);
    }

    async payFine(id: number, amountPaid: number): Promise<PaymentSuccessResponse> {
        const response = await fetch(`${API_URL}/borrow/${id}/pay`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amountPaid }),
        });
        return handleResponse(response);
    }

    async getFinesRecap() {
        const response = await fetch(`${API_URL}/borrow/fines-recap`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    }
}

export const borrowService = new BorrowService();
