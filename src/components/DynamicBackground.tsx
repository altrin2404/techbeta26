import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DynamicBackground = () => {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!mounted) return null;

    const particleCount = isMobile ? 0 : 6; // Disable particles on mobile for performance
    const blurLarge = isMobile ? 'blur-[40px]' : 'blur-[100px]'; // Reduced blur on mobile

    return (
        <div className="fixed inset-0 -z-10 bg-background overflow-hidden pointer-events-none">
            {/* Mesh Grid - Subtle for light theme */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(hsl(199 89% 48% / 0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(199 89% 48% / 0.3) 1px, transparent 1px)`,
                    backgroundSize: "80px 80px"
                }}
            />

            {/* Light Mode Optimized Radial Glows */}
            <motion.div
                animate={isMobile ? {} : {
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.45, 0.3],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ willChange: isMobile ? "auto" : "transform, opacity" }}
                className={`absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 ${blurLarge}`}
            />

            <motion.div
                animate={isMobile ? {} : {
                    scale: [1, 1.15, 1],
                    opacity: [0.2, 0.35, 0.2],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                style={{ willChange: isMobile ? "auto" : "transform, opacity" }}
                className={`absolute bottom-[0%] -right-[10%] h-[50%] w-[50%] rounded-full bg-secondary/10 ${blurLarge}`}
            />

            {/* Particles - Disabled on mobile for performance */}
            {!isMobile && [...Array(particleCount)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        opacity: 0,
                    }}
                    animate={{
                        x: [
                            (Math.random() * 100) + "%",
                            (Math.random() * 100) + "%"
                        ],
                        y: [
                            (Math.random() * 100) + "%",
                            (Math.random() * 100) + "%"
                        ],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 40 + Math.random() * 40,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{ willChange: "transform" }}
                    className="absolute h-1 w-1 rounded-full bg-primary/40 shadow-[0_0_10px_rgba(3,169,244,0.3)]"
                />
            ))}

            {/* Subtle Scanning Line - Simplified on mobile */}
            <motion.div
                animate={isMobile ? { opacity: 0 } : {
                    top: ["-5%", "105%"],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ willChange: isMobile ? "auto" : "top" }}
                className={`absolute left-0 right-0 h-[400px] bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none ${isMobile ? 'opacity-0' : 'opacity-30'}`}
            />
        </div>
    );
};

export default DynamicBackground;
