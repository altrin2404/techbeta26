import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(190_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(190_100%_50%/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 font-display text-sm tracking-[0.3em] text-muted-foreground uppercase"
        >
          A National Level Technical Symposium
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="font-display text-5xl font-black tracking-wider text-primary text-glow-cyan sm:text-7xl md:text-8xl lg:text-9xl"
        >
          TECHBETA26
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          Igniting Innovation, Empowering Tomorrow
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground"
        >
          <p className="font-display text-xs tracking-widest text-secondary text-glow-purple">
            📅 March 15, 2026 &nbsp;|&nbsp; 📍 Your College Auditorium
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button asChild size="lg" className="font-display text-sm font-bold tracking-wider box-glow-cyan px-8">
            <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer">
              Register Now
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-display text-sm tracking-wider border-glow-cyan">
            <a href="#events">Explore Events</a>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="h-6 w-6 text-primary/50" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
