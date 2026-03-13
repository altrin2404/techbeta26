import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const team = [
  { name: "Dr. Suja A. Alex", role: "Convener (Associate Professor & Hod/IT)", img: "👩‍🏫" },
  { name: "Dr. G Geo Jenefer", role: "Staff Coordinator (AP/IT)", img: "👩‍🏫" },
  { name: "Mr. Tony Mathew R", role: "Secretary (Final Year/IT)", img: "👨‍🎓" },
  { name: "Ms. Sheno Mcjus J", role: "Treasurer (Final Year/IT)", img: "👩‍🎓" },
];

const TeamSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
        document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    const handleHashChange = () => {
      if (window.location.hash === '#team') {
        handleOpen();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('open-team', handleOpen);

    if (window.location.hash === '#team') {
      handleOpen();
    }
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('open-team', handleOpen);
    };
  }, []);

  return (
    <section id="team" className="relative py-12 px-4">
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
                <Users className="text-secondary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl px-2">
                  Our Team
                </h2>
                {isOpen ? <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />}
              </div>
              <div className="mx-auto h-1 w-20 rounded-full bg-secondary/30 group-hover:bg-secondary/60 transition-colors" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                {isOpen ? "Click to Close" : "Click to View Team"}
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
              <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto pb-8">
                {team.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ willChange: "transform, opacity" }}
                    className="group glass-card relative overflow-hidden flex flex-col items-center rounded-2xl border border-black/5 p-8 text-center transition-all duration-500 hover:border-secondary/40 hover:box-glow-purple cursor-pointer"
                  >
                    <div className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-secondary via-transparent to-primary blur-2xl" />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10 text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-[0_0_30px_rgba(147,51,234,0.1)] group-hover:shadow-[0_0_40px_rgba(147,51,234,0.2)]">
                        {member.img}
                      </div>
                      <h3 className="mt-6 font-display text-xl font-bold text-foreground group-hover:text-secondary transition-colors">{member.name}</h3>
                      <p className="mt-1 text-sm font-black tracking-wider text-secondary uppercase">{member.role}</p>
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

export default TeamSection;
