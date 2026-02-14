import { motion } from "framer-motion";
import { Instagram, Linkedin, Github } from "lucide-react";

const team = [
  { name: "Dr. A. Kumar", role: "Faculty Coordinator", img: "👨‍🏫" },
  { name: "Priya Sharma", role: "Student Coordinator", img: "👩‍💻" },
  { name: "Ravi Patel", role: "Technical Lead", img: "👨‍💻" },
  { name: "Ananya Desai", role: "Event Manager", img: "👩‍🎨" },
  { name: "Karthik R.", role: "Design Head", img: "🎨" },
  { name: "Meera Nair", role: "Marketing Lead", img: "📢" },
];

const TeamSection = () => {
  return (
    <section id="team" className="relative py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-secondary text-glow-purple sm:text-4xl">
            Our Team
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-secondary/50" />
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-center rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-glow-purple hover:box-glow-purple"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl">
                {member.img}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{member.name}</h3>
              <p className="text-sm text-secondary">{member.role}</p>
              <div className="mt-4 flex gap-3">
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Instagram size={16} />
                </a>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Linkedin size={16} />
                </a>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Github size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
