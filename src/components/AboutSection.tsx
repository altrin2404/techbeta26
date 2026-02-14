import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="relative py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-primary text-glow-cyan sm:text-4xl">
            About TECHBETA26
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/50" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 rounded-xl border border-border bg-card/50 p-8 backdrop-blur-sm box-glow-cyan"
        >
          <p className="text-lg leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">TECHBETA26</span> is a national-level technical symposium organized by the Department of Computer Science & Engineering. This premier event brings together students, innovators, and tech enthusiasts from across the country to compete, collaborate, and celebrate technology.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            From coding competitions and hackathons to paper presentations and tech talks, TECHBETA26 offers a platform to showcase your skills, learn from industry experts, and network with like-minded individuals. Join us for an unforgettable day of innovation and inspiration!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
