import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Cpu, FileText, Gamepad2, Lightbulb, Presentation, Info, CheckCircle2, ChevronDown, ChevronUp, Palette, Music, Mic2, Trophy, Disc } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const technicalEvents = [
    {
        icon: Lightbulb,
        name: "FutureMinds",
        description: "Ideathon - Pitch your innovative ideas and build the future.",
        shortRules: "Ideathon Event",
        detailedRules: [
            "Participants from any technical stream are encouraged to participate.",
            "1–2 participants per team are allowed.",
            "Each team will get 5 minutes (4 minutes for presentation + 1 minute for Q&A).",
            "Presentation must contain 8–12 slides.",
            "Submit the problem statement and idea presentation (PDF/PPT) on or before 25/03/2026 to ideathonit@gmail.com."
        ]
    },
    {
        icon: Code,
        name: "Webfusion",
        description: "Theme: EcoTech Solutions – Think Green",
        shortRules: "Web Design Competition",
        detailedRules: [
            "Time Limit: 1 Hour",
            "Individual participation only.",
            "Participants must use HTML, CSS, and JavaScript for designing the webpage.",
            "Use of the internet is not allowed during the competition.",
            "The design must follow the given theme.",
            "Late submissions will not be accepted.",
            "The decision of the judges will be final."
        ]
    },
    {
        icon: Cpu,
        name: "PromptStorm",
        description: "Prompt Battle - Test your AI prompting skills.",
        shortRules: "Prompt Battle",
        detailedRules: [
            "Individual participation only.",
            "The competition consists of two rounds.",
            "Round 1: 30 minutes – 3 topics will be given.",
            "Top 50% participants will be selected for Round 2 based on performance.",
            "Round 2: 40 minutes – 4 topics will be given, participants must choose any 3 topics.",
            "Judges’ decision will be final."
        ]
    },
    {
        icon: Presentation,
        name: "Postercraft",
        description: "Poster Presentation - Visually present your technical concepts.",
        shortRules: "Poster Presentation",
        detailedRules: [
            "Each team can have maximum 2 participants.",
            "The poster must be prepared on chart paper (A1 or A2 size).",
            "Posters should include diagrams, flowcharts, architecture, and key explanations.",
            "Participants will be given 5 minutes for presentation and 2 minutes for questions.",
            "Posters must be original and not copied directly from the internet.",
            "The title of the topic should be clearly displayed at the top of the chart.",
            "Participants must explain the concept, working, applications, and future scope of the technology.",
            "Charts should be neatly written and visually appealing.",
            "Use of printed pictures and diagrams is allowed.",
            "Judges’ decision will be final."
        ]
    },
    {
        icon: Palette,
        name: "LogoHub",
        description: "Logo Designing - Showcase your creativity by designing stunning logos.",
        shortRules: "Logo Design Competition",
        detailedRules: [
            "Individual participation only.",
            "Time limit: 1 hour to design and submit the logo.",
            "The theme will be given on the spot, and participants must analyze it and design the logo accordingly.",
            "Participants may use any digital design software.",
            "The design must be original and created during the competition.",
            "Final logo must be submitted in PNG/JPG format within the given time."
        ]
    },
    {
        icon: Music,
        name: "VIBE CODING",
        description: "Workshop - Master the art of rapid development with AI and modern tools.",
        shortRules: "Coding Workshop",
        detailedRules: [
            "Hands-on workshop on modern development workflows.",
            "Individual participation.",
            "Learn how to leverage AI tools for accelerated coding.",
            "Understand the concepts of 'Vibe Coding' and rapid prototyping.",
            "Certificate of participation for all attendees."
        ]
    },
];

type EventItem = {
    icon: React.ElementType;
    name: string;
    description: string;
    shortRules: string;
    detailedRules: string[];
};

const EventCard = React.memo(({ event, index }: { event: EventItem; index: number }) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    return (
        <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <motion.div
                key={event.name || `event-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{ willChange: "transform, opacity" }}
                className="group glass-card relative overflow-hidden rounded-2xl border border-black/5 p-6 transition-all duration-500 hover:border-primary/30 hover:box-glow-cyan cursor-pointer"
                onClick={() => setIsInfoOpen(true)}
            >
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-primary via-transparent to-secondary blur-2xl" />

                <div className="relative z-10">
                    <div className="mb-4">
                        <h3 className="font-display text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight break-words">
                            {event.name}
                        </h3>
                        <div className="mt-2 inline-flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity bg-primary/10 px-3 py-1.5 rounded-full">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">
                                {event.name === "VIBE CODING" ? "Description" : "Click for Rules"}
                            </span>
                            <Info size={14} className="text-primary" />
                        </div>
                    </div>

                    <p className="text-base leading-relaxed text-black mb-4 font-medium opacity-90">
                        {event.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                        <span className="text-[10px] font-black uppercase text-primary shrink-0">Details :</span>
                        <p className="text-[11px] text-foreground font-bold truncate">
                            {event.shortRules}
                        </p>
                    </div>

                    {event.name === "FutureMinds" && (
                        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full text-sm font-black bg-primary text-white hover:bg-primary/90 rounded-xl border-2 border-primary shadow-lg shadow-primary/30 animate-pulse">
                                        Problem Statements
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-white border-black/5 rounded-3xl p-0 overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>
                                    <div className="bg-primary/5 px-6 py-6 shrink-0">
                                        <DialogHeader>
                                            <DialogTitle className="font-display text-xl font-black text-foreground">Problem Statements</DialogTitle>
                                            <DialogDescription className="text-xs font-bold text-primary uppercase tracking-widest mt-1">FutureMinds — Ideathon</DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-xl px-4 py-2">
                                            <span className="flex items-center justify-center h-6 w-6 rounded-md bg-primary text-white text-xs font-black">5</span>
                                            <span className="text-sm font-extrabold text-primary uppercase tracking-widest">Problem Statements</span>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto flex-1 px-6 pb-6 pt-4 space-y-3">
                                        {[
                                            {
                                                id: "PS1",
                                                title: "Smart Waste Segregation",
                                                desc: "Many Indian cities struggle with improper waste segregation at the household level, leading to inefficient recycling and landfill overflow. Design a technology-driven system that encourages and monitors waste segregation in residential areas."
                                            },
                                            {
                                                id: "PS2",
                                                title: "Water Usage Monitor",
                                                desc: "Water scarcity is becoming a serious issue in many parts of India. Develop a system that helps households monitor water usage and reduce wastage through smart alerts, analytics, or automated control."
                                            },
                                            {
                                                id: "PS3",
                                                title: "Food Redistribution",
                                                desc: "Large amounts of food are wasted daily in restaurants, weddings, and public events across India. Propose a solution that helps track surplus food and redistribute it efficiently to people in need."
                                            },
                                            {
                                                id: "PS4",
                                                title: "Campus Waste Management",
                                                desc: "College campuses generate large amounts of waste including plastic, paper, and food waste. Design a sustainable waste management system that promotes segregation, recycling, and awareness among students."
                                            },
                                            {
                                                id: "PS5",
                                                title: "Urban Green Cover",
                                                desc: "Urbanization has significantly reduced green spaces in Indian cities. Propose a solution that motivates communities to plant trees and monitor urban green cover using technology."
                                            },
                                        ].map((ps) => (
                                            <div key={ps.id} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors">
                                                <span className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-white text-[10px] font-black tracking-wider">{ps.id}</span>
                                                <div>
                                                    <p className="text-base font-extrabold text-foreground leading-tight">{ps.title}</p>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{ps.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <DialogClose asChild>
                                            <Button className="w-full h-11 bg-primary hover:bg-primary/90 font-black tracking-widest uppercase text-xs rounded-xl mt-2">
                                                Close
                                            </Button>
                                        </DialogClose>
                                    </div>
                                    <div className="shrink-0 flex justify-center py-2 bg-gradient-to-t from-white to-transparent border-t border-slate-100">
                                        <ChevronDown className="h-6 w-6 text-primary animate-bounce" />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                    {event.name === "Postercraft" && (
                        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full text-sm font-black bg-primary text-white hover:bg-primary/90 rounded-xl border-2 border-primary shadow-lg shadow-primary/30 animate-pulse">
                                        Topics
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-white border-black/5 rounded-3xl p-0 overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>
                                    <div className="bg-primary/5 px-6 py-6 shrink-0">
                                        <DialogHeader>
                                            <DialogTitle className="font-display text-xl font-black text-foreground">Topics</DialogTitle>
                                            <DialogDescription className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Postercraft — Poster Presentation</DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-xl px-4 py-2">
                                            <span className="flex items-center justify-center h-6 w-6 rounded-md bg-primary text-white text-xs font-black">15</span>
                                            <span className="text-sm font-extrabold text-primary uppercase tracking-widest">Topics</span>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto flex-1 px-6 pb-6 pt-4 space-y-3">
                                        {[
                                            { id: "T1", title: "Generative AI", desc: "The Future of Intelligent Content Creation" },
                                            { id: "T2", title: "Cybersecurity Trends", desc: "Defending the Digital World from Modern Threats" },
                                            { id: "T3", title: "Metaverse Technology", desc: "Exploring the Next Generation of the Internet" },
                                            { id: "T4", title: "Internet of Things (IoT)", desc: "Smart Devices Transforming Everyday Life" },
                                            { id: "T5", title: "Blockchain Technology", desc: "Securing the Digital Economy" },
                                            { id: "T6", title: "Artificial Intelligence in Healthcare", desc: "Smart Diagnosis and Treatment" },
                                            { id: "T7", title: "Edge Computing", desc: "Bringing Data Processing Closer to Devices" },
                                            { id: "T8", title: "Digital Forensics", desc: "Investigating and Solving Cyber Crimes" },
                                            { id: "T9", title: "DevOps Culture", desc: "Accelerating Modern Software Development" },
                                            { id: "T10", title: "Green Computing", desc: "Building Environment-Friendly IT Systems" },
                                            { id: "T11", title: "Augmented Reality and Virtual Reality", desc: "Immersive Digital Experiences" },
                                            { id: "T12", title: "Quantum Computing", desc: "The Next Revolution in Computing Power" },
                                            { id: "T13", title: "5G Technology", desc: "Enabling Ultra-Fast Communication Networks" },
                                            { id: "T14", title: "Ethical Hacking", desc: "Protecting Systems by Thinking Like Hackers" },
                                            { id: "T15", title: "Smart Cities", desc: "Using Technology for Sustainable Urban Development" }
                                        ].map((ps) => (
                                            <div key={ps.id} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors">
                                                <span className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-white text-[10px] font-black tracking-wider">{ps.id}</span>
                                                <div>
                                                    <p className="text-base font-extrabold text-foreground leading-tight">{ps.title}</p>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{ps.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <DialogClose asChild>
                                            <Button className="w-full h-11 bg-primary hover:bg-primary/90 font-black tracking-widest uppercase text-xs rounded-xl mt-2">
                                                Close
                                            </Button>
                                        </DialogClose>
                                    </div>
                                    <div className="shrink-0 flex justify-center py-2 bg-gradient-to-t from-white to-transparent border-t border-slate-100">
                                        <ChevronDown className="h-6 w-6 text-primary animate-bounce" />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
            </motion.div>

            <DialogContent className="max-w-md max-h-[85dvh] flex flex-col bg-white border-black/5 rounded-3xl p-0 overflow-hidden safe-bottom">
                <div className="bg-primary/5 px-6 py-8 flex items-center gap-4 shrink-0">
                    <div>
                        <h4 className="font-display text-xl font-black text-foreground">{event.name}</h4>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">
                            {event.name === "VIBE CODING" ? "Workshop Description" : "Event Rules & Guidelines"}
                        </p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 text-black">
                    <p className="text-base font-medium">{event.description}</p>

                    <div className="space-y-3">
                        {event.detailedRules.length > 0 ? (
                            event.detailedRules.map((rule, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 group/rule hover:border-primary/20 transition-colors">
                                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                                    <p className="text-xs font-bold text-foreground leading-relaxed">{rule}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-sm font-bold text-muted-foreground">Rules will be updated soon.</p>
                            </div>
                        )}
                    </div>

                    <DialogClose asChild>
                        <Button className="w-full h-12 bg-primary hover:bg-primary/90 font-black tracking-widest uppercase text-xs rounded-xl">
                            Got It
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
});

const EventsSection = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpenEvents = () => {
            setIsOpen(true);
            // Wait for expansion animation to start/complete before scrolling for better accuracy
            setTimeout(() => {
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        };

        const handleHashChange = () => {
            if (window.location.hash === '#events') {
                handleOpenEvents();
            }
        };

        window.addEventListener('open-events', handleOpenEvents);
        window.addEventListener('hashchange', handleHashChange);

        // Initial check
        if (window.location.hash === '#events') {
            setIsOpen(true);
        }

        return () => {
            window.removeEventListener('open-events', handleOpenEvents);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    return (
        <section className="relative py-12 px-4 shadow-inner">
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
                            <div className="pt-4 pb-8">
                                {/* Technical Events Column */}
                                <div>

                                    <div className="flex flex-wrap justify-center gap-5">
                                        {technicalEvents.map((event, i) => (
                                            <div key={`tech-${i}`} className="w-full md:w-[calc(50%-10px)] lg:w-[calc(33.33%-14px)]">
                                                <EventCard event={event} index={i} />
                                            </div>
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
