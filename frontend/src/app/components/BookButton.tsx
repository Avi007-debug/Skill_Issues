import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Plane } from "lucide-react";
import { ReactNode } from "react";

interface BookButtonProps {
  onClick: () => void;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "eco";
}

export default function BookButton({
  onClick,
  children = "Book Now",
  className = "",
  variant = "default",
}: BookButtonProps) {
  const baseClass =
    variant === "eco"
      ? "bg-green-500 hover:bg-green-600 text-white px-8 relative overflow-hidden group shadow-lg hover:shadow-green-500/50"
      : "bg-accent hover:bg-accent/90 text-white px-8 relative overflow-hidden group shadow-lg hover:shadow-accent/50";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Button onClick={onClick} className={`${baseClass} ${className}`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              variant === "eco"
                ? "radial-gradient(circle, rgba(255,255,255,0.8), transparent)"
                : "radial-gradient(circle, rgba(255,255,255,0.8), transparent)",
          }}
        />
        <span className="relative z-10 flex items-center gap-2">
          {children}
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0 }}
            whileHover={{ x: 4, y: -4, rotate: -15 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <Plane className="h-4 w-4" />
          </motion.div>
        </span>
      </Button>
    </motion.div>
  );
}
