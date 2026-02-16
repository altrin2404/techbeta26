import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


const Footer = () => {
    return (
        <footer className="border-t border-black/5 py-6 text-center bg-card/30 backdrop-blur-md relative overflow-hidden safe-bottom">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative flex flex-col items-center gap-2 px-6 py-5 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 text-center">
                        <p className="font-display text-sm font-medium tracking-wide text-foreground/80">
                            <span className="mr-1">&copy;</span> ALTRIN BENSER - III IT
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
