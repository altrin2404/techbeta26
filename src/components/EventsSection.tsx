import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Cpu, FileText, Gamepad2, Lightbulb, Presentation, Info, CheckCircle2, ChevronDown, ChevronUp, Palette, Music, Mic2, Trophy, Disc } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const technicalEvents = [
    {
        icon: Lightbulb,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
    {
        icon: Code,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
    {
        icon: Cpu,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
    {
        icon: Gamepad2,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
];

const nonTechnicalEvents = [
    {
        icon: Palette,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
    {
        icon: Music,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
    {
        icon: Mic2,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
    {
        icon: Trophy,
        name: "",
        description: "",
        shortRules: "",
        detailedRules: [] as string[]
    },
];

type EventItem = {
    icon: React.ElementType;
    name: string;
    description: string;
    shortRules: string;
    detailedRules: string[];
};

const EventCard = React.memo(({ event, index }: { event: EventItem; index: number }) => (
    <motion.div
        key={event.name || `event-${index}`}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        whileHover={{ y: -10, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group glass-card relative overflow-hidden rounded-2xl border border-black/5 p-6 transition-all duration-500 hover:border-primary/30 hover:box-glow-cyan cursor-pointer"
    >
        <div className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-primary via-transparent to-secondary blur-2xl" />

        <div className="relative z-10">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <event.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors min-h-[1.75rem]">
                        {event.name}
                    </h3>
                </div>

                {event.detailedRules.length > 0 && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full">
                                <Info size={18} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto bg-white border-black/5 rounded-3xl p-0 overflow-hidden safe-bottom">
                            <div className="bg-primary/5 px-6 py-8 flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                    <event.icon className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-display text-xl font-black text-foreground">{event.name}</h4>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Event Rules & Guidelines</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <p className="text-sm font-medium text-muted-foreground italic">{event.description}</p>

                                <div className="space-y-3">
                                    {event.detailedRules.map((rule, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group/rule hover:border-primary/20 transition-colors">
                                            <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                                            <p className="text-xs font-bold text-foreground leading-relaxed">{rule}</p>
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={() => (document.querySelector('button[aria-label="Close"]') as HTMLElement)?.click()} className="w-full h-12 bg-primary hover:bg-primary/90 font-black tracking-widest uppercase text-xs rounded-xl">
                                    Got It
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <p className="text-sm leading-relaxed text-foreground/70 font-medium line-clamp-2 min-h-[2.5rem]">
                {event.description}
            </p>

            <div className="mt-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-[10px] font-black uppercase text-primary shrink-0">Details :</span>
                <p className="text-[10px] text-foreground/80 font-bold truncate">
                    {event.shortRules}
                </p>
            </div>
        </div>
    </motion.div>
));

const EventsSection = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section id="events" className="relative py-12 px-4 shadow-inner">
            <div className="container mx-auto max-w-6xl">
                {/* Main Section Toggle */}
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
                            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-4">
                                <Disc className="text-secondary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl px-2">
                                    Events
                                </h2>
                                {isOpen ? (
                                    <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />
                                )}
                            </div>
                            <div className="mx-auto h-1 w-20 rounded-full bg-secondary/30 group-hover:bg-secondary/60 transition-colors" />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                                {isOpen ? "Click to Close" : "Click to View Events"}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-4 pb-8">

                                {/* Technical Events Column */}
                                <div>
                                    <div className="mb-6 flex items-center gap-3 justify-center md:justify-start">
                                        <div className="h-10 w-10 full flex items-center justify-center rounded-lg bg-secondary/10">
                                            <Cpu className="h-5 w-5 text-secondary" />
                                        </div>
                                        <h3 className="font-display text-xl font-bold text-foreground">
                                            Technical Events
                                        </h3>
                                    </div>
                                    <div className="grid gap-5">
                                        {technicalEvents.map((event, i) => (
                                            <EventCard key={`tech-${i}`} event={event} index={i} />
                                        ))}
                                    </div>
                                </div>

                                {/* Non-Technical Events Column */}
                                <div>
                                    <div className="mb-6 flex items-center gap-3 justify-center md:justify-start">
                                        <div className="h-10 w-10 full flex items-center justify-center rounded-lg bg-orange-500/10">
                                            <Trophy className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <h3 className="font-display text-xl font-bold text-foreground">
                                            Non-Technical Events
                                        </h3>
                                    </div>
                                    <div className="grid gap-5">
                                        {nonTechnicalEvents.map((event, i) => (
                                            <EventCard key={`nontech-${i}`} event={event} index={i} />
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default EventsSection;
