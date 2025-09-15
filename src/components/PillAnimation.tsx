import { useEffect, useRef } from "react";

interface PillAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export function PillAnimation({
  isVisible,
  onAnimationComplete,
}: PillAnimationProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !pillRef.current) return;

    const pill = pillRef.current;

    // CSS-based pill animation
    const pillAnimation = pill.animate(
      [
        { transform: "scale(1) rotate(0deg)", opacity: 1 },
        { transform: "scale(1.2) rotate(180deg)", opacity: 0.8 },
        { transform: "scale(0) rotate(360deg)", opacity: 0 },
      ],
      {
        duration: 1200,
        easing: "ease-in-out",
      }
    );

    pillAnimation.addEventListener("finish", () => {
      // Particle explosion after pill dissolves
      if (particlesRef.current) {
        const particles = Array.from(
          particlesRef.current.children
        ) as HTMLElement[];

        particles.forEach((particle, i) => {
          const x = (Math.random() - 0.5) * 200;
          const y = (Math.random() - 0.5) * 200;

          particle
            .animate(
              [
                { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
                {
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`,
                  opacity: 1,
                },
                {
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0)`,
                  opacity: 0,
                },
              ],
              {
                duration: 800,
                delay: i * 50,
                easing: "ease-out",
              }
            )
            .addEventListener("finish", () => {
              if (i === particles.length - 1 && onAnimationComplete) {
                onAnimationComplete();
              }
            });
        });
      }
    });

    return () => pillAnimation.cancel();
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      {/* Pill */}
      <div
        ref={pillRef}
        className="w-8 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-lg"
      />

      {/* Particles */}
      <div ref={particlesRef} className="absolute">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}