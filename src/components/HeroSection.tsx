import { Suspense, lazy, useEffect, useState } from "react";
const RegistrationDialog = lazy(() => import("./RegistrationDialog"));
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section id="hero" className="relative flex min-h-[70vh] md:min-h-screen items-start md:items-center justify-center overflow-hidden px-4 pt-24 md:pt-32 pb-12 md:pb-0">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(190_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(190_100%_50%/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="relative z-10 text-center w-full">
        <div
          className="mb-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 px-4 hero-fade-in"
        >
          {/* Logos Group */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full max-w-6xl">
            <div className="flex flex-col items-center transition-all duration-300">
              <img 
                src="/College-logo.png" 
                alt="ST XAVIER'S CATHOLIC COLLEGE OF ENGINEERING" 
                className="h-24 md:h-32 lg:h-44 w-auto object-contain drop-shadow-sm"
              />
            </div>

            <div
              className={`relative group cursor-pointer ${isMobile ? '' : 'hero-float'}`}
            >
              <img
                src="/brigitz-logo.png"
                alt="BRIGITZ Logo"
                width={150}
                height={150}
                className="max-h-[100px] sm:max-h-[140px] md:max-h-[180px] w-auto object-contain drop-shadow-xl transition-all duration-500"
                loading="eager"
                decoding="async"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>

        {/* Global Centered Department Name */}
        <div className="mb-8 flex flex-col items-center gap-4 w-full hero-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center gap-2 sm:gap-6 w-full max-w-6xl px-4">
            <div className="hidden sm:block h-[2px] flex-1 bg-gradient-to-r from-transparent to-secondary/40" />
            <span className="font-display text-[12px] sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight sm:tracking-[0.12em] text-secondary uppercase drop-shadow-lg text-center leading-tight whitespace-nowrap">
              Department of Information Technology
            </span>
            <div className="hidden sm:block h-[2px] flex-1 bg-gradient-to-l from-transparent to-secondary/40" />
          </div>
        </div>

        <p
          className="mb-2 font-display text-[9px] sm:text-xs tracking-[0.4em] text-muted-foreground uppercase font-bold hero-fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          Proudly Organises
        </p>
        <p
          className="mb-4 font-display text-[11px] sm:text-sm tracking-[0.15em] sm:tracking-[0.3em] text-muted-foreground uppercase font-bold hero-fade-in px-4"
          style={{ animationDelay: '0.2s' }}
        >
          A National Level Technical Symposium
        </p>

        <h1
          className="font-display text-[28px] font-black tracking-tight sm:tracking-wider text-foreground sm:text-6xl md:text-8xl lg:text-9xl hero-fade-in hero-scale-in px-4"
          style={{ animationDelay: '0.4s' }}
        >
          TECHBETA'<span className="text-primary text-glow-cyan">2K26</span>
        </h1>



        <div
          className="mt-4 flex flex-col items-center gap-2 text-sm text-foreground hero-fade-in"
          style={{ animationDelay: '0.9s' }}
        >
          <p className="font-display text-[9px] sm:text-xs tracking-widest text-secondary font-bold">
            📅 April 10, 2026 &nbsp;|&nbsp; 📍 SXCCE, Nagercoil, 9:00 AM
          </p>
        </div>

        <div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center hero-fade-in pb-8 md:pb-0"
          style={{ animationDelay: '1.1s' }}
        >
          <Suspense fallback={<Button size="lg" disabled className="px-8 bg-primary/20"><Loader2 className="animate-spin h-5 w-5" /></Button>}>
            <RegistrationDialog>
              <Button size="lg" className="font-display text-sm font-bold tracking-wider box-glow-cyan px-8 cursor-pointer min-h-[48px] active:scale-95 transition-transform">
                Register Now
              </Button>
            </RegistrationDialog>
          </Suspense>
          <Button variant="outline" size="lg" className="font-display text-sm tracking-wider border-glow-cyan min-h-[48px] active:scale-95 transition-transform"
            onClick={() => {
              window.location.hash = 'events';
              window.dispatchEvent(new Event('open-events'));
            }}
          >
            Explore Events
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 hero-scroll-bounce cursor-pointer group z-30 items-center justify-center p-4"
        onClick={() => {
          const eventsSection = document.getElementById('events');
          if (eventsSection) {
            eventsSection.scrollIntoView({ behavior: 'smooth' });
            window.dispatchEvent(new Event('open-events'));
          }
        }}
      >
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary/30 bg-primary/5 backdrop-blur-sm group-hover:border-primary group-hover:bg-primary/20 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
          <ChevronDown className="relative z-10 h-8 w-8 text-primary transition-transform duration-300 group-hover:translate-y-1" />
        </div>
      </div>

      {/* CSS animations replacing framer-motion */}
      <style>{`
        .hero-fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: heroFadeIn 0.8s ease-out forwards;
        }
        .hero-scale-in {
          animation: heroScaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .hero-float {
          animation: heroFloat 4s ease-in-out infinite;
        }
        .hero-scroll-bounce {
          animation: heroScrollBounce 2s ease-in-out infinite;
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes heroScrollBounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(10px) translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

