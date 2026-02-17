import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    Download,
    Trash2,
    LayoutDashboard,
    LogOut,
    ArrowLeft,
    ShieldCheck,
    Calendar,
    Layers,
    CheckCircle,
    XCircle,
    Clock,
    QrCode,
    ScanLine,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { subscribeToRegistrations, updateRegistrationStatus, deleteRegistration, type Registration } from "@/lib/registrationService";
import { sendVerificationEmail } from "@/lib/emailService";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import QRScannerDialog from "@/components/QRScannerDialog";
import ErrorBoundary from "@/components/ErrorBoundary";

const ADMIN_EMAIL_DOMAIN = "techbeta2k26.firebaseapp.com";

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        let unsubscribeFirestore: (() => void) | null = null;

        // Listen to Firebase auth state
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setIsAuthLoading(false);

            // Only subscribe to Firestore when authenticated
            if (user) {
                unsubscribeFirestore = subscribeToRegistrations((data) => {
                    setRegistrations(data);
                    setIsLoading(false);
                });
            } else {
                // Clean up Firestore subscription on logout
                if (unsubscribeFirestore) {
                    unsubscribeFirestore();
                    unsubscribeFirestore = null;
                }
                setRegistrations([]);
                setIsLoading(true);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeFirestore) unsubscribeFirestore();
        };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoginLoading(true);
        try {
            const email = `${username}@${ADMIN_EMAIL_DOMAIN}`;
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login Successful");
        } catch (error: any) {
            console.error("Login error:", error);
            const code = error?.code || "unknown";
            if (code === "auth/user-not-found") {
                toast.error("User not found. Check your ID.");
            } else if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
                toast.error("Wrong password. Try again.");
            } else if (code === "auth/operation-not-allowed") {
                toast.error("Email/Password sign-in is not enabled in Firebase Console.");
            } else {
                toast.error(`Login failed: ${code}`);
            }
        } finally {
            setIsLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        const updatedData = registrations.map(reg =>
            reg.id === id ? { ...reg, status: newStatus as Registration['status'] } : reg
        );
        setRegistrations(updatedData);

        const result = await updateRegistrationStatus(id, newStatus);

        if (result.success) {
            toast.success(`Status updated to ${newStatus}`);

            if (newStatus === "Verified") {
                toast.loading("Sending verification emails...");

                const participant = registrations.find(r => r.id === id);
                if (participant) {
                    let successCount = 0;

                    // Loop through members or default to lead if no members array (legacy)
                    const membersToNotify = participant.members || [{
                        name: participant.name,
                        email: participant.email,
                        phone: participant.phone,
                        college: participant.college,
                        department: participant.department,
                        events: participant.events
                    }];

                    for (let i = 0; i < membersToNotify.length; i++) {
                        const m = membersToNotify[i];

                        // Generate Unique QR Data for each member (including index)
                        const qrData = JSON.stringify({ id: participant.id, index: i, name: m.name, events: m.events });
                        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

                        // Send email to this specific member
                        const emailResult = await sendVerificationEmail(
                            m.name,
                            m.email,
                            participant.transactionId,
                            qrCodeUrl
                        );

                        if (emailResult.success) successCount++;
                        // Small delay to be gentle on API
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }

                    if (successCount === membersToNotify.length) {
                        toast.success(`Verification emails sent to all ${successCount} members!`);
                    } else {
                        toast.warning(`Sent ${successCount}/${membersToNotify.length} emails. Some failed.`);
                    }
                }
            }
        } else {
            toast.error("Failed to update status");
            // Revert optimistic update if needed, but subscription will handle it eventually
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this registration?")) return;

        // Optimistic update
        const updatedData = registrations.filter(reg => reg.id !== id);
        setRegistrations(updatedData);

        const result = await deleteRegistration(id);

        if (result.success) {
            toast.success("Registration deleted");
        } else {
            toast.error("Failed to delete registration");
        }
    };

    const downloadCSV = () => {
        const headers = ["Team ID", "Team Lead", "Member Name", "Member Email", "Member Phone", "Member College", "Member Dept", "Member Events", "Transaction ID", "UPI Name", "Status", "Date", "Original QR Link", "QR Image Formula (Sheets)"];

        const csvRows: string[][] = [];

        let rowCount = 2;

        registrations.forEach(reg => {
            const members = reg.members || [{
                name: reg.name,
                email: reg.email,
                phone: reg.phone,
                college: reg.college,
                department: reg.department,
                events: reg.events
            }];

            members.forEach((m, i) => {
                const qrData = JSON.stringify({ id: reg.id, index: i, name: m.name, events: m.events });
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

                csvRows.push([
                    reg.id,
                    reg.name, // Team Lead Name
                    m.name,
                    m.email,
                    m.phone,
                    m.college,
                    m.department,
                    (m.events || []).join("; "),
                    reg.transactionId,
                    reg.upiName || "N/A",
                    reg.status,
                    new Date(reg.registrationDate).toLocaleDateString(),
                    qrUrl,
                    `=IMAGE(M${rowCount})`
                ]);
                rowCount++;
            });
        });

        const csvContent = [headers.join(","), ...csvRows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "techbeta26_registrations_per_member.csv";
        a.click();
    };

    const [scannedParticipant, setScannedParticipant] = useState<Registration | null>(null);
    const [scannedMemberIndex, setScannedMemberIndex] = useState<number>(-1);

    const handleScan = (decodedText: string) => {
        console.log("Scanned Text:", decodedText);
        // alert(`Raw Scan: ${decodedText}`); // Option to enable if needed

        try {
            const data = JSON.parse(decodedText);
            console.log("Parsed Data:", data);

            if (data.id) {
                // alert(`Searching for ID: ${data.id}`); // Debug Alert
                const participant = registrations.find(r => r.id === data.id);
                console.log("Found Participant:", participant);

                if (participant) {
                    setScannedParticipant(participant);
                    if (data.index !== undefined) {
                        setScannedMemberIndex(data.index);
                    } else {
                        setScannedMemberIndex(-1);
                    }
                    setIsScannerOpen(false);
                } else {
                    alert(`Error: Participant ID '${data.id}' not found in database.`);
                    toast.error("Participant not found in database.");
                }
            } else {
                alert("Error: Invalid QR Code (No ID found).");
                toast.error("Invalid QR Code format.");
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            alert(`Scan Error: ${e}`);
            toast.error("Failed to read QR Code.");
        }
        setIsScannerOpen(false);
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-black/5">
                        <div className="flex flex-col items-center mb-8">
                            <ShieldCheck className="h-12 w-12 text-purple-600 mb-4" />
                            <h1 className="text-2xl font-bold text-slate-800">Admin Control</h1>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input placeholder="ID" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <Button type="submit" className="w-full h-11 bg-purple-600" disabled={isLoginLoading}>
                                {isLoginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {isLoginLoading ? "Launching..." : "Launch"}
                            </Button>
                        </form>
                        <Link to="/" className="mt-6 text-sm text-slate-400 text-center block">← Back to Website</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-6 w-6 text-purple-600" />
                    <div>
                        <h2 className="font-bold text-slate-800">Admin Console</h2>
                        <p className="text-[10px] font-black uppercase text-purple-600 tracking-tighter">TechBeta'26 Live</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 font-bold"><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
            </nav>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border flex items-center gap-4">
                        <Users className="text-blue-500 h-8 w-8" />
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Total Registrations</p>
                            <p className="text-2xl font-black">{registrations.reduce((acc, curr) => acc + (curr.members ? curr.members.length : 1), 0)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border flex items-center gap-4">
                        <Layers className="text-purple-500 h-8 w-8" />
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Revenue</p>
                            <p className="text-2xl font-black">₹ {registrations.filter(r => r.status === "Verified").reduce((acc, curr) => acc + (curr.members ? curr.members.length : 1), 0)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border flex items-center gap-4">
                        <Clock className="text-orange-500 h-8 w-8" />
                        <div><p className="text-xs font-bold text-slate-500 uppercase">Pending</p><p className="text-2xl font-black">{registrations.filter(r => r.status === "Pending Verification").length}</p></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search Team Lead, College or TxID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => setIsScannerOpen(true)} className="bg-purple-600 hover:bg-purple-700 font-bold">
                        <ScanLine className="h-4 w-4 mr-2" /> Scan Ticket
                    </Button>
                    <Button onClick={downloadCSV} variant="outline" className="font-bold"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
                </div>

                <QRScannerDialog
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScan={handleScan}
                />

                {/* Scanned/Selected Participant Details Dialog */}
                <Dialog open={!!scannedParticipant} onOpenChange={(open) => {
                    if (!open) {
                        setScannedParticipant(null);
                        setScannedMemberIndex(-1);
                    }
                }}>
                    <DialogContent className="max-w-md bg-white border-2 border-purple-500 rounded-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-purple-600 p-6 flex flex-col items-center justify-center text-white">
                            <CheckCircle className="h-12 w-12 mb-2" />
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-center">
                                {scannedParticipant?.status === "Verified" ? "Admit Team" : "Verify Team"}
                            </DialogTitle>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900">{scannedParticipant?.name} <span className="text-xs font-normal text-slate-500">(Lead)</span></h3>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{scannedParticipant?.college}</p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Team Size</span>
                                    <span className="font-mono font-bold text-slate-800">{scannedParticipant?.members?.length || 1} Members</span>
                                </div>

                                {scannedParticipant?.members && (
                                    <div className="pt-2 border-t border-slate-200 mt-2">
                                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Team Members</p>
                                        <ul className="space-y-3">
                                            {scannedParticipant.members.map((m, i) => (
                                                <li
                                                    key={i}
                                                    className={`text-xs p-2 rounded-lg transition-all ${scannedMemberIndex === i
                                                        ? "bg-green-100 border-2 border-green-500 shadow-md transform scale-105"
                                                        : "bg-slate-100 border border-transparent"
                                                        }`}
                                                >
                                                    <div className="flex justify-between mb-1">
                                                        <span className={`font-bold ${scannedMemberIndex === i ? "text-green-800" : "text-slate-700"}`}>
                                                            {m.name} {scannedMemberIndex === i && <span className="text-[9px] bg-green-200 text-green-800 px-1 rounded ml-2">MATCH</span>}
                                                        </span>
                                                        <span className="text-slate-400">{m.phone}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>{m.department}</span>
                                                        <span>{m.college}</span>
                                                    </div>
                                                    {/* Added display for member's events */}
                                                    <div className="mt-1 text-[9px] text-primary/80 font-semibold">
                                                        Events: {(m.events || []).join(', ')}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1 text-sm pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Events</span>
                                    <div className="flex flex-wrap gap-1">
                                        {(scannedParticipant?.events || []).map((e, i) => (
                                            <span key={i} className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">{e}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {scannedParticipant?.status === "Pending Verification" ? (
                                    <Button
                                        onClick={() => {
                                            if (scannedParticipant) {
                                                updateStatus(scannedParticipant.id, "Verified");
                                                setScannedParticipant(null);
                                                setScannedMemberIndex(-1);
                                            }
                                        }}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 text-lg shadow-lg shadow-green-200"
                                    >
                                        Verify & Admit Team
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl font-bold border border-green-200">
                                        <CheckCircle size={18} /> Team Already Verified
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setScannedParticipant(null);
                                        setScannedMemberIndex(-1);
                                    }}
                                    className="w-full font-bold"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="bg-white rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr className="text-[10px] font-black uppercase text-slate-500">
                                    <th className="px-6 py-4">Team Lead / Member</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Events</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground flex items-center gap-2">
                                                {reg.name}
                                                {reg.members && reg.members.length > 1 && (
                                                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-black">
                                                        +{reg.members.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-bold text-primary uppercase">{reg.college}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-foreground">{reg.phone}</div>
                                            <div className="text-[10px] text-muted-foreground">{reg.email}</div>
                                            {reg.members && reg.members.length > 1 && <div className="text-[9px] text-slate-400 font-bold mt-1">Total: {reg.members.length} Members</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {(reg.events || []).map((e, i) => (
                                                    <span key={i} className="text-[9px] font-black bg-primary/10 text-foreground px-1.5 py-0.5 rounded">{e}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-foreground font-mono">ID: {reg.transactionId}</div>
                                            {reg.upiName && <div className="text-[10px] text-primary font-black uppercase">UPI: {reg.upiName}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${reg.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setScannedParticipant(reg)} className="text-primary h-8 w-8 hover:bg-primary/5">
                                                <ScanLine size={16} />
                                            </Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 h-8 w-8 hover:bg-slate-100">
                                                        <QrCode size={16} />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-xs bg-white dark:bg-slate-900 border-black/5 dark:border-white/10 rounded-3xl text-center">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-center font-display text-xl bold">Participant QR</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="py-4 flex flex-col items-center">
                                                        <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-sm mb-4">
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: reg.id, name: reg.name, events: reg.events }))}`}
                                                                alt="Unique Participant QR"
                                                                className="h-40 w-40"
                                                            />
                                                        </div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{reg.name}</p>
                                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1 lowercase">ID: {reg.id}</p>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {reg.status === "Pending Verification" && (
                                                <Button onClick={() => updateStatus(reg.id, "Verified")} variant="ghost" size="icon" className="text-green-500 h-8 w-8 hover:bg-green-50"><CheckCircle size={16} /></Button>
                                            )}
                                            <Button onClick={() => handleDelete(reg.id)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 h-8 w-8"><Trash2 size={16} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

const AdminDashboardWithBoundary = () => (
    <ErrorBoundary>
        <AdminDashboard />
    </ErrorBoundary>
);

export default AdminDashboardWithBoundary;
