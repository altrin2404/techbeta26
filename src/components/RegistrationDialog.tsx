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
import { Loader2, Rocket, CreditCard, ChevronRight, ArrowLeft, QrCode, CheckCircle, Plus, Trash2, Users, X, HelpCircle, Info } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import type { Registration } from "@/lib/registrationService";
import { addRegistration } from "@/lib/registrationService";

const memberSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone"),
    college: z.string().min(2, "College is required"),
    department: z.string().min(2, "Department is required"),
    year: z.string().min(1, "Year is required"),
    events: z.array(z.string()).min(1, "Select at least one event").max(2, "Maximum 2 events allowed"),
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
    "LogoHub"
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

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [savedPaymentId, setSavedPaymentId] = React.useState("");

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
    const totalAmount = (watchMembers?.length || 0) * 100;

    const nextStep = async () => {
        const isValid = await form.trigger("members");
        if (isValid) setStep(2);
    };

    const prevStep = () => setStep(1);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Submitting registration with values:", values);
        
        // Rate limiting: block submissions within 5 seconds for testing
        const lastSubmit = localStorage.getItem('lastRegistrationSubmit');
        const now = Date.now();
        if (lastSubmit && now - parseInt(lastSubmit) < 5000) {
            console.log("Rate limited");
            return;
        }

        setIsSubmitting(true);
        localStorage.setItem('lastRegistrationSubmit', now.toString());

        const loadingToast = toast.loading("Saving your registration details...");

        try {
            const leadMember = values.members[0];
            const allEvents = Array.from(new Set(values.members.flatMap(m => m.events)));

            // Cleanly map members to avoid any Hidden/Internal fields from React Hook Form or nested UI state
            const cleanedMembers = values.members.map(m => ({
                name: String(m.name).trim(),
                email: String(m.email).trim().toLowerCase(),
                phone: String(m.phone).trim(),
                college: String(m.college).trim(),
                department: String(m.department).trim(),
                year: String(m.year),
                events: [...m.events],
                // Include participation details if they exist in the raw member object
                participationType: (m as any).participationType || {},
                teamName: (m as any).teamName || {}
            }));

            const registrationData: Omit<Registration, 'id' | 'registrationDate' | 'status' | 'timestamp'> = {
                name: String(leadMember.name).trim(),
                email: String(leadMember.email).trim().toLowerCase(),
                phone: String(leadMember.phone).trim(),
                college: String(leadMember.college).trim(),
                department: String(leadMember.department).trim(),
                events: allEvents,
                transactionId: values.transactionId,
                upiName: values.upiName || 'Razorpay Online',
                members: cleanedMembers as any,
            };

            console.log("Prepared registration data for Firestore:", registrationData);

            const result = await addRegistration(registrationData);

            if (result.success) {
                console.log("Registration successful, ID:", result.id);
                toast.dismiss(loadingToast);
                toast.success("Registration confirmed!");

                // Fire confetti
                try {
                    const count = 80;
                    const defaults = { origin: { y: 0.7 } };
                    const colors = ['#0EA5E9', '#9333EA', '#22C55E', '#EAB308', '#EF4444'];
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
                } catch (confettiError) {
                    console.error("Confetti error (non-critical):", confettiError);
                }

                window.dispatchEvent(new Event("registration-updated"));
                setSavedPaymentId(values.transactionId);
                
                // Clear state and close
                form.reset();
                setStep(1);
                setIsSubmitting(false);
                setOpen(false);
                
                // Show success dialog
                setTimeout(() => {
                    setShowSuccess(true);
                }, 100);
            } else {
                console.error("Registration write failed:", result.error);
                throw new Error(result.error || "Failed to save to database");
            }
        } catch (error: any) {
            console.error("Submission error catch:", error);
            toast.dismiss(loadingToast);
            toast.error("Registration Failed", {
                description: error.message || "Please check your internet and try again.",
            });
            setIsSubmitting(false);
            localStorage.removeItem('lastRegistrationSubmit');
        }
    }

    const { isLoaded: isRazorpayLoaded, error: razorpayError } = useRazorpay();

    // Effect to handle Razorpay load error
    React.useEffect(() => {
        if (razorpayError) {
            toast.error("Failed to load payment gateway. Please check your internet connection.");
        }
    }, [razorpayError]);

    const displayRazorpay = async () => {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

        if (!razorpayKey) {
            console.error("Razorpay API Key is missing! Please check environment variables.");
            toast.error("Payment configuration error. Please try again later.");
            return;
        }

        if (!isRazorpayLoaded) {
            toast.error("Payment gateway is still loading. Please wait a moment...");
            return;
        }

        const amountToPay = fields.length * 100; // 100 paise = 1 INR per member

        const options = {
            key: razorpayKey,
            amount: amountToPay.toString(),
            currency: "INR",
            name: "TECHBETA 2026",
            description: `Registration Fee for ${fields.length} Member(s)`,
            image: `${window.location.origin}/brigitz-logo.png`,
            redirect: false,
            handler: function (response: any) {
                console.log("Razorpay payment successful:", response.razorpay_payment_id);
                
                const currentValues = form.getValues();
                const valuesWithPayment = {
                    ...currentValues,
                    transactionId: response.razorpay_payment_id,
                    upiName: 'Razorpay Online'
                };
                
                // Wait for the modal to start closing before submitting
                setTimeout(() => {
                    onSubmit(valuesWithPayment);
                }, 300);
            },
            modal: {
                ondismiss: function () {
                    // User closed the Razorpay modal without completing payment
                    console.log("Payment modal dismissed by user.");
                },
                confirm_close: true,
                escape: true,
            },
            prefill: {
                name: form.getValues('members.0.name'),
                email: form.getValues('members.0.email'),
                contact: form.getValues('members.0.phone')
            },
            notes: {
                address: "SXCCE Campus",
                teamSize: fields.length
            },
            theme: {
                color: "#0EA5E9"
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
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
                    <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 custom-scrollbar">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 sm:p-6">
                                {/* ... keep DialogHeader ... */}
                                <DialogHeader className="mb-4 space-y-2">
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 flex flex-wrap items-center justify-center gap-2">
                                        {step === 1 ? (
                                            <>
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Team Details</span>
                                                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Step 1/2</Badge>
                                            </>
                                        ) : (
                                            <>
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">Payment</span>
                                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-50">Step 2/2</Badge>
                                            </>
                                        )}
                                    </DialogTitle>
                                    <DialogDescription className="text-center font-bold text-slate-500 text-sm sm:text-base">
                                        {step === 1 ? "Step 1: Participant Details" : <>Step 2: Pay Registration Fee: <span className="text-emerald-500 font-bold">₹{totalAmount / 100}</span></>}
                                    </DialogDescription>
                                </DialogHeader>

                                <AnimatePresence mode="wait">
                                    {step === 1 ? (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-4 max-h-[45vh] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-base font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                                                <Users size={14} /> Member {index + 1}
                                                            </h4>
                                                            {index > 0 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => remove(index)}
                                                                    className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="grid gap-3">
                                                            <FormField
                                                                control={form.control}
                                                                name={`members.${index}.name`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input placeholder="Full Name" {...field} className="bg-white" />
                                                                        </FormControl>
                                                                        <FormMessage className="text-[10px]" />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`members.${index}.email`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input placeholder="Email" {...field} className="bg-white" />
                                                                            </FormControl>
                                                                            <FormMessage className="text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`members.${index}.phone`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input placeholder="Mobile" {...field} className="bg-white" />
                                                                            </FormControl>
                                                                            <FormMessage className="text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`members.${index}.department`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input placeholder="Department" {...field} className="bg-white" />
                                                                            </FormControl>
                                                                            <FormMessage className="text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`members.${index}.year`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <select
                                                                                    {...field}
                                                                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                                >
                                                                                    <option value="" disabled>Select Year</option>
                                                                                    <option value="1st Year">1st Year</option>
                                                                                    <option value="2nd Year">2nd Year</option>
                                                                                    <option value="3rd Year">3rd Year</option>
                                                                                    <option value="4th Year">4th Year</option>
                                                                                    <option value="PG">PG</option>
                                                                                </select>
                                                                            </FormControl>
                                                                            <FormMessage className="text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            <FormField
                                                                control={form.control}
                                                                name={`members.${index}.college`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input placeholder="College" {...field} className="bg-white" />
                                                                        </FormControl>
                                                                        <FormMessage className="text-[10px]" />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <div className="space-y-6 pt-4 border-t border-slate-100">
                                                                <div>
                                                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                                                                        <div className="mt-0.5 text-blue-500">
                                                                            <HelpCircle size={14} />
                                                                        </div>
                                                                        <p className="text-xs font-bold text-blue-700 leading-tight">
                                                                            Important: Each participant can register for a maximum of any 2 technical events.
                                                                        </p>
                                                                    </div>
                                                                    <FormLabel className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Technical Events</FormLabel>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        {technicalEvents.map((event) => {
                                                                            const isTeamEvent = ["FutureMinds", "Postercraft"].includes(event);
                                                                            const fieldName = `members.${index}.events` as const;
                                                                            const participationFieldName = `members.${index}.participationType.${event}` as const;

                                                                            return (
                                                                                <div key={event} className="space-y-2">
                                                                                    <FormField
                                                                                        control={form.control}
                                                                                        name={fieldName as any}
                                                                                        render={({ field }) => (
                                                                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors shadow-sm">
                                                                                                <FormControl>
                                                                                                    <Checkbox
                                                                                                        checked={(field.value as string[])?.includes(event)}
                                                                                                        onCheckedChange={(checked) => {
                                                                                                            const currentValue = (field.value as string[]) || [];
                                                                                                            if (checked && currentValue.length >= 2) {
                                                                                                                toast.error("Maximum 2 events allowed", {
                                                                                                                    description: "A participant can only register for up to 2 technical events."
                                                                                                                });
                                                                                                                alert("Attention: You can only register for a maximum of 2 events per participant.");
                                                                                                                return;
                                                                                                            }
                                                                                                            const newValue = checked
                                                                                                                ? [...currentValue, event]
                                                                                                                : currentValue.filter((value: string) => value !== event);
                                                                                                            
                                                                                                            field.onChange(newValue);
                                                                                                            
                                                                                                            // If unchecked and was a team event, clear participation type
                                                                                                            if (!checked && isTeamEvent) {
                                                                                                                form.setValue(participationFieldName as any, undefined);
                                                                                                            }
                                                                                                        }}
                                                                                                        className="h-5 w-5 border-primary"
                                                                                                    />
                                                                                                </FormControl>
                                                                                                <FormLabel className="text-sm font-bold cursor-pointer text-slate-700 leading-none">
                                                                                                    {event}
                                                                                                </FormLabel>
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                    {isTeamEvent && (form.watch(fieldName as any) || []).includes(event) && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, height: 0 }}
                                                                                            animate={{ opacity: 1, height: "auto" }}
                                                                                            className="pl-8 pb-2 space-y-3"
                                                                                        >
                                                                                            <FormField
                                                                                                control={form.control}
                                                                                                name={participationFieldName as any}
                                                                                                render={({ field }) => (
                                                                                                    <FormItem className="space-y-1">
                                                                                                        <FormLabel className="text-[10px] uppercase font-black text-slate-400">Participation Type</FormLabel>
                                                                                                        <FormControl>
                                                                                                            <div className="space-y-1.5">
                                                                                                                <select
                                                                                                                    {...field}
                                                                                                                    className="flex h-8 w-full rounded-md border border-input bg-white px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                                                                                >
                                                                                                                    <option value="" disabled>Select Type</option>
                                                                                                                    <option value="Individual">Individual</option>
                                                                                                                    <option value="Team">Team</option>
                                                                                                                </select>
                                                                                                              {field.value === "Team" && (
                                                                                     <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start animate-in fade-in slide-in-from-top-1 duration-300">
                                                                                         <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                                                                         <div className="text-sm font-bold text-blue-800 leading-tight">
                                                                                             <ul className="list-disc pl-4 space-y-1">
                                                                                                 <li>Teams are limited to exactly 2 members.</li>
                                                                                                 <li>Ensure both members enter the EXACT SAME team name.</li>
                                                                                             </ul>
                                                                                         </div>
                                                                                     </div>
                                                                                 )}
                                                                                                            </div>
                                                                                                        </FormControl>
                                                                                                    </FormItem>
                                                                                                )}
                                                                                            />
                                                                                            {form.watch(participationFieldName as any) === "Team" && (
                                                                                                <FormField
                                                                                                    control={form.control}
                                                                                                    name={`members.${index}.teamName.${event}` as any}
                                                                                                    render={({ field }) => (
                                                                                                        <FormItem className="space-y-1">
                                                                                                            <FormLabel className="text-[10px] uppercase font-black text-slate-400">Team Name</FormLabel>
                                                                                                            <FormControl>
                                                                                                                <Input 
                                                                                                                    {...field} 
                                                                                                                    placeholder="Enter Team Name" 
                                                                                                                    className="h-8 text-xs bg-white"
                                                                                                                    onChange={(e) => {
                                                                                                                        const newName = e.target.value;
                                                                                                                        const allMembers = form.getValues("members") || [];
                                                                                                                        const sameTeamCount = allMembers.filter((m: any, i: number) => 
                                                                                                                            i !== index && 
                                                                                                                            m.participationType?.[event] === "Team" && 
                                                                                                                            m.teamName?.[event]?.trim().toLowerCase() === newName.trim().toLowerCase() &&
                                                                                                                            newName.trim() !== ""
                                                                                                                        ).length;

                                                                                                                        if (sameTeamCount >= 1) {
                                                                                                                            // Already has 1 other member, so this would be the 2nd
                                                                                                                            // If it were >= 2, we should block. 
                                                                                                                            // But let's check correctly: total would be sameTeamCount + 1
                                                                                                                            const total = sameTeamCount + 1;
                                                                                                                            if (total > 2) {
                                                                                                                                toast.error("Team limit exceeded", {
                                                                                                                                    description: "A team can have a maximum of 2 members."
                                                                                                                                });
                                                                                                                                return; 
                                                                                                                            }
                                                                                                                        }
                                                                                                                        field.onChange(newName);
                                                                                                                    }}
                                                                                                                />
                                                                                                            </FormControl>
                                                                                                        </FormItem>
                                                                                                    )}
                                                                                                />
                                                                                            )}
                                                                                        </motion.div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>


                                                                <FormField
                                                                    name={`members.${index}.events` as any}
                                                                    render={() => <FormMessage className="text-xs" />}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {fields.length < 4 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => append({ name: "", email: "", phone: "", college: "", department: "", year: "", events: [] })}
                                                    className="w-full border-dashed border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/50 font-bold"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                                                </Button>
                                            )}

                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 min-h-[44px]"
                                            >
                                                Proceed to Payment <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* ... keep payment step ... */}
                                            <div className="text-center space-y-4 py-4">
                                                <div className="mx-auto w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-4 border border-primary/10">
                                                    <img src="/brigitz-logo.png" alt="Logo" className="h-16 w-auto object-contain" loading="lazy" decoding="async" />
                                                </div>
                                                <h3 className="text-2xl font-bold">
                                                    Total Fee: <span className="inline-block bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-1 rounded-lg text-3xl font-black shadow-lg shadow-slate-800/40">₹{totalAmount / 100}</span>
                                                </h3>
                                                <p className="text-base text-muted-foreground px-6">
                                                    For {fields.length} Team Member(s)
                                                    <br />
                                                    <span className="text-sm opacity-70">(₹1 per member)</span>
                                                </p>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={prevStep}
                                                    className="flex-1 h-11 font-bold"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={displayRazorpay}
                                                    disabled={isSubmitting || !isRazorpayLoaded}
                                                    className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (!isRazorpayLoaded ? "Loading Payment..." : "Pay Now")}
                                                </Button>
                                            </div>

                                            <div className="text-[10px] text-center text-muted-foreground mt-4">
                                                Secured by Razorpay • 100% Safe Payments
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="max-w-sm bg-white border-2 border-green-500 rounded-3xl p-0 overflow-hidden">
                    <div className="bg-green-500 p-6 flex flex-col items-center justify-center text-white">
                        <CheckCircle className="h-16 w-16 mb-2" />
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight text-center">Registration Successful!</DialogTitle>
                    </div>
                    <div className="p-6 text-center space-y-4">
                        <p className="text-xl font-black text-slate-800">
                            Welcome to <span className="font-black">TECHBETA 2026</span>
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
                            <p className="text-xs font-black uppercase text-orange-500 tracking-widest mb-1">Important</p>
                            <ol className="list-decimal list-inside space-y-2 text-base font-bold text-orange-900 leading-tight">
                                <li>You will receive a verification email on your registered email address. If not found, check your <span className="underline decoration-2 decoration-orange-500">SPAM / JUNK FOLDER</span>.</li>
                                <li>After our team verifies your registration, you will receive your <span className="underline decoration-2 decoration-orange-500">QR Code</span> via email.</li>
                            </ol>
                        </div>
                        <Button onClick={() => setShowSuccess(false)} className="w-full font-bold bg-green-500 text-white hover:bg-green-600">
                            Got it!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RegistrationDialog;
