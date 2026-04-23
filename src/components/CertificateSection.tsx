import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Award, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CertificateClaimDialog = lazy(() => import("./CertificateClaimDialog"));

const CertificateSection = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <section className="relative py-12 px-4 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/30 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative group overflow-hidden rounded-[2.5rem] border border-primary/20 bg-card/40 backdrop-blur-md p-8 md:p-12 shadow-2xl"
                >
                    {/* Animated gradient border effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                    Now Available
                                </span>
                            </div>

                            <h2 className="font-display text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                                Claim Your <span className="text-primary text-glow-cyan">Certificates</span>
                            </h2>

                            <p className="text-foreground/70 font-medium text-lg max-w-xl mb-8 leading-relaxed">
                                Congratulations to all participants of TechBeta 2026!. Claim your digital certificates now.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button
                                    onClick={() => setIsDialogOpen(true)}
                                    size="lg"
                                    className="w-full sm:w-auto h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-widest uppercase text-xs shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105 active:scale-95 group"
                                >
                                    <Award className="mr-2 h-5 w-5" />
                                    Claim Your Certificates
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>

                            </div>
                        </div>

                        <div className="relative hidden lg:block" onContextMenu={(e) => e.preventDefault()}>
                            <div className="relative z-10 w-96 h-64 rounded-2xl border-4 border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                                <img 
                                    src="/cert_placeholder.jpeg" 
                                    alt="Certificate Preview" 
                                    className="w-full h-full object-cover select-none pointer-events-none"
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable="false"
                                />
                            </div>

                            {/* Decorative floaters */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl"
                            />
                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 -left-10 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            <Suspense fallback={null}>
                {isDialogOpen && (
                    <CertificateClaimDialog
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                    />
                )}
            </Suspense>
        </section>
    );
};

export default CertificateSection;
