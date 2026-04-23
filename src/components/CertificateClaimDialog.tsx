import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCertificatesByEmail, Certificate } from "@/lib/certificateService";
import { Loader2, Download, Search, AlertCircle, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CertificateClaimDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const CertificateClaimDialog = ({ isOpen, onClose }: CertificateClaimDialogProps) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [certificates, setCertificates] = useState<Certificate[] | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        try {
            const results = await getCertificatesByEmail(email);
            setCertificates(results);
            setHasSearched(true);
            if (results.length === 0) {
                toast.info("No certificates found for this email.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch certificates. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setEmail("");
        setCertificates(null);
        setHasSearched(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setTimeout(resetState, 300);
            }
        }}>
            <DialogContent className="sm:max-w-[500px] bg-card border-primary/20 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        <FileCheck className="h-6 w-6 text-primary" />
                        Claim Your Certificates
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                        Enter the email address you used during registration to find and download your certificates.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background/50 border-primary/20 focus-visible:ring-primary/30 h-12"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </Button>
                    </form>

                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-12 flex flex-col items-center justify-center gap-4"
                            >
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                    <FileCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Searching records...</p>
                            </motion.div>
                        ) : hasSearched && certificates ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {certificates.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
                                            Found {certificates.length} Certificate{certificates.length > 1 ? 's' : ''}
                                        </p>
                                        <div className="grid gap-3">
                                            {certificates.map((cert) => (
                                                <div
                                                    key={cert.id}
                                                    className="group flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-primary/5 hover:border-primary/30 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <FileCheck className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{cert.name} </p>

                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold rounded-lg transition-all"
                                                        onClick={() => window.open(cert.url, '_blank')}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center space-y-4 rounded-2xl border border-dashed border-primary/20 bg-primary/5">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <AlertCircle className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">No Certificates Found</p>
                                            <div className="text-sm text-muted-foreground mt-2 px-8 space-y-2">
                                                <p>We couldn't find any certificates linked to <b>{email}</b>.</p>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* Query Box */}
                    <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Need Help?</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                If your certificate is not found or has incorrect details, please contact: <br />
                                <span className="text-primary font-bold">9385675451, 7598403125</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-primary/10">
                    <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-[0.2em]">
                        TechBeta 2026
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CertificateClaimDialog;
