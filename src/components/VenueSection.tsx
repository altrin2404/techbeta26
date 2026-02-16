import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const VenueSection = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section id="venue" className="relative py-12 px-4 shadow-sm">
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
                            <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
                                <MapPin className="text-primary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl px-2">
                                    Event Venue
                                </h2>
                                {isOpen ? <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />}
                            </div>
                            <div className="mx-auto h-1 w-20 rounded-full bg-primary/30 group-hover:bg-primary/60 transition-colors" />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                                {isOpen ? "Click to Close" : "Click to View Venue"}
                            </p>
                        </motion.div>
                    </Button>
                </div>

                {/* Always-mounted content container for instant map load */}
                <motion.div
                    initial={false}
                    animate={{
                        height: isOpen ? "auto" : 0,
                        opacity: isOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pb-8 mt-12">
                        {/* Map Card */}
                        <div
                            className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 p-2 shadow-lg h-[280px] sm:h-[350px] lg:h-[400px]"
                        >
                            <iframe
                                src="https://maps.google.com/maps?q=8.197754,77.382992&z=17&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="eager" // Changed to eager for background loading
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-2xl grayscale dark:invert dark:opacity-80 transition-all duration-500 hover:grayscale-0 dark:hover:invert-0 dark:hover:opacity-100"
                            ></iframe>
                        </div>

                        {/* Location Details Card */}
                        <div className="space-y-4">
                            <div
                                className="p-8 glass-card rounded-3xl border border-black/5 dark:border-white/10 bg-primary/5"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Info size={24} className="text-primary" />
                                    <h3 className="font-bold text-xl">Location Details</h3>
                                </div>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    <span className="font-bold text-foreground">St. Xavier's Catholic College of Engineering</span><br />
                                    Chunkankadai, Nagercoil, Tamil Nadu 629003.<br />
                                    <br />
                                    @ <span className="text-primary font-bold">Rock Auditorium</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default VenueSection;
