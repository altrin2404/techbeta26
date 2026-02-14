import { motion } from "framer-motion";
import { Bus } from "lucide-react";

const routes = [
  { bus: "Route 1", number: "Bus No. 101", stops: "Central Station → MG Road → Tech Park → College", time: "7:30 AM" },
  { bus: "Route 2", number: "Bus No. 102", stops: "Railway Station → Old City → Ring Road → College", time: "7:45 AM" },
  { bus: "Route 3", number: "Bus No. 103", stops: "Airport Road → Highway Junction → College", time: "8:00 AM" },
  { bus: "Route 4", number: "Bus No. 104", stops: "North Terminal → University Area → College", time: "7:30 AM" },
  { bus: "Route 5", number: "Bus No. 105", stops: "South Gate → Lake View → Industrial Area → College", time: "8:15 AM" },
];

const BusRoutesSection = () => {
  return (
    <section id="bus-routes" className="relative py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-primary text-glow-cyan sm:text-4xl">
            Bus Routes
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/50" />
          <p className="mt-4 text-muted-foreground">College bus routes for the event day</p>
        </motion.div>

        <div className="mt-12 space-y-4">
          {routes.map((route, i) => (
            <motion.div
              key={route.bus}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-glow-cyan"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Bus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-foreground">{route.bus}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {route.number}
                  </span>
                  <span className="ml-auto font-display text-xs tracking-wider text-secondary">
                    🕐 {route.time}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{route.stops}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusRoutesSection;
