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

    return (
        <div className="fixed inset-0 -z-10 bg-background overflow-hidden pointer-events-none">
            {/* Mesh Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(hsl(199 89% 48% / 0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(199 89% 48% / 0.3) 1px, transparent 1px)`,
                    backgroundSize: "80px 80px"
                }}
            />

            {/* Radial Glows — CSS animated */}
            <div
                className={`absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 ${isMobile ? 'blur-[40px]' : 'blur-[100px] dynamic-bg-orb-1'}`}
            />

            <div
                className={`absolute bottom-[0%] -right-[10%] h-[50%] w-[50%] rounded-full bg-secondary/10 ${isMobile ? 'blur-[40px]' : 'blur-[100px] dynamic-bg-orb-2'}`}
            />

            {/* Particles — CSS animated, desktop only */}
            {!isMobile && [...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-primary/40 shadow-[0_0_10px_rgba(3,169,244,0.3)] dynamic-bg-particle"
                    style={{
                        left: `${(i * 17 + 10) % 100}%`,
                        top: `${(i * 23 + 5) % 100}%`,
                        animationDelay: `${i * -8}s`,
                        animationDuration: `${40 + i * 10}s`,
                    }}
                />
            ))}

            {/* Scanning Line — CSS animated, desktop only */}
            {!isMobile && (
                <div
                    className="absolute left-0 right-0 h-[400px] bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none opacity-30 dynamic-bg-scanline"
                />
            )}

            {/* CSS Animations */}
            <style>{`
                .dynamic-bg-orb-1 {
                    animation: orb1Pulse 15s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                .dynamic-bg-orb-2 {
                    animation: orb2Pulse 18s ease-in-out 2s infinite;
                    will-change: transform, opacity;
                }
                .dynamic-bg-particle {
                    animation: particleDrift linear infinite;
                    will-change: transform;
                    opacity: 0.2;
                }
                .dynamic-bg-scanline {
                    animation: scanlineMove 25s linear infinite;
                    will-change: top;
                }
                @keyframes orb1Pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.45; }
                }
                @keyframes orb2Pulse {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.15); opacity: 0.35; }
                }
                @keyframes particleDrift {
                    0% { transform: translate(0, 0); opacity: 0.1; }
                    25% { opacity: 0.3; }
                    50% { transform: translate(30vw, -20vh); opacity: 0.1; }
                    75% { opacity: 0.3; }
                    100% { transform: translate(0, 0); opacity: 0.1; }
                }
                @keyframes scanlineMove {
                    0% { top: -5%; }
                    100% { top: 105%; }
                }
            `}</style>
        </div>
    );
};

export default DynamicBackground;
