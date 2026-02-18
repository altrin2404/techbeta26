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
    Loader2,
    ChevronLeft,
    ChevronRight,
    FileText,
    ChevronDown,
    Filter,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { subscribeToRegistrations, updateRegistrationStatus, deleteRegistration, type Registration } from "@/lib/registrationService";
import { sendVerificationEmail } from "@/lib/emailService";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import QRScannerDialog from "@/components/QRScannerDialog";
import ErrorBoundary from "@/components/ErrorBoundary";

const ADMIN_EMAIL_DOMAIN = "techbeta2k26.firebaseapp.com";

const QRCodeImage = ({ data }: { data: string }) => {
    const [loading, setLoading] = useState(true);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&margin=10`;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[1px] animate-in fade-in duration-300">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">Generating QR...</span>
                </div>
            )}
            <img
                src={qrUrl}
                alt="QR Code"
                className={`w-full h-full object-contain transition-all duration-500 will-change-transform ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                onLoad={() => setLoading(false)}
            />
        </div>
    );
};

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

    const exportAllParticipantsCSV = () => {
        const headers = [
            "Name",
            "Dept",
            "Year",
            "College",
            "Phone",
            "Email",
            "Events",
            "Status",
            "Qr image"
        ];

        const csvRows: string[][] = [];

        registrations.forEach(reg => {
            const members = reg.members || [{
                name: reg.name,
                email: reg.email,
                phone: reg.phone,
                college: reg.college,
                department: reg.department,
                year: (reg as any).year || "N/A", // Fallback for legacy
                events: reg.events
            }];

            members.forEach((m, i) => {
                const memberEvents = Array.isArray(m.events) ? m.events.join("; ") : (m.events || "");
                const year = (m as any).year || "N/A";

                csvRows.push([
                    m.name,
                    m.department,
                    year,
                    m.college,
                    m.phone,
                    m.email,
                    memberEvents,
                    reg.status,
                    `=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: reg.id, index: i, name: m.name, events: m.events }))}")`
                ]);
            });
        });

        const csvContent = [
            headers.join(","),
            ...csvRows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `techbeta26_all_participants_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportMasterExcel = () => {
        const wb = XLSX.utils.book_new();
        const allEvents = new Set<string>();

        // 1. Collect all unique events
        registrations.forEach(reg => {
            const members = reg.members || [{ events: reg.events }];
            members.forEach(m => {
                const events = Array.isArray(m.events) ? m.events : [m.events];
                events.forEach((e: string) => {
                    if (e) allEvents.add(e);
                });
            });
        });

        const sortedEvents = Array.from(allEvents).sort();

        // 2. Create a sheet for each event
        sortedEvents.forEach(eventName => {
            const eventRows: any[] = [];
            let teamCounter = 1;

            registrations.forEach(reg => {
                const members = reg.members || [{
                    name: reg.name,
                    email: reg.email,
                    phone: reg.phone,
                    college: reg.college,
                    department: reg.department,
                    year: (reg as any).year || "",
                    events: reg.events
                }];

                // Check if any member is in this event to assign a Team Number for this event?
                // User said: "Team number stats from 1 and contunes , Team members..."
                // Assuming Team Number is unique per Team in THIS list, or Global Team ID?
                // Use counter for sequential numbering in the sheet.

                // Filter members for this event
                const participatingMembers = members.filter(m => {
                    const memberEvents = Array.isArray(m.events) ? m.events : [m.events];
                    return memberEvents.includes(eventName);
                });

                if (participatingMembers.length > 0) {
                    // Add rows for these members
                    participatingMembers.forEach((m, memberIndex) => { // Need actual index from members array?
                        // Find original index in 'members' array for QR generation
                        const originalIndex = members.indexOf(m);

                        eventRows.push({
                            "Team Number": teamCounter,
                            "Team Member(s)": m.name,
                            "Dept": m.department,
                            "Yr of Study": m.year || "N/A",
                            "Clg": m.college,
                            "Phone No": m.phone,
                            "Email": m.email,
                            "Status": reg.status === "Verified" ? "Verified" : "Pending",
                            "QR": `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: reg.id, index: originalIndex, name: m.name, events: m.events }))}`
                        });
                    });
                    teamCounter++;
                }
            });

            if (eventRows.length > 0) {
                // Define header order strictly
                const headerOrder = [
                    "Team Number", "Team Member(s)", "Dept", "Yr of Study", "Clg", "Phone No", "Email", "Status", "QR"
                ];

                const ws = XLSX.utils.json_to_sheet(eventRows, { header: headerOrder });

                // Post-process to convert QR URL to IMAGE formula
                // QR is the 9th column -> Index 8 -> Column 'I'
                const range = XLSX.utils.decode_range(ws['!ref'] || "A1:I1");
                const qrColIndex = 8; // 0-indexed, 9th column

                for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Skip header row
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: qrColIndex });
                    const cell = ws[cellAddress];

                    if (cell && cell.v) {
                        // cell.v contains the URL. Convert to formula.
                        cell.f = `IMAGE("${cell.v}")`;
                        delete cell.v;
                        cell.t = 's'; // Set as formula/string result (or omit for auto-detect, but 'n' was definitely wrong)
                    }
                }

                // Adjust column widths
                const wscols = [
                    { wch: 15 }, // Team Number
                    { wch: 25 }, // Team Member
                    { wch: 15 }, // Dept
                    { wch: 10 }, // Yr of Study
                    { wch: 25 }, // Clg
                    { wch: 15 }, // Phone No
                    { wch: 25 }, // Email
                    { wch: 15 }, // Status
                    { wch: 15 }, // QR (Image) - Width doesn't affect row height, user might need to adjust row height
                ];
                ws['!cols'] = wscols;

                const safeSheetName = eventName.replace(/[\\/?*[\]]/g, "").substring(0, 31);
                XLSX.utils.book_append_sheet(wb, ws, safeSheetName || "Event");
            }
        });

        XLSX.writeFile(wb, `techbeta26_master_events_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="font-bold gap-2">
                                <Download className="h-4 w-4" /> Export Data <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DropdownMenuItem onClick={exportAllParticipantsCSV} className="cursor-pointer font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors">
                                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                                All Participants (CSV)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportMasterExcel} className="cursor-pointer font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors">
                                <Layers className="mr-2 h-4 w-4 text-green-500" />
                                Master Sheet (XLSX)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                                <h3 className="text-xl font-bold text-slate-900">{scannedParticipant?.name}</h3>
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
                                                        <span>{m.department} • {m.year || "Year N/A"}</span>
                                                        <span>{m.college}</span>
                                                    </div>
                                                    {/* Added display for member's events */}
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {(typeof m.events === 'string' ? [m.events] : (m.events || [])).map((e: string, idx: number) => {
                                                            const colors = [
                                                                "bg-blue-100 text-blue-700 border-blue-200",
                                                                "bg-purple-100 text-purple-700 border-purple-200",
                                                                "bg-pink-100 text-pink-700 border-pink-200",
                                                                "bg-orange-100 text-orange-700 border-orange-200",
                                                                "bg-teal-100 text-teal-700 border-teal-200",
                                                                "bg-indigo-100 text-indigo-700 border-indigo-200",
                                                            ];
                                                            // Deterministic color based on event name length + first char code
                                                            const colorIndex = (e.length + e.charCodeAt(0)) % colors.length;
                                                            return (
                                                                <span key={idx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${colors[colorIndex]}`}>
                                                                    {e}
                                                                </span>
                                                            );
                                                        })}
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

                {/* Participants Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Users className="text-primary" />
                            Registered Teams
                        </h2>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search participants..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-slate-50 border-slate-200 text-slate-900 focus:ring-primary"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b border-slate-100 hover:bg-transparent">
                                    <th className="text-slate-500 font-semibold px-6 py-4 whitespace-nowrap text-xs uppercase tracking-wider">Team ID</th>
                                    <th className="text-slate-500 font-semibold px-6 py-4 whitespace-nowrap text-xs uppercase tracking-wider">Members</th>
                                    <th className="text-slate-500 font-semibold px-6 py-4 whitespace-nowrap text-xs uppercase tracking-wider">College</th>
                                    <th className="text-slate-500 font-semibold px-6 py-4 whitespace-nowrap hidden md:table-cell text-xs uppercase tracking-wider">Events</th>
                                    <th className="text-slate-500 font-semibold px-6 py-4 whitespace-nowrap hidden md:table-cell text-xs uppercase tracking-wider">Payment</th>
                                    <th className="text-slate-500 font-semibold px-6 py-4 whitespace-nowrap text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-slate-500 font-semibold text-right px-6 py-4 whitespace-nowrap text-xs uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="h-24 text-center text-slate-500">
                                            No participants found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setScannedParticipant(reg)}>
                                            <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                                #{reg.id.slice(0, 6)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    {reg.name}
                                                    {reg.members && reg.members.length > 1 && (
                                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-black">
                                                            +{reg.members.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500">{reg.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-700 truncate max-w-[150px]" title={reg.college}>{reg.college}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{reg.department}</div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(reg.events) ? reg.events : [reg.events]).slice(0, 2).map((e: string, i: number) => (
                                                        <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{e}</span>
                                                    ))}
                                                    {(Array.isArray(reg.events) ? reg.events : [reg.events]).length > 2 && (
                                                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5">...</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="text-[10px] font-mono text-slate-500">{reg.transactionId || 'N/A'}</div>
                                                {reg.upiName && <div className="text-[9px] text-primary font-bold uppercase">{reg.upiName}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${reg.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {reg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" onClick={() => setScannedParticipant(reg)} className="h-8 w-8 hover:bg-slate-100 text-primary">
                                                    <ScanLine size={14} />
                                                </Button>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-500">
                                                            <QrCode size={14} />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-sm bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl rounded-2xl">
                                                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                                                            <DialogTitle className="text-center font-display text-slate-800">Team QR Codes</DialogTitle>
                                                        </div>
                                                        <div className="relative px-12 py-8 bg-white flex flex-col items-center">
                                                            <Carousel opts={{ loop: true }} className="w-full max-w-[280px]">
                                                                <CarouselContent>
                                                                    {(reg.members || [{ name: reg.name, events: reg.events }]).map((m, i) => (
                                                                        <CarouselItem key={i} className="pl-0 flex flex-col items-center justify-center">
                                                                            <div className="relative aspect-square w-48 h-48 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm mb-4 flex items-center justify-center overflow-hidden">
                                                                                {/* High quality QR generation */}
                                                                                <QRCodeImage
                                                                                    data={JSON.stringify({ id: reg.id, index: i, name: m.name, events: m.events })}
                                                                                />
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <p className="font-bold text-lg text-slate-800">{m.name}</p>
                                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                                                    Member {i + 1} of {(reg.members?.length || 1)}
                                                                                </div>
                                                                            </div>
                                                                        </CarouselItem>
                                                                    ))}
                                                                </CarouselContent>

                                                                {(reg.members?.length || 1) > 1 && (
                                                                    <>
                                                                        <CarouselPrevious className="absolute -left-10 top-[96px] -translate-y-1/2 h-10 w-10 bg-white text-slate-800 shadow-xl border border-slate-200 hover:bg-slate-50 flex opacity-100 z-30" />
                                                                        <CarouselNext className="absolute -right-10 top-[96px] -translate-y-1/2 h-10 w-10 bg-white text-slate-800 shadow-xl border border-slate-200 hover:bg-slate-50 flex opacity-100 z-30" />

                                                                        {/* Indicators */}
                                                                        <div className="flex justify-center gap-1.5 mt-4">
                                                                            {(reg.members || [1]).map((_, idx) => (
                                                                                <div key={idx} className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </Carousel>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                {reg.status !== "Verified" && (
                                                    <Button onClick={() => updateStatus(reg.id, "Verified")} variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/20 text-green-500">
                                                        <CheckCircle size={14} />
                                                    </Button>
                                                )}
                                                <Button onClick={() => handleDelete(reg.id)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/20 text-slate-500 hover:text-red-500">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div >
            </main >
        </div >
    );
};

const AdminDashboardWithBoundary = () => (
    <ErrorBoundary>
        <AdminDashboard />
    </ErrorBoundary>
);

export default AdminDashboardWithBoundary;
