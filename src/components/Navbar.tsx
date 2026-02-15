import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import RegistrationDialog from "./RegistrationDialog";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Team", href: "#team" },
  { label: "College Bus Routes", href: "#bus-routes" },
  { label: "FAQs", href: "#faqs" },
];

import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/10 bg-background/60 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <a href="#" className="font-display text-xl font-bold text-primary text-glow-cyan transition-all duration-300 hover:scale-105">
          TECHBETA 2K26
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-foreground/70 transition-colors hover:text-primary tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle />
          <RegistrationDialog>
            <Button size="sm" className="font-display text-xs font-semibold tracking-wider box-glow-cyan">
              Register Now
            </Button>
          </RegistrationDialog>
        </div>

        {/* Mobile toggle */}
        <button className="text-foreground md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-bold text-foreground/70 transition-colors hover:text-primary tracking-wide"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground/70">Theme</span>
                <ThemeToggle />
              </div>
              <RegistrationDialog>
                <Button size="sm" className="font-display text-xs font-semibold tracking-wider box-glow-cyan w-full">
                  Register Now
                </Button>
              </RegistrationDialog>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
