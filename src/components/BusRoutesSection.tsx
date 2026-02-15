import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  { bus: "Nagercoil", number: "Bus No. 1", time: "8:20 AM" },
  { bus: "Kanyakumari", number: "Bus No. 5", time: "7:45 AM" },
  { bus: "Marthandam", number: "Bus No. 8", time: "8:00 AM" },
  { bus: "Kulasekharam", number: "Bus No. 12", time: "7:40 AM" },
  { bus: "Mondaymarket", number: "Bus No. 15", time: "8:10 AM" },
];

const BusRoutesSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleRoute = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="bus-routes" className="relative py-12 px-4 overflow-hidden">
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
              <div className="flex flex-wrap justify-center items-center gap-3 mb-4 text-center">
                <Bus className="text-secondary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl px-2">
                  College Bus
                </h2>
                {isOpen ? <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />}
              </div>
              <div className="mx-auto h-1 w-20 rounded-full bg-secondary/30 group-hover:bg-secondary/60 transition-colors" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                {isOpen ? "Click to Close" : "Click to View College Bus"}
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
              <div className="mt-12 space-y-4 pb-8">
                {routes.map((route, i) => {
                  const isRouteOpen = openIndex === i;
                  return (
                    <motion.div
                      key={route.bus}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                      <button
                        onClick={() => toggleRoute(i)}
                        className={`group w-full glass-card relative overflow-hidden flex items-center justify-between rounded-2xl border p-6 text-left transition-all duration-300 ${isRouteOpen ? "border-primary/50 bg-primary/5 shadow-sm" : "border-black/5 hover:border-primary/30"
                          }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 ${isRouteOpen ? "bg-primary text-background rotate-12" : "bg-primary/10 text-primary"
                            }`}>
                            <Bus className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className={`font-display text-lg font-bold transition-colors ${isRouteOpen ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                              {route.bus}
                            </h3>
                          </div>
                        </div>

                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-500 ${isRouteOpen ? "rotate-180 text-primary" : "group-hover:text-primary"
                          }`} />
                      </button>

                      <AnimatePresence>
                        {isRouteOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2"
                          >
                            <div className="p-6 glass-card rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                                    <span className="text-[10px] font-black text-primary">#</span>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">Bus Number</p>
                                    <p className="text-sm font-black text-foreground">{route.number}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                                    <Clock className="h-4 w-4 text-secondary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">Departure</p>
                                    <p className="text-sm font-black text-secondary">{route.time}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default BusRoutesSection;

