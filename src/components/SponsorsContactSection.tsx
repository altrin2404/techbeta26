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
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-primary h-6 w-6 group-hover:scale-110 transition-transform" />
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  Contact Us
                </h2>
                {isOpen ? <ChevronUp className="text-primary h-6 w-6" /> : <ChevronDown className="text-primary h-6 w-6 animate-bounce" />}
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
              <div className="mt-12 grid gap-6 sm:grid-cols-3 pb-8">
                {[
                  { Icon: Mail, text: "techbeta26@gmail.com", label: "Email", href: "https://mail.google.com/mail/?view=cm&fs=1&to=techbeta26@gmail.com" },
                  { Icon: Phone, text: "+91 98765 43210", label: "Phone", href: "tel:+919876543210" },
                  { Icon: MapPin, text: "SXCCE, Nagercoil", label: "Location", href: "https://maps.app.goo.gl/fo93cH9bMfrrz1WL7" }
                ].map((contact, i) => (
                  <motion.a
                    key={i}
                    href={contact.href}
                    target={contact.href.startsWith('tel') ? undefined : "_blank"}
                    rel={contact.href.startsWith('http') ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group glass-card relative overflow-hidden flex flex-col items-center gap-4 rounded-2xl border border-black/5 p-8 text-center transition-all duration-300 hover:border-primary/30 shadow-sm cursor-pointer"
                  >
                    <div className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-primary/10 blur-2xl" />
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <contact.Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">{contact.label}</p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{contact.text}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SponsorsContactSection;
