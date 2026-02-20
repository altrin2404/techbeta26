import { Suspense, lazy, useEffect, useState } from "react";
import { motion } from "framer-motion";
const RegistrationDialog = lazy(() => import("./RegistrationDialog"));
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-32">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(190_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(190_100%_50%/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 px-2 sm:px-4"
        >
          <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center md:items-start text-center md:text-left cursor-default transition-all duration-300 max-w-full"
          >
            <span className="font-display text-base font-black tracking-[0.05em] sm:tracking-[0.1em] text-primary sm:text-xl lg:text-3xl drop-shadow-sm break-words overflow-wrap-anywhere leading-tight">
              ST XAVIER'S CATHOLIC COLLEGE OF ENGINEERING
            </span>
            <div className="mt-4 flex flex-col items-center md:items-start gap-1">
              <span className="font-display text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase">
                Organised by
              </span>
              <div className="flex items-center gap-4">
                <span className="font-display text-xs font-extrabold tracking-[0.05em] sm:tracking-[0.1em] text-secondary uppercase sm:text-base lg:text-xl">
                  Department of Information Technology
                </span>
                <div className="hidden md:block h-[2px] w-16 bg-gradient-to-r from-secondary/50 to-transparent" />
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={window.innerWidth < 768 ? {} : {
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer will-change-transform"
          >
            <img
              src="/brigitz-logo.png"
              alt="BRIGITZ Logo"
              width={150}
              height={150}
              className="max-h-[80px] sm:max-h-[120px] md:max-h-[150px] w-auto object-contain drop-shadow-xl transition-all duration-500"
              loading="eager"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 font-display text-sm tracking-[0.3em] text-muted-foreground uppercase font-bold"
        >
          A National Level Technical Symposium
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="font-display text-4xl font-black tracking-wide sm:tracking-wider text-foreground sm:text-6xl md:text-8xl lg:text-9xl"
        >
          TECHBETA <span className="text-primary text-glow-cyan">2K26</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl font-semibold italic"
        >
          "THEME!"
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-4 flex flex-col items-center gap-2 text-sm text-foreground"
        >
          <p className="font-display text-xs tracking-widest text-secondary font-bold">
            📅 March 13, 2026 &nbsp;|&nbsp; 📍 SXCCE, Nagercoil, 9:00 AM
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Suspense fallback={<Button size="lg" disabled className="px-8"><Loader2 className="animate-spin" /></Button>}>
            <RegistrationDialog>
              <Button size="lg" className="font-display text-sm font-bold tracking-wider box-glow-cyan px-8 cursor-pointer min-h-[44px]">
                Register Now
              </Button>
            </RegistrationDialog>
          </Suspense>
          <Button asChild variant="outline" size="lg" className="font-display text-sm tracking-wider border-glow-cyan min-h-[44px]">
            <a href="#events">Explore Events</a>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="h-6 w-6 text-primary/50" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
