import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const CountdownSection = lazy(() => import("@/components/CountdownSection"));
const EventsSection = lazy(() => import("@/components/EventsSection"));
const ScheduleSection = lazy(() => import("@/components/ScheduleSection"));
const TeamSection = lazy(() => import("@/components/TeamSection"));
const BusRoutesSection = lazy(() => import("@/components/BusRoutesSection"));
const SponsorsContactSection = lazy(() => import("@/components/SponsorsContactSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const VenueSection = lazy(() => import("@/components/VenueSection"));
const DynamicBackground = lazy(() => import("@/components/DynamicBackground"));
const Footer = lazy(() => import("@/components/Footer"));

const SectionLoader = () => (
  <div className="py-20 flex justify-center items-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
  </div>
);

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
      <Suspense fallback={null}>
        <DynamicBackground />
      </Suspense>
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionLoader />}>
          <CountdownSection />
        </Suspense>
        <SectionDivider />
        <div id="events">
          <Suspense fallback={<SectionLoader />}>
            <EventsSection />
          </Suspense>
        </div>
        <SectionDivider />
        <Suspense fallback={<SectionLoader />}>
          <ScheduleSection />
        </Suspense>
        <SectionDivider />
        <Suspense fallback={<SectionLoader />}>
          <TeamSection />
        </Suspense>
        <SectionDivider />
        <Suspense fallback={<SectionLoader />}>
          <BusRoutesSection />
        </Suspense>
        <SectionDivider />
        <Suspense fallback={<SectionLoader />}>
          <SponsorsContactSection />
        </Suspense>
        <SectionDivider />
        <Suspense fallback={<SectionLoader />}>
          <VenueSection />
        </Suspense>
        <SectionDivider />
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
