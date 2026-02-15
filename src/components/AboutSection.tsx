import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutSection = () => {
  const [isOpen, setIsOpen] = useState(false);

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
                  About TECHBETA 2K26
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

                <p className="relative z-10 text-base leading-relaxed text-foreground/80 font-medium sm:text-lg">
                  <span className="font-bold text-foreground">TECHBETA 2K26</span> is a national-level technical symposium organized by the <span className="font-bold text-primary">Department of Information Technology</span> at St Xaviers Catholic College of Engineering (Autonomous), Nagercoil. This premier event brings together students, innovators, and tech enthusiasts from across the country to compete, collaborate, and celebrate technology.
                </p>
                <p className="relative z-10 mt-6 text-base leading-relaxed text-foreground/80 font-medium sm:text-lg">
                  Offering a platform to showcase your skills through <span className="font-bold text-primary">Ideathon</span>, <span className="font-bold text-primary">Web/Logo Designing</span>, <span className="font-bold text-primary">Debugging</span>, and <span className="font-bold text-primary">Tech Quiz</span>. TECHBETA 2K26 is where you learn from industry experts and network with like-minded individuals. Join us for an unforgettable day of innovation and inspiration!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AboutSection;
