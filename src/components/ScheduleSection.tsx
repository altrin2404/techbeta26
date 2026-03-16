import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Coffee, Trophy, UserCheck, PlayCircle, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const schedule = [
    {
        time: "09:00 AM",
        event: "Inaugration",
        description: "Official opening ceremony of TECHBETA 2026.",
        icon: PlayCircle,
        color: "bg-blue-500",
    },
    {
        time: "10:00 AM",
        event: "Events Commences",
        description: "Commencement of all technical competitions and workshops",
        icon: UserCheck,
        color: "bg-purple-500",
    },
    {
        time: "01:00 PM",
        event: "Lunch Break",
        description: "Lunch will be provided at food court",
        icon: Coffee,
        color: "bg-orange-500",
    },
    {
        time: "01:45 PM",
        event: "Valedictory & Prize Distribution",
        description: "Closing ceremony and awarding the winners.",
        icon: Trophy,
        color: "bg-green-500",
    },
    {
        time: "04:15 PM",
        event: "Departure",
        description: "Make use of College Buses",
        icon: Clock,
        color: "bg-slate-500",
    },
];

const ScheduleSection = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section id="schedule" className="relative py-12 px-4 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(!isOpen)}
                        className="group p-0 h-auto hover:bg-transparent"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center"
                        >
                            <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
                                <Calendar className="text-secondary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl px-2">
                                    Event Timeline
                                </h2>
                                {isOpen ? <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />}
                            </div>
                            <div className="mx-auto h-1 w-20 rounded-full bg-secondary/30 group-hover:bg-secondary/60 transition-colors" />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                                {isOpen ? "Click to Close" : "Click to View Schedule"}
                            </p>
                        </motion.div>
                    </Button>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="relative pt-12 pb-8">
                                {/* Vertical Line */}
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50 md:left-1/2 md:-translate-x-1/2" />

                                <div className="space-y-12">
                                    {schedule.map((item, i) => (
                                        <motion.div
                                            key={item.event}
                                            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: i * 0.1 }}
                                            className={`relative flex items-center justify-between md:justify-between md:odd:flex-row-reverse group`}
                                            style={{ willChange: "transform, opacity" }}
                                        >
                                            {/* Time Mobile */}
                                            <div className="flex flex-col items-center md:hidden pr-8 z-10">
                                                <div className={`h-12 w-12 rounded-full ${item.color} flex items-center justify-center text-white shadow-lg`}>
                                                    <item.icon size={20} />
                                                </div>
                                            </div>

                                            {/* Content Card */}
                                            <div className="flex-1 md:flex-none md:w-[45%] z-10">
                                                <div className="glass-card p-6 rounded-2xl border border-black/5 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group-hover:-translate-y-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{item.time}</span>
                                                        <item.icon className={`h-5 w-5 ${item.color.replace('bg-', 'text-')} md:hidden opacity-50`} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-foreground mb-2">{item.event}</h3>
                                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                                                </div>
                                            </div>

                                            {/* Desktop Icon/Node */}
                                            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 h-12 w-12 rounded-full border-4 border-background items-center justify-center z-20 overflow-hidden group">
                                                <div className={`absolute inset-0 ${item.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
                                                <item.icon className="h-5 w-5 relative z-10 group-hover:text-white transition-colors" />
                                            </div>

                                            <div className="hidden md:block w-[45%]" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default ScheduleSection;
