import { ScanLine, QrCode, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type Registration } from "@/lib/registrationService";

interface AdminAttendanceModeProps {
    activeEvent: string;
    setActiveEvent: (event: string) => void;
    registrations: Registration[];
    setIsScannerOpen: (isOpen: boolean) => void;
    exportMasterExcel: () => void;
    setAdminMode: (mode: 'none' | 'dashboard' | 'attendance') => void;
    recentScans: { name: string, event: string, status: 'success' | 'error', time: string, message: string }[];
}

const AdminAttendanceMode = ({
    activeEvent,
    setActiveEvent,
    registrations,
    setIsScannerOpen,
    exportMasterExcel,
    setAdminMode,
    recentScans
}: AdminAttendanceModeProps) => {

    // Extract unique events for the dropdown
    const availableEvents = Array.from(new Set(registrations.flatMap(reg =>
        reg.members
            ? reg.members.flatMap(m => m.events)
            : reg.events
    ))).sort();

    const presentCount = registrations.reduce((acc, reg) =>
        acc + (reg.members?.filter(m => m.attendance?.[activeEvent]?.attended).length || 0), 0
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl border p-8 shadow-sm flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-6">
                    <ScanLine className="h-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Event Attendance</h2>
                <p className="text-slate-500 max-w-md mb-8">Select your venue's event and scan participants as they arrive.</p>

                <div className="w-full max-w-md space-y-4">
                    <div className="text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Active Event / Venue</label>
                        <select
                            value={activeEvent}
                            onChange={(e) => setActiveEvent(e.target.value)}
                            className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select Event...</option>
                            {availableEvents.map(event => (
                                <option key={event} value={event}>{event}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={() => {
                            if (!activeEvent) {
                                toast.error("Please select an event first!");
                                return;
                            }
                            setIsScannerOpen(true);
                        }}
                        disabled={!activeEvent}
                        className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-purple-100 flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                        <QrCode className="h-6 w-6" />
                        Open Scanner
                    </Button>

                    <Button
                        onClick={exportMasterExcel}
                        variant="outline"
                        className="w-full h-12 border-2 border-green-100 text-green-600 hover:bg-green-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Download className="h-4 w-4" />
                        Export Attendance Report
                    </Button>

                    <div className="pt-4 flex flex-col gap-2">
                        <Button variant="ghost" onClick={() => setAdminMode('dashboard')} className="text-slate-400 font-bold">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Switch to Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            {activeEvent && (
                <div className="bg-white rounded-3xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            Live Attendance: {activeEvent}
                        </h3>
                        <div className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">
                            {presentCount} Present
                        </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {recentScans.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm">
                                Scanned participants will appear here.
                            </div>
                        ) : (
                            recentScans.map((scan, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border animate-in fade-in slide-in-from-right-4 duration-300 ${scan.status === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-sm">{scan.name}</span>
                                        <span className={`text-[10px] font-black uppercase ${scan.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {scan.message}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{scan.time}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAttendanceMode;
