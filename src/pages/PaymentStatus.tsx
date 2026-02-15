import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkPaymentStatus } from '@/lib/paymentService';
import { updateRegistrationStatus } from '@/lib/registrationService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentStatus = () => {
    const { txnId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING');

    useEffect(() => {
        if (!txnId) {
            setStatus('FAILED');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await checkPaymentStatus(txnId);

                if (response.success && response.status === 'PAYMENT_SUCCESS') {
                    // Update Firebase status to Verified
                    // Note: In a real app, the webhook should do this, but for this flow we do it here
                    // We need to match the txnId to the registration ID or query by txnId
                    // For simplicity, we assume txnId IS the registration ID or we can query it

                    // Actually, we don't have the doc ID here unless we passed it.
                    // But we can update based on query if needed, or if txnId was stored.
                    // Let's assume the user is still in the session or we can find them.

                    // Since we can't easily find the doc ID by txnId without a query (which needs an index),
                    // and we generated the txnId in the frontend, let's assume we store the doc ID in localStorage
                    // before redirecting, or pass it in the state.

                    const pendingRegId = localStorage.getItem('pendingRegistrationId');
                    if (pendingRegId) {
                        await updateRegistrationStatus(pendingRegId, 'Verified');
                        localStorage.removeItem('pendingRegistrationId');
                    }

                    setStatus('SUCCESS');
                } else {
                    setStatus('FAILED');
                }
            } catch (error) {
                console.error("Verification error", error);
                setStatus('FAILED');
            }
        };

        verifyPayment();
    }, [txnId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
                {status === 'LOADING' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                        <h2 className="text-2xl font-bold">Verifying Payment...</h2>
                        <p className="text-slate-500">Please wait while we confirm your transaction.</p>
                    </>
                )}

                {status === 'SUCCESS' && (
                    <>
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Payment Successful!</h2>
                        <p className="text-slate-500">Your registration has been verified.</p>
                        <Button onClick={() => navigate('/')} className="w-full font-bold bg-slate-900 text-white">
                            Go to Home
                        </Button>
                    </>
                )}

                {status === 'FAILED' && (
                    <>
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Payment Failed</h2>
                        <p className="text-slate-500">We couldn't verify your payment. Please try again or contact support.</p>
                        <Button onClick={() => navigate('/')} variant="outline" className="w-full font-bold">
                            Go to Home
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
