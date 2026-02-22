import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    const handleHashChange = () => {
      if (window.location.hash === '#about') {
        handleOpen();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('open-about', handleOpen);

    if (window.location.hash === '#about') {
      handleOpen();
    }
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('open-about', handleOpen);
    };
  }, []);

  return (
    <section id="about" className="relative py-12 px-4 shadow-sm">
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
                <Info className="text-primary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl px-2">
                  About Us
                </h2>
                {isOpen ? <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />}
              </div>
              <div className="mx-auto h-1 w-20 rounded-full bg-primary/30 group-hover:bg-primary/60 transition-colors" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                {isOpen ? "Click to Close" : "Click to Explore More"}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 group glass-card relative overflow-hidden rounded-2xl border border-black/5 p-6 sm:p-10 box-glow-cyan cursor-default transition-all duration-300"
              >
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-[60px] transition-all duration-700 group-hover:bg-primary/20" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/10 blur-[60px] transition-all duration-700 group-hover:bg-secondary/20" />

                <div className="relative z-10 text-base leading-relaxed text-foreground/80 font-medium sm:text-lg min-h-[10rem]">
                  {/* Content to be added later */}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AboutSection;
