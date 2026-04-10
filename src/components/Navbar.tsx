import { useState, Suspense, lazy } from "react";
import { Menu, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const RegistrationDialog = lazy(() => import("./RegistrationDialog"));

const navLinks = [
  { label: "Events", href: "#events" },
  { label: "Team", href: "#team" },
  { label: "College Bus Routes", href: "#bus-routes" },
  { label: "FAQs", href: "#faqs" },
];



const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const sectionId = href.replace('#', '');
    if (sectionId) {
      window.dispatchEvent(new Event(`open-${sectionId}`));
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl shadow-lg transition-all duration-300" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="container relative z-10 mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center h-11">
          <a href="#" className="font-display text-xl font-bold text-white text-glow-cyan transition-all duration-300 hover:scale-105 flex items-center gap-2 leading-none" style={{ willChange: "transform" }}>
            <span>TECHBETA</span>
            <span className="text-primary"> 2026</span>
          </a>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-8 h-11">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="text-sm font-bold text-white/70 transition-colors hover:text-primary tracking-wide whitespace-nowrap leading-none h-full flex items-center"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Button
            disabled
            className="font-display text-sm font-bold tracking-wider box-glow-cyan bg-slate-700 text-white/50 border-none h-11 px-8 rounded-xl cursor-not-allowed opacity-70"
            style={{ swallowClicks: true }}
          >
            Event Completed
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="text-white md:hidden flex items-center justify-center h-11 w-11 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu — CSS transition instead of framer-motion */}
      <div
        className="overflow-hidden border-t border-white/5 bg-[#0f172a]/95 backdrop-blur-xl md:hidden"
        style={{
          maxHeight: isOpen ? '400px' : '0px',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
          borderTopWidth: isOpen ? undefined : 0,
        }}
      >
        <div className="flex flex-col gap-1 p-4 safe-bottom">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-sm font-bold text-white/70 transition-colors hover:text-primary tracking-wide min-h-[44px] flex items-center px-2 rounded-lg hover:bg-white/5 active:bg-white/10"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Button size="lg" disabled className="font-display text-sm font-bold tracking-wider box-glow-cyan px-8 cursor-not-allowed bg-slate-700 text-white/50 border-none min-h-[48px] opacity-70">
              Event Completed
            </Button>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <RegistrationDialog open={isRegOpen} onOpenChange={setIsRegOpen} />
      </Suspense>
    </nav>
  );
};

export default Navbar;
