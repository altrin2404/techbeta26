import { db } from "./firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";

export interface TeamMember {
    name: string;
    email: string;
    phone: string;
    college: string;
    department: string;
    year: string;
    events: string[];
    attendance?: { [eventName: string]: { attended: boolean; timestamp: string } };
    isVerified?: boolean;
}

export interface Registration {
    id: string; // Document ID
    name: string; // Team Lead Name
    college: string; // Team Lead College (kept for backward compatibility/indexing)
    department: string; // Team Lead Dept (kept for backward compatibility/indexing)
    email: string; // Team Lead Email
    phone: string; // Team Lead Phone
    members?: TeamMember[]; // Array of team members
    events: string[];
    transactionId: string;
    upiName?: string;
    status: 'Pending Verification' | 'Verified' | 'Rejected';
    registrationDate: string; // ISO String
    timestamp: any; // Firestore server timestamp
}

const COLLECTION_NAME = "registrations";
const GOOGLE_SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;

const backupToGoogleSheets = async (data: any) => {
    if (!GOOGLE_SHEETS_URL) {
        console.warn("Google Sheets Webhook URL missing in .env");
        return;
    }

    try {
        // We use fetch with 'no-cors' because Google Apps Script redirects 
        // cause CORS issues in browsers even if the script works.
        await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log("Backup sent to Google Sheets");
    } catch (error) {
        console.error("Error sending backup to Google Sheets:", error);
    }
};

// Sanitize user input: trim, remove HTML tags, limit length
const sanitizeInput = (value: string, maxLength: number = 200): string => {
    if (!value || typeof value !== 'string') return '';
    return value
        .replace(/<[^>]*>/g, '')   // Remove HTML tags
        .replace(/[<>]/g, '')       // Remove leftover angle brackets
        .trim()
        .substring(0, maxLength);
};

const sanitizeMembers = (members: TeamMember[]): TeamMember[] => {
    return members.map(m => ({
        ...m,
        name: sanitizeInput(m.name, 100),
        email: sanitizeInput(m.email, 100),
        phone: sanitizeInput(m.phone, 15),
        college: sanitizeInput(m.college, 150),
        department: sanitizeInput(m.department, 100),
        year: sanitizeInput(m.year, 20),
        events: (m.events || []).map(e => sanitizeInput(e, 50)),
    }));
};

export const addRegistration = async (data: Omit<Registration, "id" | "status" | "registrationDate" | "timestamp">) => {
    try {
        const sanitizedData = {
            ...data,
            name: sanitizeInput(data.name, 100),
            email: sanitizeInput(data.email, 100),
            phone: sanitizeInput(data.phone, 15),
            college: sanitizeInput(data.college, 150),
            department: sanitizeInput(data.department, 100),
            transactionId: sanitizeInput(data.transactionId, 50),
            upiName: data.upiName ? sanitizeInput(data.upiName, 100) : undefined,
            events: (data.events || []).map(e => sanitizeInput(e, 50)),
            members: data.members ? sanitizeMembers(data.members) : undefined,
        };

        const registrationDate = new Date().toISOString();
        const status = "Verified";

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...sanitizedData,
            members: sanitizedData.members?.map(m => ({ ...m, isVerified: true })),
            status: status,
            registrationDate: registrationDate,
            timestamp: serverTimestamp()
        });

        // Send Verification Emails (QR Codes) to all members immediately
        const membersToNotify = sanitizedData.members || [{
            name: sanitizedData.name,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            college: sanitizedData.college,
            department: sanitizedData.department,
            year: (sanitizedData as any).year,
            events: sanitizedData.events
        }];

        const { sendVerificationEmail } = await import("./emailService");

        for (let i = 0; i < membersToNotify.length; i++) {
            const m = membersToNotify[i];
            const qrData = JSON.stringify({ 
                id: docRef.id, 
                index: i, 
                name: m.name, 
                events: (m.events || []) 
            });
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
            
            // We use await to ensure emails are sent, but in a real-world scenario 
            // we might want to handle failures more gracefully or do it in the background.
            // For now, we'll try to send them and log results.
            sendVerificationEmail(m.name, m.email, sanitizedData.transactionId, qrCodeUrl)
                .then(res => console.log(`Email sent to ${m.name}:`, res))
                .catch(err => console.error(`Failed to send email to ${m.name}:`, err));
        }

        // Backup to Google Sheets (Async, don't wait for it to finish)
        // We now loop through each member to create individual rows as requested
        if (sanitizedData.members && sanitizedData.members.length > 0) {
            sanitizedData.members.forEach((member) => {
                backupToGoogleSheets({
                    name: member.name,
                    department: member.department,
                    year: member.year,
                    college: member.college,
                    phone: member.phone,
                    email: member.email,
                    eventsList: member.events.join(", "),
                    status: status,
                    transactionId: sanitizedData.transactionId, // Keep for reference if needed
                    id: docRef.id // Firestore ID for reference
                });
            });
        }

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding registration: ", error);
        return { success: false, error };
    }
};

export const subscribeToRegistrations = (callback: (data: Registration[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
        const registrations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Registration[];
        callback(registrations);
    });
};

export const updateRegistrationStatus = async (id: string, status: string) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { status });
        return { success: true };
    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, error };
    }
};

export const deleteRegistration = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting registration: ", error);
        return { success: false, error };
    }
};

export const markMemberAttendance = async (registrationId: string, memberIndex: number, eventName: string, attended: boolean = true) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, registrationId);
        // We need to get the current data to update the specific member in the array
        // However, for efficiency in a live scan, we might want to use a more targeted update if possible
        // But Firestore doesn't easily support updating a specific index in an array without rewriting the array
        // or using some tricks. Since team sizes are small (2-5), rewriting the array is acceptable.

        // This is a helper that would be called after fetching the latest registration data in the component
        // or we fetch it here.
        return { success: false, error: "Use updateRegistrationMembers helper" };
    } catch (error) {
        console.error("Error marking attendance: ", error);
        return { success: false, error };
    }
};

export const updateRegistrationMembers = async (registrationId: string, members: TeamMember[]) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, registrationId);
        await updateDoc(docRef, { members });
        return { success: true };
    } catch (error) {
        console.error("Error updating members: ", error);
        return { success: false, error };
    }
};
