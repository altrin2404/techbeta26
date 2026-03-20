
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyByAKtb64avuvVWHQWu5yDUpCe-DZCAick",
    authDomain: "techbeta2k26.firebaseapp.com",
    projectId: "techbeta2k26",
    storageBucket: "techbeta2k26.firebasestorage.app",
    messagingSenderId: "643189801345",
    appId: "1:643189801345:web:25b0f35155587f8d2b2880",
    measurementId: "G-Z8X5VQGLFV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const missedRegistration = {
    name: "Effie Lettisa W",
    email: "effielettisa19@gmail.com",
    phone: "9385835816",
    college: "Arunachala College of Engineering for women",
    department: "AI&DS",
    events: ["FutureMinds"],
    transactionId: "pay_ST1CjU4EDT6wUm",
    upiName: "Manual Fix - Razorpay",
    status: "Pending Verification",
    registrationDate: new Date().toISOString(),
    timestamp: serverTimestamp(),
    members: [
        {
            name: "Effie Lettisa W",
            email: "effielettisa19@gmail.com",
            phone: "9385835816",
            college: "Arunachala College of Engineering for women",
            department: "AI&DS",
            year: "2nd Year",
            events: ["FutureMinds"],
            teamName: { "FutureMinds": "Gen AI" }
        },
        {
            name: "Neha Arockia Yuvika J",
            email: "nehajohnson1206@gmail.com",
            phone: "9342582162",
            college: "Arunachala College of Engineering for women",
            department: "AI&DS",
            year: "2nd Year",
            events: ["FutureMinds"],
            teamName: { "FutureMinds": "Gen Ai" }
        }
    ]
};

async function addMissed() {
    try {
        console.log("Adding missed participants to Firebase...");
        const docRef = await addDoc(collection(db, "registrations"), missedRegistration);
        console.log("Success! Document ID:", docRef.id);
        process.exit(0);
    } catch (e) {
        console.error("Error adding document: ", e);
        process.exit(1);
    }
}

addMissed();
