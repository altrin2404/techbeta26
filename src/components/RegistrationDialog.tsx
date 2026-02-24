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
import { Loader2, Rocket, CreditCard, ChevronRight, ArrowLeft, QrCode, CheckCircle, Plus, Trash2, Users, X } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import type { Registration } from "@/lib/registrationService";

const memberSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone"),
    college: z.string().min(2, "College is required"),
    department: z.string().min(2, "Department is required"),
    year: z.string().min(1, "Year is required"),
    events: z.array(z.string()).min(1, "Select at least one event"),
});

const formSchema = z.object({
    transactionId: z.string().min(6, "Valid Transaction ID is required"),
    upiName: z.string().optional(),
    members: z.array(memberSchema).min(1).max(4),
});

const technicalEvents = [
    "Ideathon",
    "Web/Logo Designing",
    "Debugging",
    "Tech Quiz"
];

const nonTechnicalEvents = [
    "Gaming",
    "Photography",
    "Treasure Hunt",
    "Surprise Event"
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
        // Rate limiting: block submissions within 30 seconds
        const lastSubmit = localStorage.getItem('lastRegistrationSubmit');
        const now = Date.now();
        if (lastSubmit && now - parseInt(lastSubmit) < 30000) {
            const remainingSec = Math.ceil((30000 - (now - parseInt(lastSubmit))) / 1000);
            toast.error(`Please wait ${remainingSec} seconds before submitting again.`);
            return;
        }

        setIsSubmitting(true);
        localStorage.setItem('lastRegistrationSubmit', now.toString());

        const leadMember = values.members[0];
        const allEvents = Array.from(new Set(values.members.flatMap(m => m.events)));

        // Flatten data for Google Forms
        const allNames = values.members.map(m => m.name).join(", ");
        const allEmails = values.members.map(m => m.email).join(", ");
        const allPhones = values.members.map(m => m.phone).join(", ");
        const allColleges = values.members.map(m => m.college).join(", ");
        const allDepts = values.members.map(m => m.department).join(", ");
        const allYears = values.members.map(m => m.year).join(", ");

        const submitToGoogleForms = async () => {
            try {
                const formData = new FormData();
                // Sanitize and trim inputs before appending
                formData.append("entry.2005620554", allNames.trim());
                formData.append("entry.1045781291", allEmails.trim());
                formData.append("entry.1166974658", allPhones.trim());
                formData.append("entry.1065046570", allColleges.trim());
                formData.append("entry.839337160", allDepts.trim());
                formData.append("entry.1174092410", allEvents.join(", "));
                formData.append("entry.1206806733", values.transactionId.trim());

                await fetch("https://docs.google.com/forms/d/e/1FAIpQLSe12B5j3CqwXqV-gwWb1Q_yQ8N65s3V273x0-4x64585148/formResponse", {
                    method: "POST",
                    body: formData,
                    mode: "no-cors",
                });
            } catch (error) {
                console.error("Google Forms Error:", error);
            }
        };

        const fireConfetti = () => {
            const count = 80;
            const defaults = { origin: { y: 0.7 } };
            const colors = ['#0EA5E9', '#9333EA', '#22C55E', '#EAB308', '#EF4444'];

            function fire(particleRatio: number, opts: any) {
                (window as any).confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio),
                    colors: colors,
                    zIndex: 9999
                });
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
        };

        setTimeout(async () => {
            await submitToGoogleForms();

            const { addRegistration } = await import("@/lib/registrationService");

            const registrationData: Omit<Registration, 'id' | 'registrationDate' | 'status' | 'timestamp'> = {
                name: leadMember.name,
                email: leadMember.email,
                phone: leadMember.phone,
                college: leadMember.college,
                department: leadMember.department,
                events: allEvents,
                transactionId: values.transactionId,
                upiName: values.upiName,
                members: values.members.map(m => ({
                    ...m,
                    year: m.year
                })) as any,
            };

            const result = await addRegistration(registrationData);

            if (result.success) {
                window.dispatchEvent(new Event("registration-updated"));
                setIsSubmitting(false);
                setSavedPaymentId(values.transactionId);
                setOpen(false);
                setStep(1);
                form.reset();
                fireConfetti();
                setShowSuccess(true);
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

        const amountToPay = fields.length * 100; // 100 paise = 1 INR per member

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY,
            amount: amountToPay.toString(),
            currency: "INR",
            name: "TECHBETA 2K26",
            description: `Registration Fee for ${fields.length} Member(s)`,
            image: "/brigitz-logo.png",
            handler: function (response: any) {
                form.setValue('transactionId', response.razorpay_payment_id);
                form.setValue('upiName', 'Razorpay Online');

                toast.success("Payment Successful!");

                const values = form.getValues();
                onSubmit(values);
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
                                <DialogTitle className="text-sm font-bold tracking-wide uppercase text-white">Event Registration</DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-400 font-medium">Join TECHBETA 2K26</DialogDescription>
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
                                    <DialogDescription className="text-center font-bold text-slate-500 text-xs sm:text-sm">
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
                                                            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
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
                                                                            <FormMessage className="text-[10px]" />
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
                                                                            <FormMessage className="text-[10px]" />
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
                                                                            <FormMessage className="text-[10px]" />
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
                                                                            <FormMessage className="text-[10px]" />
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
                                                                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Technical Events</FormLabel>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        {technicalEvents.map((event) => (
                                                                            <FormField
                                                                                key={event}
                                                                                control={form.control}
                                                                                name={`members.${index}.events` as any}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors shadow-sm">
                                                                                        <FormControl>
                                                                                            <Checkbox
                                                                                                checked={(field.value as string[])?.includes(event)}
                                                                                                onCheckedChange={(checked) => {
                                                                                                    const currentValue = (field.value as string[]) || [];
                                                                                                    return checked
                                                                                                        ? field.onChange([...currentValue, event])
                                                                                                        : field.onChange(currentValue.filter((value: string) => value !== event))
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
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Non-Technical Events</FormLabel>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        {nonTechnicalEvents.map((event) => (
                                                                            <FormField
                                                                                key={event}
                                                                                control={form.control}
                                                                                name={`members.${index}.events` as any}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors shadow-sm">
                                                                                        <FormControl>
                                                                                            <Checkbox
                                                                                                checked={(field.value as string[])?.includes(event)}
                                                                                                onCheckedChange={(checked) => {
                                                                                                    const currentValue = (field.value as string[]) || [];
                                                                                                    return checked
                                                                                                        ? field.onChange([...currentValue, event])
                                                                                                        : field.onChange(currentValue.filter((value: string) => value !== event))
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
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <FormField
                                                                    name={`members.${index}.events` as any}
                                                                    render={() => <FormMessage className="text-[10px]" />}
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
                                                    <img src="/brigitz-logo.png" alt="Logo" className="h-16 w-auto object-contain" />
                                                </div>
                                                <h3 className="text-xl font-bold">
                                                    Total Fee: <span className="inline-block bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-1 rounded-lg text-2xl font-black shadow-lg shadow-slate-800/40">₹{totalAmount / 100}</span>
                                                </h3>
                                                <p className="text-sm text-muted-foreground px-6">
                                                    For {fields.length} Team Member(s)
                                                    <br />
                                                    <span className="text-xs opacity-70">(₹1 per member)</span>
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
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Registration Successful!</DialogTitle>
                    </div>
                    <div className="p-6 text-center space-y-4">
                        <p className="text-lg font-black text-slate-800">
                            Welcome to <span className="font-black">TECHBETA 2K26</span>
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
                            <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-1">Important</p>
                            <ol className="list-decimal list-inside space-y-2 text-sm font-bold text-orange-900 leading-tight">
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
