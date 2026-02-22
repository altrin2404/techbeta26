import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const VenueSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

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
                            className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 p-2 shadow-lg h-[280px] sm:h-[350px] lg:h-[400px] relative group"
                        >
                            <div className="w-full h-full relative bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden">
                                {/* Static Map/Loading Background */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-30 grayscale saturate-0"
                                    style={{ backgroundImage: 'url("https://maps.googleapis.com/maps/api/staticmap?center=8.197754,77.382992&zoom=15&size=600x400&scale=2&key=YOUR_API_KEY_HERE")' }} // Fallback if no key
                                />

                                {!isMapLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/40 backdrop-blur-[2px]">
                                        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Initializing Map...</p>
                                    </div>
                                )}

                                <iframe
                                    src="https://maps.google.com/maps?q=8.197754,77.382992&z=17&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    onLoad={() => setIsMapLoaded(true)}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className={`relative z-10 rounded-xl transition-all duration-1000 ease-out ${isMapLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                                        }`}
                                ></iframe>
                            </div>
                        </div>

                        {/* Location Details Card */}
                        <div className="space-y-4">
                            <div
                                className="p-8 glass-card rounded-3xl border border-black/5 dark:border-white/10 bg-primary/5 hover:bg-primary/10 transition-colors duration-500"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                        <MapPin size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl leading-tight">Location Details</h3>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Nagercoil, Tamil Nadu</p>
                                    </div>
                                </div>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    <span className="font-bold text-foreground">St. Xavier's Catholic College of Engineering</span><br />
                                    Chunkankadai, Nagercoil, Tamil Nadu 629003.<br />
                                    <br />
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-bold">
                                        <Info size={14} />
                                        Rock Auditorium
                                    </span>
                                </p>

                                <div className="mt-8">
                                    <Button
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold tracking-widest uppercase text-xs rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-[0.98]"
                                        onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=8.197754,77.382992', '_blank')}
                                    >
                                        Get Directions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default VenueSection;
