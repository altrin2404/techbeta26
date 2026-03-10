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
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-32">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(190_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(190_100%_50%/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="relative z-10 text-center">
        <div
          className="mb-4 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 px-2 sm:px-4 hero-fade-in"
        >
          <div
            className="flex flex-col items-center md:items-start text-center md:text-left cursor-default transition-all duration-300 max-w-full"
          >
            <span className="font-display text-xs sm:text-base font-black tracking-[0.05em] sm:tracking-[0.1em] text-primary md:text-xl lg:text-3xl drop-shadow-sm break-words overflow-wrap-anywhere leading-tight">
              ST XAVIER'S CATHOLIC COLLEGE OF ENGINEERING
            </span>
            <div className="mt-4 flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-4">
                <span className="font-display text-xs font-extrabold tracking-[0.05em] sm:tracking-[0.1em] text-secondary uppercase sm:text-base lg:text-xl">
                  Department of Information Technology
                </span>
                <div className="hidden md:block h-[2px] w-16 bg-gradient-to-r from-secondary/50 to-transparent" />
              </div>
            </div>
          </div>

          <div
            className={`relative group cursor-pointer ${isMobile ? '' : 'hero-float'}`}
          >
            <img
              src="/brigitz-logo.png"
              alt="BRIGITZ Logo"
              width={150}
              height={150}
              className="max-h-[80px] sm:max-h-[120px] md:max-h-[150px] w-auto object-contain drop-shadow-xl transition-all duration-500"
              loading="eager"
              decoding="async"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        <p
          className="-mt-2 mb-2 font-display text-[9px] sm:text-xs tracking-[0.4em] text-muted-foreground uppercase font-bold hero-fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          Proudly Organises
        </p>
        <p
          className="mb-4 font-display text-sm tracking-[0.3em] text-muted-foreground uppercase font-bold hero-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          A National Level Technical Symposium
        </p>

        <h1
          className="font-display text-4xl font-black tracking-wide sm:tracking-wider text-foreground sm:text-6xl md:text-8xl lg:text-9xl hero-fade-in hero-scale-in"
          style={{ animationDelay: '0.4s' }}
        >
          TECHBETA'<span className="text-primary text-glow-cyan">2K26</span>
        </h1>



        <div
          className="mt-4 flex flex-col items-center gap-2 text-sm text-foreground hero-fade-in"
          style={{ animationDelay: '0.9s' }}
        >
          <p className="font-display text-xs tracking-widest text-secondary font-bold">
            📅 March 27, 2026 &nbsp;|&nbsp; 📍 SXCCE, Nagercoil, 9:00 AM
          </p>
        </div>

        <div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center hero-fade-in"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-scroll-bounce"
      >
        <ChevronDown className="h-6 w-6 text-primary/50" />
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

