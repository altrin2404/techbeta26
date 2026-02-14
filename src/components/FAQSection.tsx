import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who can participate in TECHBETA26?",
    a: "TECHBETA26 is open to all college students across the country. Both undergraduate and postgraduate students can participate.",
  },
  {
    q: "Is there a registration fee?",
    a: "Registration details and fees will be shared via the registration link. Some events may be free while others have a nominal fee.",
  },
  {
    q: "Can I participate in multiple events?",
    a: "Yes! You can register for multiple events as long as the timings don't overlap. Check the schedule for details.",
  },
  {
    q: "Will certificates be provided?",
    a: "Yes, all participants will receive participation certificates. Winners will receive merit certificates along with prizes.",
  },
  {
    q: "Is accommodation available?",
    a: "Limited accommodation can be arranged for outstation participants. Contact the organizing committee for details.",
  },
  {
    q: "What should I bring to the event?",
    a: "Bring your college ID, registration confirmation, and any equipment specified for your registered events (e.g., laptops for hackathon).",
  },
];

const FAQSection = () => {
  return (
    <section id="faqs" className="relative py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-primary text-glow-cyan sm:text-4xl">
            FAQs
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/50" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card/50 px-5 backdrop-blur-sm transition-all duration-300 data-[state=open]:border-glow-cyan data-[state=open]:box-glow-cyan"
              >
                <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:no-underline hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
