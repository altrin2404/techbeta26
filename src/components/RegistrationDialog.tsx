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
import { useRazorpay } from "@/hooks/useRazorpay";
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
            const count = 80;
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

    const { isLoaded: isRazorpayLoaded, error: razorpayError } = useRazorpay();

    // Effect to handle Razorpay load error
    React.useEffect(() => {
        if (razorpayError) {
            toast.error("Failed to load payment gateway. Please check your internet connection.");
        }
    }, [razorpayError]);

    const displayRazorpay = async () => {
        if (!isRazorpayLoaded) {
            toast.error("Payment gateway is still loading. Please wait a moment...");
            return;
        }

        const options = {
            key: "rzp_live_SGVbI9rDnkoihY",
            amount: "100",
            currency: "INR",
            name: "TECHBETA 2K26",
            description: "Registration Fee",
            image: "/brigitz-logo.png",
            handler: function (response: any) {
                form.setValue('transactionId', response.razorpay_payment_id);
                form.setValue('upiName', 'Razorpay Online');

                toast.success("Payment Successful!");

                const values = form.getValues();
                onSubmit(values);
            },
            prefill: {
                name: form.getValues('name'),
                email: form.getValues('email'),
                contact: form.getValues('phone')
            },
            notes: {
                address: "SXCCE Campus"
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
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto sm:max-w-lg glass-card border-black/5 p-0 bg-background/95 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                    <div className="p-4 pt-6 sm:p-6 sm:pt-8 safe-bottom">
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
                                {step === 1 ? "Step 1: Participant Details" : <>Step 2: Pay Registration Fee: <span className="text-emerald-500 font-bold">₹1</span></>}
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
                                                                <Input placeholder="xyz" {...field} className="bg-background/50 border-black/5 min-h-[44px]" />
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
                                                                <Input placeholder="john@example.com" {...field} className="bg-background/50 border-black/5 min-h-[44px]" />
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
                                                                <Input placeholder="10-digit number" {...field} className="bg-background/50 border-black/5 min-h-[44px]" />
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
                                                                <Input placeholder="e.g. IT, CSE" {...field} className="bg-background/50 border-black/5 min-h-[44px]" />
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
                                                            <Input placeholder="Enter your college" {...field} className="bg-background/50 border-black/5 min-h-[44px]" />
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
                                            <div className="text-center space-y-4 py-4">
                                                <div className="mx-auto w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-4 border border-primary/10">
                                                    <img src="/brigitz-logo.png" alt="Logo" className="h-16 w-auto object-contain" />
                                                </div>
                                                <h3 className="text-xl font-bold">Registration Fee: <span className="inline-block bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-1 rounded-lg text-2xl font-black shadow-lg shadow-slate-800/40">₹1.00</span></h3>
                                                <p className="text-sm text-muted-foreground px-6">
                                                    Click the button below to initiate the secure payment via Razorpay.
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
                                                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (!isRazorpayLoaded ? "Loading Payment..." : "Pay Now with Razorpay")}
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
                            Your payment ID: <span className="font-mono bg-muted px-1 rounded">{form.getValues('transactionId')}</span>
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
