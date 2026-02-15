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
    ScanLine
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
import QRScannerDialog from "@/components/QRScannerDialog";

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        const authStatus = sessionStorage.getItem("adminAuth");
        if (authStatus === "true") {
            setIsAuthenticated(true);
        }

        // Subscribe to Firebase real-time updates
        const unsubscribe = subscribeToRegistrations((data) => {
            setRegistrations(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === "admin" && password === "techbeta26@admin") {
            setIsAuthenticated(true);
            sessionStorage.setItem("adminAuth", "true");
            toast.success("Login Successful");
        } else {
            toast.error("Invalid Credentials");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem("adminAuth");
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
                toast.loading("Sending verification email...");

                const participant = registrations.find(r => r.id === id);
                if (participant) {
                    // Generate QR Code URL
                    const qrData = JSON.stringify({ id: participant.id, name: participant.name, events: participant.events });
                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

                    const emailResult = await sendVerificationEmail(
                        participant.name,
                        participant.email,
                        participant.transactionId,
                        qrCodeUrl
                    );

                    if (emailResult.success) {
                        toast.success("Verification email sent!");
                    } else {
                        toast.error(`Failed to send email: ${JSON.stringify(emailResult.error)}`);
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
        const headers = ["ID", "Name", "College", "Email", "Phone", "Events", "Transaction ID", "UPI Name", "Status", "Date"];
        const csvRows = registrations.map(reg => [
            reg.id, reg.name, reg.college, reg.email, reg.phone,
            reg.events.join(";"), reg.transactionId, reg.upiName || "N/A", reg.status,
            new Date(reg.registrationDate).toLocaleDateString()
        ]);
        const csvContent = [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "techbeta26_registrations.csv";
        a.click();
    };

    const handleScan = (decodedText: string) => {
        try {
            const data = JSON.parse(decodedText);
            if (data.id) {
                const participant = registrations.find(r => r.id === data.id);
                if (participant) {
                    setSearchQuery(data.id); // Filter via search
                    toast.success("Participant Found!", {
                        description: `${participant.name} - ${participant.college}`
                    });
                    // Highlight or scroll to participant could go here
                } else {
                    toast.error("Participant not found in database.");
                }
            } else {
                toast.error("Invalid QR Code format.");
            }
        } catch (e) {
            toast.error("Failed to read QR Code.");
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <Button type="submit" className="w-full h-11 bg-purple-600">Launch</Button>
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
                        <div><p className="text-xs font-bold text-slate-500 uppercase">Total</p><p className="text-2xl font-black">{registrations.length}</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border flex items-center gap-4">
                        <Layers className="text-purple-500 h-8 w-8" />
                        <div><p className="text-xs font-bold text-slate-500 uppercase">Revenue</p><p className="text-2xl font-black">₹ {registrations.filter(r => r.status === "Verified").length * 1}</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border flex items-center gap-4">
                        <Clock className="text-orange-500 h-8 w-8" />
                        <div><p className="text-xs font-bold text-slate-500 uppercase">Pending</p><p className="text-2xl font-black">{registrations.filter(r => r.status === "Pending Verification").length}</p></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search participants or TxIDs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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

                <div className="bg-white rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr className="text-[10px] font-black uppercase text-slate-500">
                                    <th className="px-6 py-4">Participant</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Events</th>
                                    <th className="px-6 py-4">Payment Proof</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{reg.name}</div>
                                            <div className="text-[10px] font-bold text-primary uppercase">{reg.college}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-foreground">{reg.phone}</div>
                                            <div className="text-[10px] text-muted-foreground">{reg.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {reg.events.map((e, i) => (
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
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-primary h-8 w-8 hover:bg-primary/5">
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

export default AdminDashboard;
