import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const SponsorsContactSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="contact" className="relative py-12 px-4">
      <div className="container mx-auto max-w-5xl">
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
                <Mail className="text-primary h-6 w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl px-2">
                  Contact Us
                </h2>
                {isOpen ? <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce flex-shrink-0" />}
              </div>
              <div className="mx-auto h-1 w-20 rounded-full bg-primary/30 group-hover:bg-primary/60 transition-colors" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
                {isOpen ? "Click to Close" : "Click to Get in Touch"}
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
              <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 pb-8">
                {[
                  { Icon: Mail, text: "techbeta2k26@gmail.com", label: "Email", href: "https://mail.google.com/mail/?view=cm&fs=1&to=techbeta2k26@gmail.com" },
                  { Icon: Phone, text: "78269 27307\n94879 64783\n93856 75451", label: "Phone", href: "" },
                  { Icon: MapPin, text: "SXCCE, Nagercoil", label: "Location", href: "https://maps.app.goo.gl/fo93cH9bMfrrz1WL7" }
                ].map((contact, i) => {
                  const Tag = contact.href ? motion.a : motion.div;
                  return (
                  <Tag
                    key={i}
                    {...(contact.href ? {
                      href: contact.href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    } : {})}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group glass-card relative overflow-hidden flex flex-col items-center gap-4 rounded-2xl border border-black/5 p-8 text-center transition-all duration-300 hover:border-primary/30 shadow-sm ${contact.href ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-primary/10 blur-2xl" />
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <contact.Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">{contact.label}</p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors whitespace-pre-line">{contact.text}</p>
                    </div>
                  </Tag>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SponsorsContactSection;
