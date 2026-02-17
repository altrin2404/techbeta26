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
    events: z.array(z.string()).min(1, "Select at least one event"),
});

const formSchema = z.object({
    // college: z.string().min(2, "College name is required"), // Removed from root
    // department: z.string().min(2, "Department is required"), // Removed from root
    // events: z.array(z.string()).min(1, "Select at least one event"), // Removed from root
    transactionId: z.string().min(6, "Valid Transaction ID is required"),
    upiName: z.string().optional(),
    members: z.array(memberSchema).min(1).max(4),
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
            // college: "", // Removed from root
            // department: "", // Removed from root
            // events: [], // Removed from root
            transactionId: "",
            upiName: "",
            members: [{ name: "", email: "", phone: "", college: "", department: "", events: [] }],
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

    // Wait, code says 1 rupee display, but razorpay amount "100" (which is paise = 1 INR).
    // User requirement: "razorpay sould collect the amount as per the team members count".
    // So if 1 member = 100 paise (1 INR). If 4 members = 400 paise (4 INR).

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        const leadMember = values.members[0];

        // Aggregate all unique events from all members
        const allEvents = Array.from(new Set(values.members.flatMap(m => m.events)));

        // Flatten data for Google Forms - just concatenating for now
        const allNames = values.members.map(m => m.name).join(", ");
        const allEmails = values.members.map(m => m.email).join(", ");
        const allPhones = values.members.map(m => m.phone).join(", ");
        const allColleges = values.members.map(m => m.college).join(", ");
        const allDepts = values.members.map(m => m.department).join(", ");

        const submitToGoogleForms = async () => {
            try {
                const formData = new FormData();
                // Map your Google Form entry IDs here
                // Example: entry.123456=Name, entry.654321=Email, etc.
                // For now assuming we just send lead details or concatenated string
                // You'll need to update these IDs based on your actual Google Form
                formData.append("entry.2005620554", allNames);
                formData.append("entry.1045781291", allEmails);
                formData.append("entry.1166974658", allPhones);
                formData.append("entry.1065046570", allColleges); // Using concatenated colleges
                formData.append("entry.839337160", allDepts); // Using concatenated depts
                formData.append("entry.1174092410", allEvents.join(", "));
                formData.append("entry.1206806733", values.transactionId);

                await fetch("https://docs.google.com/forms/d/e/1FAIpQLSe12B5j3CqwXqV-gwWb1Q_yQ8N65s3V273x0-4x64585148/formResponse", {
                    method: "POST",
                    body: formData,
                    mode: "no-cors",
                });
            } catch (error) {
                console.error("Google Forms Error:", error);
                // Don't block main flow
            }
        };

        const fireConfetti = () => {
            const count = 80;
            const defaults = { origin: { y: 0.7 } };
            const colors = ['#0EA5E9', '#9333EA', '#22C55E', '#EAB308', '#EF4444'];
            // ... simple confetti logic would go here if space allowed, shortening for now
        };

        setTimeout(async () => {
            await submitToGoogleForms();

            // Save to Firebase
            const { addRegistration } = await import("@/lib/registrationService");

            // Construct registration object compatible with interface
            const registrationData: Omit<Registration, 'id' | 'registrationDate' | 'status' | 'timestamp'> = {
                name: leadMember.name, // Lead details for backward compatibility
                email: leadMember.email,
                phone: leadMember.phone,
                college: leadMember.college, // Lead's college for backward compatibility
                department: leadMember.department, // Lead's dept
                events: allEvents,
                transactionId: values.transactionId,
                upiName: values.upiName,
                members: values.members as any, // Cast to any to bypass strict check, validated by Zod
            };

            const result = await addRegistration(registrationData);

            if (result.success) {
                window.dispatchEvent(new Event("registration-updated"));

                setIsSubmitting(false);
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
            key: "rzp_live_SGVbI9rDnkoihY",
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
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setStep(1);
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] overflow-hidden p-0 gap-0 rounded-3xl border-none shadow-2xl bg-[#0f172a] text-white">
                <div className="bg-slate-900 border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-50">
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

                <div className="max-h-[80vh] overflow-y-auto bg-slate-50 text-slate-900">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    {step === 1 ? (
                                        <>
                                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Team Details</span>
                                            <Badge variant="outline" className="ml-2 border-primary/20 text-primary bg-primary/5">Step 1/2</Badge>
                                        </>
                                    ) : (
                                        <>
                                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">Payment</span>
                                            <Badge variant="outline" className="ml-2 border-emerald-500/20 text-emerald-600 bg-emerald-50">Step 2/2</Badge>
                                        </>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="text-center font-medium text-muted-foreground">
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
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                                            <Users size={14} /> Member {index + 1} {index === 0 && "(Team Lead)"}
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
                                                        <div className="grid grid-cols-2 gap-3">
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
                                                        <div className="grid grid-cols-2 gap-3">
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
                                                        </div>

                                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">Events for Member</FormLabel>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {eventOptions.map((event) => (
                                                                    <FormField
                                                                        key={event}
                                                                        control={form.control}
                                                                        name={`members.${index}.events` as any}
                                                                        render={({ field }) => (
                                                                            <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border border-slate-200 bg-white p-2 hover:bg-slate-50 transition-colors">
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={(field.value as string[])?.includes(event)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            const currentValue = (field.value as string[]) || [];
                                                                                            return checked
                                                                                                ? field.onChange([...currentValue, event])
                                                                                                : field.onChange(
                                                                                                    currentValue.filter(
                                                                                                        (value: string) => value !== event
                                                                                                    )
                                                                                                )
                                                                                        }}
                                                                                        className="border-primary h-4 w-4"
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="text-[10px] font-bold cursor-pointer text-slate-700 leading-tight">
                                                                                    {event}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                ))}
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
                                                onClick={() => append({ name: "", email: "", phone: "", college: "", department: "", events: [] })}
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
        </Dialog>
    );
};

export default RegistrationDialog;
