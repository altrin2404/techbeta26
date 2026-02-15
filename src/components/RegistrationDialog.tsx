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
import { Loader2, Rocket, CreditCard, ChevronRight, ArrowLeft, QrCode } from "lucide-react";
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

                toast.success("Registration Submitted!", {
                    description: "Payment verification is in progress. Welcome to TECHBETA 2K26!",
                });
            } else {
                toast.error("Registration Failed", {
                    description: "Please try again or contact support.",
                });
                setIsSubmitting(false);
            }
        }, 1500);
    }

    return (
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
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 text-center">Steps to Follow</h4>
                                            <div className="space-y-2">
                                                {[
                                                    "Scan the QR code with any UPI App",
                                                    "Pay the registration fee of ₹1.00",
                                                    "Copy the 12-digit Ref No. / Transaction ID",
                                                    "Enter it below & click Complete Registration"
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
                                            <div className="h-48 w-48 bg-white rounded-lg flex items-center justify-center p-2 border border-black/5 shadow-sm overflow-hidden">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=9385675451-3@ybl&pn=TECHBETA2K26&am=1&cu=INR')}`}
                                                    alt="Payment QR Code"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                            <div className="mt-4 text-center">
                                                <p className="text-lg font-black text-slate-800">₹ 1.00</p>
                                                <p className="text-xs text-slate-500 font-medium italic">Scan via UPI</p>

                                                <div className="flex items-center gap-4 mt-3 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-4" />
                                                    <div className="w-[1px] h-3 bg-slate-200" />
                                                    <img src="/phonepe.png" alt="PhonePe" className="h-10 w-auto object-contain" />
                                                    <div className="w-[1px] h-3 bg-slate-200" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-3" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="transactionId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Transaction ID / Ref ID *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter 12-digit Ref No." {...field} className="bg-background/50 border-black/5" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="upiName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-foreground/60">UPI Name (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Name on your Payment App" {...field} className="bg-background/50 border-black/5" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                            <p className="text-[9px] text-muted-foreground italic text-center px-4">
                                                Tip: You can find the Ref No. in GPay, PhonePe, or Paytm transaction history.
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={prevStep}
                                                className="flex-1 h-11 font-bold"
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Complete Registration"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RegistrationDialog;
