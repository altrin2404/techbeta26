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
import { Loader2, Rocket, CreditCard, ChevronRight, ArrowLeft, QrCode, CheckCircle } from "lucide-react";
import type { Registration } from "@/lib/registrationService";


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

interface RegistrationDialogProps {
    children: React.ReactNode;
}

const RegistrationDialog = ({ children }: RegistrationDialogProps) => {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [step, setStep] = React.useState(1);

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
        if (isValid) setStep(2);
    };

    const prevStep = () => setStep(1);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        const submitToGoogleForms = async (data: z.infer<typeof formSchema>) => {
            const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";
            const formBody = new URLSearchParams();
            formBody.append("entry.replace_with_name_id", data.name);
            formBody.append("entry.replace_with_email_id", data.email);
            formBody.append("entry.replace_with_phone_id", data.phone);
            formBody.append("entry.replace_with_dept_id", data.department);
            formBody.append("entry.replace_with_college_id", data.college);
            formBody.append("entry.replace_with_events_id", data.events.join(", "));
            formBody.append("entry.replace_with_transaction_id", data.transactionId);
            formBody.append("entry.replace_with_upi_name", data.upiName || "");

            try {
                await fetch(GOOGLE_FORM_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formBody,
                });
            } catch (error) {
                console.error("Google Forms submission error:", error);
            }
        };

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

        setTimeout(async () => {
            await submitToGoogleForms(values);

            // Save to Firebase instead of localStorage
            const { addRegistration } = await import("@/lib/registrationService");
            const result = await addRegistration(values as Omit<Registration, 'id' | 'registrationDate' | 'status'>);

            if (result.success) {
                window.dispatchEvent(new Event("registration-updated"));

                setIsSubmitting(false);
                setOpen(false);
                setStep(1);
                form.reset();

                fireConfetti();

                setShowSuccess(true);
                // Keeping toast for feedback but primary is now popup
                // toast.success("Registration Submitted!", {
                //     description: "Payment verification is in progress. NOTE: Check your SPAM folder for the verification email.",
                //     duration: 6000,
                // });
            } else {
                toast.error("Registration Failed", {
                    description: "Please try again or contact support.",
                });
                setIsSubmitting(false);
            }
        }, 1500);
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
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11"
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
                                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 text-center">Secure Payment</h4>
                                                <div className="space-y-2">
                                                    {[
                                                        "Click 'Pay Now' below",
                                                        "Complete payment on PhonePe Secure Page",
                                                        "Wait for automatic redirection",
                                                        "Registration verified instantly!"
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

                                            <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-black/5 shadow-inner">
                                                <div className="text-center mb-6">
                                                    <p className="text-3xl font-black text-slate-800">₹ 1.00</p>
                                                    <p className="text-xs text-slate-500 font-medium italic">Registration Fee</p>
                                                </div>

                                                <Button
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onClick={async () => {
                                                        const data = form.getValues();
                                                        // Generate a temporary transaction ID for tracking
                                                        // In production, backend should generate this or we use a robust ID
                                                        const txnId = "TXN" + Date.now();

                                                        // Save ID to verify later
                                                        localStorage.setItem('pendingRegistrationId', txnId); // Ideally this is the doc ID but we don't have it yet. 
                                                        // Actually we should create a 'Pending' registration in Firebase FIRST
                                                        // Then pass that ID.

                                                        // Let's create the registration first as Pending
                                                        setIsSubmitting(true);
                                                        try {
                                                            const { addRegistration } = await import("@/lib/registrationService");
                                                            const regData = {
                                                                ...data,
                                                                transactionId: txnId, // Use this for payment tracking
                                                                status: 'Pending Verification' as const // Typescript fix
                                                            };
                                                            // @ts-ignore
                                                            const result = await addRegistration(regData); // Ignoring type mismatch for now

                                                            if (result.success) {
                                                                localStorage.setItem('pendingRegistrationId', result.id); // Save Firestore ID

                                                                const { initiatePayment } = await import("@/lib/paymentService");
                                                                const paymentRes = await initiatePayment({
                                                                    name: data.name,
                                                                    amount: 1,
                                                                    number: data.phone,
                                                                    transactionId: txnId
                                                                });

                                                                if (paymentRes.success) {
                                                                    window.location.href = paymentRes.url;
                                                                } else {
                                                                    toast.error("Payment Initiation Failed");
                                                                    setIsSubmitting(false);
                                                                }
                                                            } else {
                                                                toast.error("Failed to initialize registration");
                                                                setIsSubmitting(false);
                                                            }
                                                        } catch (e) {
                                                            console.error(e);
                                                            toast.error("System Error");
                                                            setIsSubmitting(false);
                                                        }
                                                    }}
                                                    className="w-full bg-[#5f259f] hover:bg-[#5f259f]/90 text-white font-bold h-14 text-lg shadow-lg shadow-purple-200 transition-all hover:scale-[1.02]"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Pay via PhonePe"}
                                                </Button>

                                                <div className="flex items-center gap-2 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                                                    <img src="/phonepe.png" alt="PhonePe" className="h-6 opacity-80" />
                                                    <span className="text-[10px] font-bold">Secured by PhonePe</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={prevStep}
                                                    disabled={isSubmitting}
                                                    className="w-full h-11 font-bold"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Success Popup */}
            < Dialog open={showSuccess} onOpenChange={setShowSuccess} >
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
            </Dialog >
        </>
    );
};

export default RegistrationDialog;
