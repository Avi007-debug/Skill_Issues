import { motion, AnimatePresence } from "motion/react";

interface AnimationOverlayProps {
  isVisible: boolean;
  color: string;
}

export default function AnimationOverlay({ isVisible, color }: AnimationOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[99] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.02, 0.01, 0],
            }}
            transition={{
              duration: 2.2,
              times: [0, 0.2, 0.6, 1],
            }}
            style={{
              background: `radial-gradient(circle at center, ${color}20, transparent 70%)`,
            }}
          />

          <motion.div
            className="absolute inset-0 backdrop-blur-[0.5px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2.2 }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 2],
                opacity: [0, 0.15, 0],
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-32 h-32 rounded-full border-2"
              style={{
                borderColor: color,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
