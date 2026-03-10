import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "Who can participate in TECHBETA'2K26?",
    a: "TECHBETA'2K26 is open to all college students across the country. Both undergraduate and postgraduate students can participate.",
  },
  {
    q: "Is there a registration fee?",
    a: "The registration fee is ₹200 per participant, which includes lunch. This is available through online registration only.",
  },
  {
    q: "Is lunch provided during the event?",
    a: "Yes! Lunch is included in the ₹200 registration fee for all registered participants. It will be served at the college food court during the scheduled break.",
  },
  {
    q: "How do I register for the event?",
    a: "Please register using the official registration link provided on the website. Online registration is the only valid method for participation.",
  },
  {
    q: "What should I bring to the event?",
    a: "Please bring your college ID card, your registration confirmation, and any specific equipment required for your events (e.g., laptops for coding/technical competitions).",
  },
  {
    q: "Will certificates be provided?",
    a: "Yes, all participants will receive participation certificates. Winners will receive merit certificates along with prizes.",
  },
];

const FAQSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
        document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    const handleHashChange = () => {
      if (window.location.hash === '#faqs') {
        handleOpen();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('open-faqs', handleOpen);

    if (window.location.hash === '#faqs') {
      handleOpen();
    }
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('open-faqs', handleOpen);
    };
  }, []);

  return (
    <section id="faqs" className="relative py-12 px-4">
      <div className="container mx-auto max-w-3xl">
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
                <HelpCircle className="text-primary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl px-2">
                  FAQs
                </h2>
                {isOpen ? <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />}
              </div>
              <div className="mx-auto h-1 w-20 rounded-full bg-primary/30 group-hover:bg-primary/60 transition-colors" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                {isOpen ? "Click to Close" : "Click to View FAQs"}
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
              <div className="mt-12 pb-8">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      asChild
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.99 }}
                        className="group glass-card border border-black/5 rounded-2xl overflow-hidden px-5 transition-all duration-300 data-[state=open]:border-primary/40 data-[state=open]:box-glow-cyan cursor-pointer"
                      >
                        <AccordionTrigger className="font-display text-sm font-bold text-foreground py-6 hover:no-underline hover:text-primary transition-colors text-left uppercase tracking-wider">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 text-sm leading-relaxed text-foreground/70 font-medium">
                          <div className="pt-2 border-t border-black/5">
                            {faq.a}
                          </div>
                        </AccordionContent>
                      </motion.div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FAQSection;
