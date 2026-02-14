import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import TeamSection from "@/components/TeamSection";
import BusRoutesSection from "@/components/BusRoutesSection";
import SponsorsContactSection from "@/components/SponsorsContactSection";
import FAQSection from "@/components/FAQSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <EventsSection />
        <TeamSection />
        <BusRoutesSection />
        <SponsorsContactSection />
        <FAQSection />
      </main>
      <footer className="border-t border-border py-8 text-center">
        <p className="font-display text-xs tracking-widest text-muted-foreground">
          © 2026 TECHBETA26 — All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default Index;
