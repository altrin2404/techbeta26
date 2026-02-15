import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import ScheduleSection from "@/components/ScheduleSection";
import TeamSection from "@/components/TeamSection";
import BusRoutesSection from "@/components/BusRoutesSection";
import SponsorsContactSection from "@/components/SponsorsContactSection";
import FAQSection from "@/components/FAQSection";
import VenueSection from "@/components/VenueSection";
import CountdownSection from "@/components/CountdownSection";
import DynamicBackground from "@/components/DynamicBackground";
import Footer from "@/components/Footer";

const SectionDivider = () => (
  <div className="container mx-auto max-w-4xl px-4">
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-primary/40 blur-[2px]" />
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent relative">
      <DynamicBackground />
      <Navbar />
      <main>
        <HeroSection />
        <CountdownSection />
        <SectionDivider />
        <AboutSection />
        <SectionDivider />
        <EventsSection />
        <SectionDivider />
        <ScheduleSection />
        <SectionDivider />
        <TeamSection />
        <SectionDivider />
        <BusRoutesSection />
        <SectionDivider />
        <SponsorsContactSection />
        <SectionDivider />
        <VenueSection />
        <SectionDivider />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
