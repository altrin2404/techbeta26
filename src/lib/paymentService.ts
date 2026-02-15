import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const initiatePayment = async (data: { name: string; amount: number; number: string; transactionId: string }) => {
    try {
        const response = await axios.post(`${API_URL}/payment`, data);
        return response.data;
    } catch (error) {
        console.error("Error initiating payment:", error);
        return { success: false, error };
    }
};

export const checkPaymentStatus = async (transactionId: string) => {
    try {
        const response = await axios.get(`${API_URL}/status/${transactionId}`);
        return response.data;
    } catch (error) {
        console.error("Error checking payment status:", error);
        return { success: false, error };
    }
};
