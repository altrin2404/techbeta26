import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react";
import RegistrationDialog from "./RegistrationDialog";
import { Button } from "@/components/ui/button";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownSection = () => {
    const targetDate = new Date("2026-03-13T09:00:00").getTime();

    const calculateTimeLeft = (): TimeLeft => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const timeUnits = [
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
    ];

    return (
        <section className="relative py-12 px-4 overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    {/* Left: Countdown Timer */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-center lg:text-left"
                    >
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                            <Clock className="h-5 w-5 text-primary animate-pulse" />
                            <span className="font-display text-xs tracking-[0.3em] text-foreground/80 uppercase font-bold">
                                Countdown to Event
                            </span>
                        </div>
                        <h2 className="font-display text-4xl font-bold text-foreground mb-8">
                            The Clock is <span className="text-primary">Ticking</span>
                        </h2>

                        <div className="grid grid-cols-4 gap-4">
                            {timeUnits.map((unit) => (
                                <div key={unit.label} className="flex flex-col items-center lg:items-start">
                                    <div className="relative flex h-16 w-full items-center justify-center rounded-xl border border-border bg-card shadow-sm text-2xl font-black text-primary backdrop-blur-sm sm:h-20 sm:text-4xl">
                                        {unit.value.toString().padStart(2, "0")}
                                    </div>
                                    <span className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-foreground/70">
                                        {unit.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Stylized Calendar Date */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative mx-auto w-full max-w-[320px] lg:mr-0"
                    >
                        <div className="group relative rounded-3xl border border-black/5 bg-card p-8 backdrop-blur-md transition-all duration-500 hover:border-primary/30 shadow-lg">
                            <div className="absolute -top-4 left-1/2 h-8 w-24 -translate-x-1/2 rounded-full border border-border bg-background" />

                            <div className="text-center">
                                <p className="font-display text-sm font-black tracking-widest text-secondary uppercase mb-2">
                                    March 2026
                                </p>
                                <div className="relative inline-block">
                                    <span className="font-display text-8xl font-black text-foreground">
                                        13
                                    </span>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-secondary box-glow-purple"
                                    />
                                </div>
                                <div className="mt-4 flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1">
                                        <CalendarIcon className="h-4 w-4 text-secondary" />
                                        <span className="font-display text-xs font-bold text-secondary">COUNTDOWN TO EVENT</span>
                                    </div>
                                    <p className="mt-2 text-sm text-foreground/80 font-bold">
                                        Friday | SXCCE, Nagercoil
                                    </p>

                                    <div className="mt-6 w-full">
                                        <RegistrationDialog>
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-widest uppercase text-xs h-12 shadow-xl shadow-primary/20 group">
                                                Register Today
                                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </RegistrationDialog>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background decorative elements */}
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-[60px]" />
                        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-secondary/10 blur-[60px]" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CountdownSection;
