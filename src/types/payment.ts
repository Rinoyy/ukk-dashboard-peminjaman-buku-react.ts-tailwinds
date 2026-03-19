export interface PaymentSuccessResponse {
    message: string;
    totalFine: number;
    amountPaid: number;
    change: number;
}
