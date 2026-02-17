import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


const Footer = () => {
    return (
        <footer className="border-t border-white/5 py-12 text-center bg-[#0f172a] relative overflow-hidden safe-bottom">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative flex flex-col items-center gap-2 px-8 py-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 text-center">
                        <p className="font-display text-lg font-black text-white">
                            ALTRIN BENSER <span className="text-primary mx-2">|</span> <span className="text-slate-300">III IT</span>
                        </p>
                        <p className="mt-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase opacity-60">
                            &copy; 2026 techbeta2k26 . All Rights Reserved
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
