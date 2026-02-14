import { motion } from "framer-motion";
import { Code, Cpu, FileText, Gamepad2, Lightbulb, Presentation } from "lucide-react";

const events = [
  {
    icon: Code,
    name: "Code Sprint",
    time: "9:00 AM - 11:00 AM",
    description: "A competitive coding challenge to test your problem-solving skills across multiple rounds.",
    rules: "Individual | 2 Rounds | Languages: C, C++, Java, Python",
  },
  {
    icon: Cpu,
    name: "Hackathon",
    time: "9:00 AM - 3:00 PM",
    description: "Build a working prototype for a real-world problem in a limited timeframe.",
    rules: "Team of 3-4 | Bring your own laptops | Theme revealed on spot",
  },
  {
    icon: FileText,
    name: "Paper Presentation",
    time: "10:00 AM - 12:00 PM",
    description: "Present your research papers on emerging technologies and innovations.",
    rules: "Team of 2 | IEEE format | 10 min presentation + 5 min Q&A",
  },
  {
    icon: Presentation,
    name: "Tech Talk",
    time: "1:00 PM - 2:30 PM",
    description: "Keynote sessions by industry professionals on cutting-edge topics.",
    rules: "Open to all | No registration needed",
  },
  {
    icon: Lightbulb,
    name: "Tech Quiz",
    time: "11:30 AM - 1:00 PM",
    description: "Test your knowledge across tech domains in this fast-paced quiz competition.",
    rules: "Team of 2 | 3 Rounds | Prelims + Finals",
  },
  {
    icon: Gamepad2,
    name: "Gaming Arena",
    time: "2:00 PM - 4:00 PM",
    description: "Compete in popular esports titles and prove your gaming prowess.",
    rules: "Individual/Team | Games: Valorant, BGMI | Knockout format",
  },
];

const EventsSection = () => {
  return (
    <section id="events" className="relative py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-primary text-glow-cyan sm:text-4xl">
            Events & Schedule
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/50" />
          <p className="mt-4 text-muted-foreground">Compete. Collaborate. Conquer.</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-glow-cyan hover:box-glow-cyan"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <event.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{event.name}</h3>
                  <p className="font-display text-xs tracking-wider text-secondary">{event.time}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="mt-4 rounded-md bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary/80">Rules:</span> {event.rules}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
