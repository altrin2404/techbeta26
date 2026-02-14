import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Youtube, Globe } from "lucide-react";

const sponsors = ["TechCorp", "InnovateLabs", "CodeNexus", "FutureTech", "DataDrive"];

const SponsorsContactSection = () => {
  return (
    <section id="sponsors" className="relative py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Sponsors */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-secondary text-glow-purple sm:text-4xl">
            Our Sponsors
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-secondary/50" />
        </motion.div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {sponsors.map((sponsor, i) => (
            <motion.div
              key={sponsor}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex h-20 w-40 items-center justify-center rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-glow-purple hover:box-glow-purple"
            >
              <span className="font-display text-sm font-bold text-muted-foreground">{sponsor}</span>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-primary text-glow-cyan sm:text-4xl">
            Contact Us
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/50" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid gap-6 sm:grid-cols-3"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm">
            <Mail className="h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">techbeta26@college.edu</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm">
            <Phone className="h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">+91 98765 43210</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm">
            <MapPin className="h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">Your College, City - 600001</p>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <a href="#" className="text-muted-foreground transition-colors hover:text-primary"><Instagram size={22} /></a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-primary"><Youtube size={22} /></a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-primary"><Globe size={22} /></a>
        </div>
      </div>
    </section>
  );
};

export default SponsorsContactSection;
