import { db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    Timestamp
} from "firebase/firestore";

export interface Registration {
    id?: string;
    name: string;
    college: string;
    department: string;
    email: string;
    phone: string;
    events: string[];
    transactionId: string;
    upiName?: string;
    status: string;
    registrationDate: string;
}

const REGISTRATIONS_COLLECTION = "registrations";

// Add a new registration
export const addRegistration = async (data: Omit<Registration, 'id' | 'registrationDate' | 'status'>) => {
    try {
        const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
            ...data,
            registrationDate: Timestamp.now(),
            status: "Pending Verification"
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding registration:", error);
        return { success: false, error };
    }
};

// Get all registrations
export const getRegistrations = async (): Promise<Registration[]> => {
    try {
        const q = query(
            collection(db, REGISTRATIONS_COLLECTION),
            orderBy("registrationDate", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            registrationDate: doc.data().registrationDate?.toDate().toISOString() || new Date().toISOString()
        })) as Registration[];
    } catch (error) {
        console.error("Error getting registrations:", error);
        return [];
    }
};

// Listen to real-time updates
export const subscribeToRegistrations = (callback: (registrations: Registration[]) => void) => {
    const q = query(
        collection(db, REGISTRATIONS_COLLECTION),
        orderBy("registrationDate", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const registrations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            registrationDate: doc.data().registrationDate?.toDate().toISOString() || new Date().toISOString()
        })) as Registration[];
        callback(registrations);
    });
};
