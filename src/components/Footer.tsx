import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const Footer = () => {
    const [password, setPassword] = useState("");
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleAdminAccess = (e: React.FormEvent) => {
        e.preventDefault();
        // Standard Admin Password from our requirements
        if (password === "techbeta26@admin") {
            sessionStorage.setItem("adminAuth", "true");
            setOpen(false);
            setPassword("");
            toast.success("Access Granted", {
                description: "Welcome to the Admin Dashboard."
            });
            navigate("/admin");
        } else {
            toast.error("Incorrect Password", {
                description: "Administrative access denied."
            });
        }
    };

    return (
        <footer className="border-t border-black/5 py-6 text-center bg-card/30 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative flex flex-col items-center gap-3 px-8 py-5 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="relative z-10 font-mono text-xs tracking-[0.4em] text-foreground/50 uppercase font-bold">
                        <span className="text-base mr-1">©</span> ALTRIN BENSER, 3rd Yr IT
                    </p>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary/20" />
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary hover:bg-transparent transition-all duration-300"
                                >
                                    Admin Console
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-black/5 dark:border-white/10">
                                <DialogHeader>
                                    <DialogTitle className="text-center font-display text-xl font-bold">Admin Login</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAdminAccess} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Master Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12 text-center font-mono text-lg"
                                            autoFocus
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-bold">
                                        Unlock Dashboard
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary/20" />
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
