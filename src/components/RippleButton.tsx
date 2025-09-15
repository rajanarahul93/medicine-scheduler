import { useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";

interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function RippleButton({
  children,
  className = "",
  onClick,
  ...props
}: RippleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple element
    const ripple = document.createElement("div");
    ripple.className = "absolute rounded-full bg-white/30 pointer-events-none";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = "translate(-50%, -50%)";
    ripple.style.width = "0";
    ripple.style.height = "0";

    button.appendChild(ripple);

    // CSS-based ripple animation (more reliable than animejs)
    ripple
      .animate(
        [
          { width: "0", height: "0", opacity: 0.6 },
          { width: "200px", height: "200px", opacity: 0 },
        ],
        {
          duration: 600,
          easing: "ease-out",
        }
      )
      .addEventListener("finish", () => ripple.remove());

    // Call original onClick
    if (onClick) onClick(e);
  };

  return (
    <Button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}