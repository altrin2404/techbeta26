import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const PORT = process.env.PORT || 3001;

// PHONEPE CONFIG (SANDBOX)
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

console.log("-----------------------------------------");
console.log("PhonePe Server Config:");
console.log("MERCHANT_ID:", MERCHANT_ID);
console.log("SALT_INDEX:", SALT_INDEX);
console.log("HOST:", PHONEPE_HOST_URL);
console.log("-----------------------------------------");

// Initiate Payment Route
app.post('/api/payment', async (req, res) => {
    try {
        const { name, amount, number, transactionId } = req.body;

        const data = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: "MUID" + Date.now(),
            name: name,
            amount: amount * 100, // Amount in paise
            redirectUrl: `http://localhost:5173/payment-status/${transactionId}`, // Redirect back to frontend
            redirectMode: "REDIRECT",
            mobileNumber: number,
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = SALT_INDEX;
        const string = payloadMain + '/pg/v1/pay' + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        console.log("DEBUG: PayloadMain (Base64):", payloadMain);
        console.log("DEBUG: String to Hash:", string);
        console.log("DEBUG: Generated Checksum:", checksum);

        const options = {
            method: 'POST',
            url: `${PHONEPE_HOST_URL}/pg/v1/pay`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID
            },
            data: {
                request: payloadMain
            }
        };

        const response = await axios.request(options);

        if (response.data.success) {
            return res.status(200).json({
                success: true,
                url: response.data.data.instrumentResponse.redirectInfo.url
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Payment initiation failed",
                error: response.data
            });
        }

    } catch (error) {
        console.error("Error in Payment Initiation:", error.message);
        if (error.response) {
            console.error("PhonePe Error Data:", JSON.stringify(error.response.data, null, 2));
        }
        console.error("Request Body:", req.body);
        res.status(500).json({ success: false, message: error.message, details: error.response?.data });
    }
});

// Check Payment Status Route
app.get('/api/status/:txnId', async (req, res) => {
    try {
        const merchantTransactionId = req.params.txnId;
        const merchantId = MERCHANT_ID;
        const keyIndex = SALT_INDEX;
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const options = {
            method: 'GET',
            url: `${PHONEPE_HOST_URL}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': `${merchantId}`
            }
        };

        const response = await axios.request(options);

        if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
            return res.status(200).json({
                success: true,
                status: "PAYMENT_SUCCESS",
                data: response.data
            });
        } else {
            return res.status(200).json({ // Return 200 but with success: false for frontend handling
                success: false,
                status: response.data.code, // e.g., PAYMENT_PENDING, PAYMENT_ERROR
                data: response.data
            });
        }

    } catch (error) {
        console.error("Error checking status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
