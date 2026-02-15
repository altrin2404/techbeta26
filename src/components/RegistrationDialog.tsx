import React from "react";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { Loader2, Rocket, CreditCard, ChevronRight, ArrowLeft, QrCode, CheckCircle, RefreshCcw } from "lucide-react";
import { subscribeToRegistration, addRegistration, type Registration, updateRegistrationStatus } from "@/lib/registrationService";


const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    college: z.string().min(2, "College name is required"),
    department: z.string().min(2, "Department is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
    events: z.array(z.string()).min(1, "Select at least one event"),
    transactionId: z.string().min(6, "Valid Transaction ID is required"),
    upiName: z.string().optional(),
});

const eventOptions = [
    "Ideathon",
    "Web/Logo Designing",
    "Debugging",
    "Tech Quiz"
];

// Fallback QR if public/qr.png is missing (this is a placeholder, user should ensure public/qr.png exists)
const FALLBACK_QR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=9385675451-3@ybl&pn=TECHBETA2K26&am=1&cu=INR')}`;

interface RegistrationDialogProps {
    children: React.ReactNode;
}

const RegistrationDialog = ({ children }: RegistrationDialogProps) => {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [registrationId, setRegistrationId] = React.useState<string | null>(null);
    const [qrStatus, setQrStatus] = React.useState<'pending' | 'verified'>('pending');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            college: "",
            department: "",
            email: "",
            phone: "",
            events: [],
            transactionId: "",
            upiName: "",
        },
    });

    const nextStep = async () => {
        const fieldsToValidate = ["name", "email", "phone", "department", "college", "events"] as const;
        const isValid = await form.trigger(fieldsToValidate);

        if (isValid) {
            setIsSubmitting(true);
            const values = form.getValues();

            // Create pending registration immediately
            try {
                const result = await addRegistration({
                    ...values,
                    transactionId: "PENDING_PAYMENT", // Placeholder
                    upiName: "",
                } as any);

                if (result.success && result.id) {
                    setRegistrationId(result.id);
                    setStep(2);
                } else {
                    toast.error("Failed to initialize registration. Please try again.");
                }
            } catch (error) {
                console.error("Init registration error:", error);
                toast.error("An error experienced. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Listen for status changes
    React.useEffect(() => {
        if (!registrationId || step !== 2) return;

        const unsubscribe = subscribeToRegistration(registrationId, (data) => {
            if (data && data.status === 'Verified') {
                handleSuccess(data);
            }
        });

        return () => unsubscribe();
    }, [registrationId, step]);

    const handleSuccess = (data: Registration) => {
        setQrStatus('verified');
        fireConfetti();
        setShowSuccess(true);
        setOpen(false);
        setStep(1);
        setRegistrationId(null);
        form.reset();
    };

    const handleSimulatePayment = async () => {
        if (registrationId) {
            const toastId = toast.loading("Simulating payment verification...");
            try {
                const result = await updateRegistrationStatus(registrationId, 'Verified');
                if (result.success) {
                    toast.success("Payment Verified! Completing registration...", { id: toastId });
                    // Listener will catch the update and close dialog
                } else {
                    toast.error("Failed to verify payment. Please try again.", { id: toastId });
                    console.error("Simulation failed:", result.error);
                }
            } catch (error) {
                toast.error("An error occurred.", { id: toastId });
                console.error("Simulation error:", error);
            }
        }
    };

    const prevStep = () => setStep(1);

    // Confetti logic moved outside onSubmit for reuse
    const fireConfetti = () => {
        const count = 150;
        const defaults = {
            origin: { y: 0.7 }
        };

        const colors = ['#0EA5E9', '#9333EA', '#22C55E', '#EAB308', '#EF4444'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'fixed pointer-events-none z-[100]';
            const size = Math.random() * 8 + 4;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.left = '50%';
            confetti.style.top = '70%';
            document.body.appendChild(confetti);

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 15 + 10;
            const vx = Math.cos(angle) * velocity;
            let vy = Math.sin(angle) * velocity - 10;
            let x = 0;
            let y = 0;

            const animate = () => {
                x += vx;
                y += vy;
                vy += 0.5; // gravity
                confetti.style.transform = `translate(${x}px, ${y}px)`;
                confetti.style.opacity = (1 - (Math.abs(y) / 1000)).toString();

                if (y < 800) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };
            requestAnimationFrame(animate);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // This is now purely for the "Simulate" or legacy manual flow if we kept it?
        // Actually, with Zero-Click, the user doesn't "submit" the form at step 2.
        // The system "submits" itself upon verification.
        // We can keep this empty or remove the form submit handler from step 2 button.
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(val) => {
                setOpen(val);
                if (!val) setStep(1);
            }}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-w-lg glass-card border-black/5 p-0 bg-background/95 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                    <div className="p-6 pt-8">
                        <DialogHeader className="mb-6">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                {step === 1 ? <Rocket className="h-8 w-8 text-primary" /> : <CreditCard className="h-8 w-8 text-primary" />}
                            </div>
                            <DialogTitle className="font-display text-2xl font-bold text-center text-foreground">
                                {step === 1 ? (
                                    <>Register for <span className="text-primary">TECHBETA 2K26</span></>
                                ) : (
                                    <>Complete <span className="text-primary">Payment</span></>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-center font-medium text-muted-foreground">
                                {step === 1 ? "Step 1: Participant Details" : "Step 2: Scan QR & Pay (Registration: ₹1)"}
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            {/* We don't use onSubmit for the whole form anymore, handled in buttons */}
                            <div className="space-y-4">
                                <AnimatePresence mode="wait">
                                    {step === 1 ? (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Full Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="xyz" {...field} className="bg-background/50 border-black/5" />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Email Address</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="john@example.com" {...field} className="bg-background/50 border-black/5" />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Mobile Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="10-digit number" {...field} className="bg-background/50 border-black/5" />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="department"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Department</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. IT, CSE" {...field} className="bg-background/50 border-black/5" />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="college"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase tracking-widest">College Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter your college" {...field} className="bg-background/50 border-black/5" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-3 pt-2">
                                                <FormLabel className="text-xs font-bold uppercase tracking-widest">Select Events</FormLabel>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {eventOptions.map((event) => (
                                                        <FormField
                                                            key={event}
                                                            control={form.control}
                                                            name="events"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-black/5 bg-background/30 p-3 hover:bg-black/5 transition-colors">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(event)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, event])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== event
                                                                                        )
                                                                                    )
                                                                            }}
                                                                            className="border-primary"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="text-xs font-bold cursor-pointer">
                                                                        {event}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage className="text-[10px]" />
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={isSubmitting}
                                                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
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
                                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 text-center">Zero-Click Registration</h4>
                                                <div className="space-y-2">
                                                    {[
                                                        "Scan the QR code below",
                                                        "Pay ₹1.00",
                                                        "Wait for automatic confirmation...",
                                                    ].map((step, i) => (
                                                        <div key={i} className="flex gap-3 items-start">
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                                                {i + 1}
                                                            </span>
                                                            <p className="text-xs font-medium text-foreground/80 leading-5">{step}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-black/5 shadow-inner">
                                                <div className="h-48 w-48 bg-white rounded-lg flex items-center justify-center p-2 border border-black/5 shadow-sm overflow-hidden relative">
                                                    <img
                                                        src="/qr.png"
                                                        onError={(e) => {
                                                            e.currentTarget.src = FALLBACK_QR;
                                                        }}
                                                        alt="Payment QR Code"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                    {/* Blur overlay if waiting for payment could be cool, but clear QR is better */}
                                                </div>
                                                <div className="mt-4 text-center">
                                                    <p className="text-lg font-black text-slate-800">₹ 1.00</p>
                                                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium animate-pulse">
                                                        <RefreshCcw className="h-3 w-3 animate-spin" />
                                                        Waiting for payment...
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={handleSimulatePayment}
                                                    variant="secondary"
                                                    className="w-full font-bold text-xs"
                                                >
                                                    ⚡ Simulate Payment Detect (Dev Only)
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={prevStep}
                                                    className="w-full font-bold"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Popup */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border-2 border-green-500 rounded-3xl p-0 overflow-hidden">
                    <div className="bg-green-500 p-6 flex flex-col items-center justify-center text-white">
                        <CheckCircle className="h-16 w-16 mb-2" />
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Registration Successful!</DialogTitle>
                    </div>
                    <div className="p-6 text-center space-y-4">
                        <p className="font-medium text-slate-600 dark:text-slate-300">
                            Welcome to <span className="font-bold text-primary">TECHBETA 2K26</span>
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
                            <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-1">Important</p>
                            <p className="text-sm font-bold text-orange-900 leading-tight">
                                Registration Completed! You will receive a verification email on your registered email address. If not found, please check your <span className="underline decoration-2 decoration-orange-500">SPAM / JUNK FOLDER</span>.
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your registration has been submitted and is pending payment verification.
                        </p>
                        <Button onClick={() => setShowSuccess(false)} className="w-full font-bold bg-slate-900 text-white hover:bg-slate-800">
                            Got it!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RegistrationDialog;
