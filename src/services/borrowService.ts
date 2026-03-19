import { API_URL, forceLogout, isUnauthorized } from './api';
import type { Borrowing, PaymentSuccessResponse } from '../types';

class BorrowService {
    async getBorrowings(): Promise<Borrowing[]> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/borrow`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil data peminjaman');
        }

        return response.json();
    }

    async adminApproveBorrow(id: number, status: 'BORROWED' | 'REJECTED', rejectReason?: string): Promise<Borrowing> {
        if (!id || id <= 0) {
            throw new Error('ID peminjaman tidak valid');
        }
        if (!status) {
            throw new Error('Status wajib diisi');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/borrow/${id}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ status, rejectReason }),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menyetujui peminjaman');
        }

        return response.json();
    }

    async adminVerifyReturn(
        id: number,
        status: 'RETURNED' | 'BORROWED',
        condition?: 'GOOD' | 'DAMAGED' | 'LOST',
        damageFee?: number
    ): Promise<Borrowing> {
        if (!id || id <= 0) {
            throw new Error('ID peminjaman tidak valid');
        }
        if (!status) {
            throw new Error('Status wajib diisi');
        }
        if (damageFee !== undefined && damageFee < 0) {
            throw new Error('Biaya kerusakan tidak boleh negatif');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/borrow/${id}/verify-return`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ status, condition, damageFee }),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal verifikasi pengembalian');
        }

        return response.json();
    }

    async payFine(id: number, amountPaid: number): Promise<PaymentSuccessResponse> {
        if (!id || id <= 0) {
            throw new Error('ID peminjaman tidak valid');
        }
        if (amountPaid === undefined || amountPaid <= 0) {
            throw new Error('Jumlah pembayaran harus lebih dari 0');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/borrow/${id}/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ amountPaid }),
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal membayar denda');
        }

        return response.json();
    }

    async markPickedUp(id: number): Promise<Borrowing> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/borrow/${id}/pickup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) { forceLogout(); throw new Error('Unauthorized'); }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menandai buku diambil');
        }
        return response.json();
    }

    async getFinesRecap() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/borrow/fines-recap`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (isUnauthorized(response.status)) {
            forceLogout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil rekap denda');
        }

        return response.json();
    }
}

export const borrowService = new BorrowService();
