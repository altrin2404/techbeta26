import { useState, useEffect, Suspense, lazy } from "react";
import {
    LogOut, ShieldCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
    subscribeToRegistrations,
    updateRegistrationStatus,
    deleteRegistration,
    type Registration
} from "@/lib/registrationService";
import { sendVerificationEmail } from "@/lib/emailService";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import ErrorBoundary from "@/components/ErrorBoundary";
import QRScannerDialog from "@/components/QRScannerDialog";

// Lazy Loaded Components for Performance
const AdminLogin = lazy(() => import("@/components/admin/AdminLogin"));
const AdminMainDashboard = lazy(() => import("@/components/admin/AdminMainDashboard"));
const AdminAttendanceMode = lazy(() => import("@/components/admin/AdminAttendanceMode"));

const ADMIN_EMAIL_DOMAIN = "techbeta2k26.firebaseapp.com";

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [adminMode, setAdminMode] = useState<'none' | 'dashboard' | 'attendance'>('none');
    const [activeEvent, setActiveEvent] = useState<string>("");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [recentScans, setRecentScans] = useState<{ name: string, event: string, status: 'success' | 'error', time: string, message: string }[]>([]);
    const [scannedParticipant, setScannedParticipant] = useState<Registration | null>(null);
    const [scannedMemberIndex, setScannedMemberIndex] = useState<number>(-1);

    useEffect(() => {
        let unsubscribeFirestore: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setIsAuthLoading(false);

            if (user) {
                unsubscribeFirestore = subscribeToRegistrations((data) => {
                    setRegistrations(data);
                    setIsLoading(false);
                });
            } else {
                if (unsubscribeFirestore) {
                    unsubscribeFirestore();
                    unsubscribeFirestore = null;
                }
                setRegistrations([]);
                setIsLoading(true);
                setAdminMode('none');
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeFirestore) unsubscribeFirestore();
        };
    }, []);

    const handleLogin = async (username: string, password: string, mode: 'dashboard' | 'attendance') => {
        setIsLoginLoading(true);
        try {
            const email = `${username}@${ADMIN_EMAIL_DOMAIN}`;
            await signInWithEmailAndPassword(auth, email, password);
            setAdminMode(mode);
            toast.success(`Login Successful: ${mode === 'dashboard' ? 'Dashboard' : 'Attendance'}`);
        } catch (error: any) {
            console.error("Login error:", error);
            const code = error?.code || "unknown";
            toast.error(`Login failed: ${code}`);
        } finally {
            setIsLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setAdminMode('none');
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const result = await updateRegistrationStatus(id, newStatus);
        if (result.success) {
            toast.success(`Status updated to ${newStatus}`);
            if (newStatus === "Verified") {
                const participant = registrations.find(r => r.id === id);
                if (participant) {
                    toast.loading("Sending verification emails...");
                    const membersToNotify = participant.members || [{
                        name: participant.name, email: participant.email, events: participant.events
                    }];
                    let successCount = 0;
                    for (let i = 0; i < membersToNotify.length; i++) {
                        const m = membersToNotify[i];
                        const qrData = JSON.stringify({ id: participant.id, index: i, name: m.name, events: m.events });
                        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
                        const emailResult = await sendVerificationEmail(m.name, m.email, participant.transactionId, qrCodeUrl);
                        if (emailResult.success) successCount++;
                        await new Promise(r => setTimeout(r, 500));
                    }
                    toast.dismiss();
                    toast.success(`Sent ${successCount}/${membersToNotify.length} emails.`);
                }
            }
        } else {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this registration?")) return;
        const result = await deleteRegistration(id);
        if (result.success) toast.success("Deleted successfully");
        else toast.error("Failed to delete");
    };

    const exportAllParticipantsCSV = () => {
        const headers = ["Name", "Dept", "Year", "College", "Phone", "Email", "Events", "Status"];
        const csvRows: string[][] = [];
        registrations.forEach(reg => {
            const members = reg.members || [{
                name: reg.name, department: reg.department, year: (reg as any).year, college: reg.college, phone: reg.phone, email: reg.email, events: reg.events
            }];
            members.forEach((m: any) => {
                csvRows.push([
                    m.name, m.department, m.year || "N/A", m.college, m.phone, m.email,
                    Array.isArray(m.events) ? m.events.join("; ") : (m.events || ""), reg.status
                ]);
            });
        });
        const csvContent = [headers.join(","), ...csvRows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `techbeta_registrations.csv`;
        a.click();
    };

    const exportMasterExcel = () => {
        const wb = XLSX.utils.book_new();
        const allEvents = Array.from(new Set(registrations.flatMap(reg =>
            reg.members ? reg.members.flatMap(m => m.events) : reg.events
        ))).sort();

        allEvents.forEach(eventName => {
            const eventRows: any[] = [];
            let teamCounter = 1;
            registrations.forEach(reg => {
                const members = reg.members || [{
                    name: reg.name, email: reg.email, phone: reg.phone, college: reg.college, department: reg.department, events: reg.events, attendance: (reg as any).attendance
                }];
                const participating = members.filter((m: any) => (Array.isArray(m.events) ? m.events : [m.events]).includes(eventName));
                if (participating.length > 0) {
                    participating.forEach((m: any) => {
                        const attendanceInfo = m.attendance?.[eventName];
                        eventRows.push({
                            "Team": teamCounter, "Name": m.name, "Dept": m.department, "College": m.college,
                            "Phone": m.phone, "Email": m.email,
                            "Attendance": attendanceInfo?.attended ? `Present (${new Date(attendanceInfo.timestamp).toLocaleTimeString()})` : "Absent"
                        });
                    });
                    teamCounter++;
                }
            });
            if (eventRows.length > 0) {
                const ws = XLSX.utils.json_to_sheet(eventRows);
                XLSX.utils.book_append_sheet(wb, ws, eventName.substring(0, 31).replace(/[\\/?*[\]]/g, ""));
            }
        });
        XLSX.writeFile(wb, `techbeta_attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleScan = async (decodedText: string) => {
        try {
            const data = JSON.parse(decodedText);
            if (!data.id) throw new Error("Invalid QR format");
            const participant = registrations.find(r => r.id === data.id);
            if (!participant) throw new Error("Participant not found");

            setScannedParticipant(participant);
            if (data.index !== undefined) setScannedMemberIndex(data.index);

            if (participant.status !== "Verified") {
                toast.error("Payment not verified!");
                return;
            }

            if (adminMode === 'attendance' && activeEvent && data.index !== undefined) {
                const member = participant.members ? participant.members[data.index] : participant.members?.[0];
                if (member) {
                    const memberEvents = Array.isArray(member.events) ? member.events : [member.events];
                    if (memberEvents.includes(activeEvent)) {
                        const updatedMembers = [...(participant.members || [])];
                        if (!updatedMembers[data.index].attendance?.[activeEvent]?.attended) {
                            updatedMembers[data.index] = {
                                ...updatedMembers[data.index],
                                attendance: { ...updatedMembers[data.index].attendance, [activeEvent]: { attended: true, timestamp: new Date().toISOString() } }
                            };
                            const { updateRegistrationMembers } = await import("@/lib/registrationService");
                            await updateRegistrationMembers(participant.id, updatedMembers);
                            toast.success(`Attendance marked: ${member.name}`);
                            setRecentScans(prev => [{ name: member.name, event: activeEvent, status: 'success', time: new Date().toLocaleTimeString(), message: 'Present' }, ...prev].slice(0, 5));
                        } else {
                            toast.info("Already marked present");
                        }
                    } else {
                        toast.error("Not registered for this event");
                        setRecentScans(prev => [{ name: member.name, event: activeEvent, status: 'error', time: new Date().toLocaleTimeString(), message: 'Not Registered' }, ...prev].slice(0, 5));
                    }
                }
            }
        } catch (e: any) {
            toast.error(e.message || "Scan failed");
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>}>
                <AdminLogin onLogin={handleLogin} isLoading={isLoginLoading} />
            </Suspense>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-600 p-1.5 rounded-lg shadow-lg shadow-purple-100 italic">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-slate-800">ADMIN <span className="text-purple-600">CONSOLE</span></span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 font-bold"><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
            </nav>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-purple-600" /></div>}>
                    {adminMode === 'attendance' ? (
                        <AdminAttendanceMode
                            activeEvent={activeEvent}
                            setActiveEvent={setActiveEvent}
                            registrations={registrations}
                            setIsScannerOpen={setIsScannerOpen}
                            exportMasterExcel={exportMasterExcel}
                            setAdminMode={setAdminMode}
                            recentScans={recentScans}
                            handleScan={handleScan}
                            scannedParticipant={scannedParticipant}
                            setScannedParticipant={setScannedParticipant}
                            scannedMemberIndex={scannedMemberIndex}
                            setScannedMemberIndex={setScannedMemberIndex}
                        />
                    ) : (
                        <AdminMainDashboard
                            registrations={registrations}
                            filteredRegistrations={filteredRegistrations}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            isScannerOpen={isScannerOpen}
                            setIsScannerOpen={setIsScannerOpen}
                            exportAllParticipantsCSV={exportAllParticipantsCSV}
                            exportMasterExcel={exportMasterExcel}
                            handleScan={handleScan}
                            updateStatus={updateStatus}
                            handleDelete={handleDelete}
                            scannedParticipant={scannedParticipant}
                            setScannedParticipant={setScannedParticipant}
                            scannedMemberIndex={scannedMemberIndex}
                            setScannedMemberIndex={setScannedMemberIndex}
                        />
                    )}
                </Suspense>

                <QRScannerDialog
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScan={handleScan}
                />
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
