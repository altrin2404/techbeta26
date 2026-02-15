import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Cpu, FileText, Gamepad2, Lightbulb, Presentation, Info, CheckCircle2, ChevronDown, ChevronUp, Lightbulb as EventIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const events = [
  {
    icon: Lightbulb,
    name: "Ideathon",
    description: "Brainstorm and pitch your innovative ideas to solve real-world problems.",
    shortRules: "Team of 2-4 | Theme-based pitching",
    detailedRules: [
      "Themes: Sustainable Energy, Healthcare Tech, AI for Social Good.",
      "A conceptual model or PPT must be presented.",
      "Selection based on Innovation, Feasibility, and Presentation.",
      "Team size: Minimum 2, Maximum 4 members."
    ]
  },

  {
    icon: Code,
    name: "Web/Logo Designing",
    description: "Showcase your creativity by designing stunning websites or logos.",
    shortRules: "Individual | Theme provided on spot",
    detailedRules: [
      "Tools: Photoshop, Figma, or VS Code (HTML/CSS).",
      "Topic will be shared at the start of the event.",
      "Time Limit: 90 minutes.",
      "Judging criteria: Creativity, UI/UX, and Design Logic."
    ]
  },
  {
    icon: Cpu,
    name: "Debugging",
    description: "Find and fix bugs in the given code snippets.",
    shortRules: "Individual | Languages: C, C++, Java, Python",
    detailedRules: [
      "Round 1: MCQ on Syntax and Output.",
      "Round 2: Hands-on debugging of broken code snippets.",
      "Languages allowed: C, C++, Java, and Python.",
      "Fastest correct solvers will be ranked higher."
    ]
  },
  {
    icon: Gamepad2,
    name: "Tech Quiz",
    description: "Test your technical knowledge in this exciting quiz competition.",
    shortRules: "Team of 2 | 3 Rounds",
    detailedRules: [
      "Round 1: Written Preliminary Quiz.",
      "Round 2: Rapid Fire Tech Round.",
      "Round 3: Grand Finale on Stage.",
      "Topics: CS Fundamentals, Latest Tech Trends, and Gadgets."
    ]
  },
];

const EventsSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="events" className="relative py-12 px-4 shadow-inner">
      <div className="container mx-auto max-w-6xl">
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
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="text-secondary h-6 w-6 group-hover:scale-110 transition-transform" />
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  Technical Events
                </h2>
                {isOpen ? <ChevronUp className="text-primary h-6 w-6" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce" />}
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
              <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 pb-8">
                {events.map((event, i) => (
                  <motion.div
                    key={event.name}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
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
                          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">{event.name}</h3>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full">
                              <Info size={18} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-white border-black/5 rounded-3xl p-0 overflow-hidden">
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
                      </div>

                      <p className="text-sm leading-relaxed text-foreground/70 font-medium line-clamp-2">{event.description}</p>

                      <div className="mt-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-black uppercase text-primary shrink-0">Details :</span>
                        <p className="text-[10px] text-foreground/80 font-bold truncate">
                          {event.shortRules}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EventsSection;
