import { useState, Suspense, lazy } from "react";
import { Menu, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const RegistrationDialog = lazy(() => import("./RegistrationDialog"));

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Team", href: "#team" },
  { label: "College Bus Routes", href: "#bus-routes" },
  { label: "FAQs", href: "#faqs" },
];



const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl shadow-lg transition-all duration-300" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="container relative z-10 mx-auto flex h-20 items-center justify-between px-4">
        <a href="#" className="font-display text-xl font-bold text-white text-glow-cyan transition-all duration-300 hover:scale-105">
          TECHBETA <span className="text-primary">2K26</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-white/70 transition-colors hover:text-primary tracking-wide"
            >
              {link.label}
            </a>
          ))}

          <Suspense fallback={<Button size="sm" disabled className="bg-primary/20"><Loader2 className="h-4 w-4 animate-spin" /></Button>}>
            <RegistrationDialog>
              <Button size="sm" className="font-display text-xs font-semibold tracking-wider box-glow-cyan bg-primary hover:bg-primary/90 text-white border-none">
                Register Now
              </Button>
            </RegistrationDialog>
          </Suspense>
        </div>

        {/* Mobile toggle */}
        <button className="text-white md:hidden flex items-center justify-center h-11 w-11 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
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
            className="overflow-hidden border-t border-white/5 bg-[#0f172a]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 p-4 safe-bottom">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-bold text-white/70 transition-colors hover:text-primary tracking-wide min-h-[44px] flex items-center px-2 rounded-lg hover:bg-white/5 active:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <Suspense fallback={<Button size="sm" disabled className="w-full bg-primary/20"><Loader2 className="h-4 w-4 animate-spin" /></Button>}>
                  <RegistrationDialog>
                    <Button size="sm" className="font-display text-xs font-semibold tracking-wider box-glow-cyan w-full bg-primary hover:bg-primary/90 text-white border-none">
                      Register Now
                    </Button>
                  </RegistrationDialog>
                </Suspense>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
