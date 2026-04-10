import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, QrCode, Trash2, Users, X, HelpCircle, Info, ChevronRight, ArrowLeft, CheckCircle, Plus } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import type { Registration } from "@/lib/registrationService";
import { addRegistration, updateRegistrationAfterPayment } from "@/lib/registrationService";

const memberSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone"),
    college: z.string().min(2, "College is required"),
    department: z.string().min(2, "Department is required"),
    year: z.string().min(1, "Year is required"),
    events: z.array(z.string()).min(1, "Select at least one event").max(2, "Maximum 2 events allowed"),
    participationType: z.record(z.string()).optional(),
    teamName: z.record(z.string()).optional(),
});

const formSchema = z.object({
    transactionId: z.string().min(6, "Valid Transaction ID is required"),
    upiName: z.string().optional(),
    members: z.array(memberSchema).min(1).max(4),
});

const technicalEvents = [
    "FutureMinds",
    "Webfusion",
    "PromptStorm",
    "Postercraft",
    "LogoHub",
    "VIBE CODING"
];

interface RegistrationDialogProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const RegistrationDialog = ({ children, open: controlledOpen, onOpenChange: setControlledOpen }: RegistrationDialogProps) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

    const [registrationStatus, setRegistrationStatus] = React.useState<'form' | 'submitting' | 'success'>('form');
    const [step, setStep] = React.useState(1);
    const [savedPaymentId, setSavedPaymentId] = React.useState("");
    const [lastRegistrationId, setLastRegistrationId] = React.useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            transactionId: "",
            upiName: "",
            members: [{ name: "", email: "", phone: "", college: "", department: "", year: "", events: [] }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    });

    const watchMembers = form.watch("members");
    const totalAmount = (watchMembers?.length || 0) * 20000;

    const nextStep = async () => {
        const isValid = await form.trigger("members");
        if (isValid) setStep(2);
    };

    const prevStep = () => setStep(1);

    // Unified submission handler
    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("onSubmit called");
        try {
            const now = Date.now();
            const lastSubmit = localStorage.getItem('lastRegistrationSubmit');
            
            // Only debounce if it's NOT a final payment submission (transactionId will be present for confirmation)
            if (!values.transactionId && lastSubmit && now - parseInt(lastSubmit) < 5000) {
                console.log("Debounce blocked submission");
                return;
            }
            
            setRegistrationStatus('submitting');
            localStorage.setItem('lastRegistrationSubmit', now.toString());

            const leadMember = values.members[0];
            const allEvents = Array.from(new Set(values.members.flatMap(m => m.events)));

            // Explicitly clean team data to avoid Firestore rejection of undefined
            const cleanedMembers = values.members.map(m => {
                const member: any = {
                    name: m.name.trim(),
                    email: m.email.trim().toLowerCase(),
                    phone: m.phone.trim(),
                    college: m.college.trim(),
                    department: m.department.trim(),
                    year: m.year,
                    events: m.events,
                };

                // Only include if they have values to keep Firestore data clean
                if (m.participationType && Object.keys(m.participationType).length > 0) {
                    member.participationType = {};
                    Object.entries(m.participationType).forEach(([k, v]) => {
                        if (v) member.participationType[k] = v;
                    });
                    if (Object.keys(member.participationType).length === 0) delete member.participationType;
                }

                if (m.teamName && Object.keys(m.teamName).length > 0) {
                    member.teamName = {};
                    Object.entries(m.teamName).forEach(([k, v]) => {
                        if (v) member.teamName[k] = v.trim();
                    });
                    if (Object.keys(member.teamName).length === 0) delete member.teamName;
                }

                return member;
            });

            const registrationData: Omit<Registration, 'id' | 'registrationDate' | 'status' | 'timestamp'> = {
                name: leadMember.name.trim(),
                email: leadMember.email.trim().toLowerCase(),
                phone: leadMember.phone.trim(),
                college: leadMember.college.trim(),
                department: leadMember.department.trim(),
                events: allEvents,
                transactionId: values.transactionId,
                upiName: values.upiName || 'Razorpay Online',
                members: cleanedMembers as any,
            };

            // Save final registration to database (this will always work as a new 'create' call)
            const result = await addRegistration(registrationData, values.transactionId ? 'Pending Verification' : 'Payment Initiated');
            if (!result.success) {
                throw new Error(result.error?.message || "Registration failed");
            }

            // Success animation and cleanup
            const count = 80;
            const defaults = { origin: { y: 0.7 } };
            const colors = ['#0EA5E9', '#9333EA', '#22C55E', '#EAB308', '#EF4444'];
            
            try {
                const fire = (particleRatio: number, opts: any) => {
                    (window as any).confetti?.({
                        ...defaults,
                        ...opts,
                        particleCount: Math.floor(count * particleRatio),
                        colors: colors,
                        zIndex: 9999
                    });
                };
                fire(0.25, { spread: 26, startVelocity: 55 });
                fire(0.2, { spread: 60 });
                fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
                fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
                fire(0.1, { spread: 120, startVelocity: 45 });
            } catch (e) {}

            window.dispatchEvent(new Event("registration-updated"));
            setSavedPaymentId(values.transactionId);
            setRegistrationStatus('success');
            
            // Clean up form after a short delay so user doesn't see flicker
            setTimeout(() => {
                form.reset();
                setStep(1);
            }, 500);
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error("Registration Failed", {
                description: error.message || "Please try again or contact support.",
            });
            localStorage.removeItem('lastRegistrationSubmit');
            setRegistrationStatus('form');
        }
    }

    const { isLoaded: isRazorpayLoaded, error: razorpayError } = useRazorpay();

    React.useEffect(() => {
        if (razorpayError) {
            toast.error("Failed to load payment gateway.");
        }
    }, [razorpayError]);

    const displayRazorpay = async () => {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

        if (!razorpayKey) {
            toast.error("Payment configuration error.");
            return;
        }

        if (!isRazorpayLoaded) {
            toast.error("Payment gateway is still loading...");
            return;
        }

        setRegistrationStatus('submitting');
        
        try {
            const values = form.getValues();
            const leadMember = values.members[0];
            const allEvents = Array.from(new Set(values.members.flatMap(m => m.events)));

            // Clean team data
            const cleanedMembers = values.members.map(m => {
                const member: any = {
                    name: m.name.trim(),
                    email: m.email.trim().toLowerCase(),
                    phone: m.phone.trim(),
                    college: m.college.trim(),
                    department: m.department.trim(),
                    year: m.year,
                    events: m.events,
                };
                if (m.participationType && Object.keys(m.participationType).length > 0) {
                    member.participationType = {};
                    Object.entries(m.participationType).forEach(([k, v]) => { if (v) member.participationType[k] = v; });
                }
                if (m.teamName && Object.keys(m.teamName).length > 0) {
                    member.teamName = {};
                    Object.entries(m.teamName).forEach(([k, v]) => { if (v) member.teamName[k] = v.trim(); });
                }
                return member;
            });

            const amountToPay = fields.length * 20000;
            const registrationData: any = {
                name: leadMember.name.trim(),
                email: leadMember.email.trim().toLowerCase(),
                phone: leadMember.phone.trim(),
                college: leadMember.college.trim(),
                department: leadMember.department.trim(),
                events: allEvents,
                transactionId: "PAYMENT_INITIATED",
                upiName: "Razorpay Online",
                members: cleanedMembers as any,
                totalAmount: amountToPay,
            };

            // Pre-save registration to database with Initiated status
            const result = await addRegistration(registrationData, "Payment Initiated");
            
            if (!result.success) {
                throw new Error("Could not initialize registration.");
            }

            const docId = result.id;
            setLastRegistrationId(docId);

            // amountToPay already declared above

            const options = {
                key: razorpayKey,
                amount: amountToPay.toString(),
                currency: "INR",
                name: "TECHBETA 2026",
                description: `Registration Fee for ${fields.length} Member(s)`,
                image: `${window.location.origin}/brigitz-logo.png`,
                redirect: false,
                handler: async function (response: any) {
                    console.log("Razorpay handler triggered, payment ID:", response.razorpay_payment_id);
                    setRegistrationStatus('submitting');
                    
                    try {
                        // We use the full form values again to ensure we have everything
                        const values = form.getValues();
                        const leadMember = values.members[0];
                        const allEvents = Array.from(new Set(values.members.flatMap(m => m.events)));
                        
                        // Clean team data exactly like displayRazorpay did
                        const cleanedMembers = values.members.map(m => {
                            const member: any = {
                                name: m.name.trim(),
                                email: m.email.trim().toLowerCase(),
                                phone: m.phone.trim(),
                                college: m.college.trim(),
                                department: m.department.trim(),
                                year: m.year,
                                events: m.events,
                            };
                            if (m.participationType && Object.keys(m.participationType).length > 0) {
                                member.participationType = {};
                                Object.entries(m.participationType).forEach(([k, v]) => { if (v) member.participationType[k] = v; });
                            }
                            if (m.teamName && Object.keys(m.teamName).length > 0) {
                                member.teamName = {};
                                Object.entries(m.teamName).forEach(([k, v]) => { if (v) member.teamName[k] = v.trim(); });
                            }
                            return member;
                        });

                        const registrationData: any = {
                            name: leadMember.name.trim(),
                            email: leadMember.email.trim().toLowerCase(),
                            phone: leadMember.phone.trim(),
                            college: leadMember.college.trim(),
                            department: leadMember.department.trim(),
                            events: allEvents,
                            transactionId: response.razorpay_payment_id,
                            upiName: 'Razorpay Online',
                            members: cleanedMembers as any,
                            totalAmount: amountToPay,
                            // Link to the initial record to help admin reconciliation
                            initiatedDocId: docId 
                        };

                        console.log("Saving full success record to Firestore...");
                        // Use addRegistration (which uses addDoc) because students 
                        // likely lack update permissions for public security reasons.
                        const result = await addRegistration(registrationData, 'Pending Verification');
                        
                        if (result.success) {
                            console.log("Success record saved successfully!");
                            setSavedPaymentId(response.razorpay_payment_id);
                            window.dispatchEvent(new Event("registration-updated"));
                            setRegistrationStatus('success');
                            
                            // Delayed cleanup
                            setTimeout(() => {
                                form.reset();
                                setStep(1);
                            }, 500);
                        } else {
                            throw new Error(result.error?.toString() || "Firestore save failed");
                        }
                    } catch (err: any) {
                        console.error("FATAL ERROR in handler:", err);
                        toast.error("Registration Save Error", {
                            description: "Payment was successful, but we failed to save your details. ID: " + response.razorpay_payment_id
                        });
                        setRegistrationStatus('form');
                    }
                },
                modal: {
                    ondismiss: () => {
                        console.log("Razorpay modal dismissed");
                        setRegistrationStatus('form');
                    },
                    confirm_close: true,
                    escape: true,
                },
                prefill: {
                    name: leadMember.name,
                    email: leadMember.email,
                    contact: leadMember.phone
                },
                theme: {
                    color: "#0EA5E9"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function () {
                setRegistrationStatus('form');
            });
            paymentObject.open();
        } catch (error: any) {
            console.error("Payment initiation error:", error);
            toast.error(error.message || "Failed to start payment.");
            setRegistrationStatus('form');
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(val) => {
                setOpen(val);
                if (!val) setStep(1);
            }}>
                <DialogTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] w-[95vw] sm:w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden p-0 gap-0 rounded-2xl sm:rounded-3xl border-none shadow-2xl bg-[#0f172a] text-white flex flex-col">
                    <div className="bg-slate-900 border-b border-white/5 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <QrCode size={16} />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold tracking-wide uppercase text-white">Event Registration</DialogTitle>
                                <DialogDescription className="text-xs text-slate-400 font-medium">Join TECHBETA 2026</DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-1">
                                <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-slate-800'}`} />
                                <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-slate-800'}`} />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 bg-white text-slate-900">
                        <div className="bg-orange-50 p-6 rounded-full border border-orange-100">
                            <Info className="h-12 w-12 text-orange-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">Event Successfully Completed</h3>
                            <p className="text-slate-500 font-bold text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
                                TECHBETA 2026 has officially concluded. Thank you to everyone who participated and made it a grand success!
                            </p>
                        </div>
                        <Button 
                            onClick={() => setOpen(false)} 
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-10 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            Back to Home
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RegistrationDialog;
