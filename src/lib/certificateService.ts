import { db } from "./firebase";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

export interface Certificate {
    id: string;
    email: string;
    name: string;
    type: 'First' | 'Second' | 'Participation';
    url: string;
    event?: string;
    timestamp?: any;
}

const COLLECTION_NAME = "certificates";

/**
 * Fetches all certificates associated with a given email.
 */
export const getCertificatesByEmail = async (email: string): Promise<Certificate[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("email", "==", email.toLowerCase().trim())
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Certificate[];
    } catch (error) {
        console.error("Error fetching certificates: ", error);
        throw error;
    }
};

/**
 * Adds a new certificate record (to be used by admin or bulk upload).
 */
export const addCertificate = async (data: Omit<Certificate, "id" | "timestamp">) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            email: data.email.toLowerCase().trim(),
            timestamp: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding certificate: ", error);
        return { success: false, error };
    }
};
