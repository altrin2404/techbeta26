
import emailjs from '@emailjs/browser';

const SERVICE_ID = "service_zhauh4p";
const TEMPLATE_ID = "template_kmm8oux";
// TODO: Update with your actual Public Key from EmailJS Account > Keys
const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

interface EmailParams {
    to_name: string;
    to_email: string;
    transaction_id: string;
    qr_code_url: string;
    event_date: string;
    event_time: string;
    event_venue: string;
    message: string;
}

export const sendVerificationEmail = async (
    toName: string,
    toEmail: string,
    transactionId: string,
    qrCodeUrl: string
) => {
    try {
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            {
                to_name: toName,
                to_email: toEmail,
                transaction_id: transactionId,
                qr_code_url: qrCodeUrl,
                event_date: "March 13, 2026",
                event_time: "09:00 AM",
                event_venue: "Rock Auditorium, SXCCE, Nagercoil",
                message: "Congratulations! Your registration for TechBeta'26 has been verified. Please show the QR code below at the registration desk."
            },
            PUBLIC_KEY
        );
        console.log("Email sent successfully!", response.status, response.text);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
};
