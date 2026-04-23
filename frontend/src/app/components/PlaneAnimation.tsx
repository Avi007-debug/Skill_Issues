import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface PlaneAnimationProps {
  isVisible: boolean;
  airlineColor: string;
  onComplete?: () => void;
  withTicket?: boolean;
}

export default function PlaneAnimation({
  isVisible,
  airlineColor,
  onComplete,
  withTicket = false,
}: PlaneAnimationProps) {
  const [showTicket, setShowTicket] = useState(withTicket);

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          <motion.div
            initial={{ x: "-25%", y: "125%", rotate: -42, scale: 0.7 }}
            animate={{
              x: "125%",
              y: "-25%",
              rotate: -42,
              scale: [0.7, 1.3, 1.4]
            }}
            exit={{ x: "125%", y: "-25%", opacity: 0 }}
            transition={{
              duration: 2.2,
              ease: [0.19, 1, 0.22, 1],
              scale: {
                times: [0, 0.7, 1],
                ease: "easeOut"
              }
            }}
            className="absolute"
            style={{
              willChange: "transform",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))"
            }}
          >
            {withTicket && showTicket && (
              <motion.div
                initial={{ y: 120, opacity: 0, rotate: -42, scale: 0.9 }}
                animate={{
                  y: [120, 30, 0],
                  opacity: [0, 1, 1],
                  rotate: -42,
                  scale: [0.9, 1.05, 1],
                }}
                transition={{
                  duration: 1.2,
                  times: [0, 0.6, 1],
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="absolute -bottom-28 left-1/2 -translate-x-1/2"
                style={{
                  filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.25))",
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-96 h-44 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 overflow-hidden shadow-2xl"
                  style={{ borderColor: airlineColor }}
                >
                  <div
                    className="absolute left-0 top-0 h-full w-3"
                    style={{
                      background: `linear-gradient(180deg, ${airlineColor}, ${airlineColor}dd)`
                    }}
                  />
                  <div className="absolute inset-0 p-7 flex flex-col justify-between">
                    <div>
                      <div className="text-xs tracking-wider text-muted-foreground/70 uppercase">
                        Boarding Pass
                      </div>
                      <div className="text-3xl mt-2 brand" style={{ color: airlineColor }}>
                        AirZy
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-5">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">From</div>
                        <div className="text-lg mt-0.5">NYC</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">To</div>
                        <div className="text-lg mt-0.5">LAX</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Seat</div>
                        <div className="text-lg mt-0.5">12A</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Gate</div>
                        <div className="text-lg mt-0.5">B7</div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute bottom-0 right-0 w-32 h-32 opacity-5"
                    style={{
                      background: `radial-gradient(circle, ${airlineColor} 0%, transparent 70%)`
                    }}
                  />
                </motion.div>
              </motion.div>
            )}

            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: airlineColor, stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: airlineColor, stopOpacity: 0.7 }} />
                </linearGradient>
              </defs>

              <motion.g
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <g transform="translate(20, 20) scale(1.2)">
                  <path
                    d="M180 100L140 90L100 60L80 65L110 90L70 85L50 75L45 77L55 95L45 105L50 107L70 97L110 92L80 117L100 122L140 92L180 82L185 90L180 100Z"
                    fill="url(#planeGradient)"
                    filter="url(#glow)"
                    className="transition-all duration-300"
                  />
                  <path
                    d="M180 100L140 90L100 60L80 65L110 90L70 85L50 75L45 77L55 95L45 105L50 107L70 97L110 92L80 117L100 122L140 92L180 82L185 90L180 100Z"
                    fill="white"
                    fillOpacity="0.4"
                  />
                  <path
                    d="M100 60L80 65L70 85L50 75L45 77L55 95"
                    stroke="white"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                  <circle cx="110" cy="92" r="10" fill="white" fillOpacity="0.9" />
                  <circle cx="132" cy="87" r="7" fill="white" fillOpacity="0.7" />
                  <circle cx="150" cy="82" r="5" fill="white" fillOpacity="0.5" />

                  <motion.circle
                    cx="95"
                    cy="95"
                    r="3"
                    fill={airlineColor}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              </motion.g>
            </svg>

            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.4, 0] }}
              transition={{ duration: 2.2 }}
            >
              <div
                className="absolute top-1/2 left-1/2 w-[500px] h-2 blur-2xl -rotate-[42deg]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${airlineColor}50, ${airlineColor}30, transparent)`,
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute top-1/2 left-1/2 w-[400px] h-1 blur-lg -rotate-[42deg]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${airlineColor}70, ${airlineColor}40, transparent)`,
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute top-1/2 left-1/2 w-[300px] h-0.5 blur-sm -rotate-[42deg]"
                style={{
                  background: `linear-gradient(90deg, transparent 20%, ${airlineColor}90, ${airlineColor}50, transparent 80%)`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </motion.div>

            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: airlineColor,
                  left: `${-20 + i * 15}%`,
                  top: `${80 - i * 12}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0, 1.5, 0],
                  x: [0, -30],
                  y: [0, 30],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.05, 0.02, 0] }}
            transition={{ duration: 2.2, times: [0, 0.3, 0.7, 1] }}
          >
            <div
              className="w-full h-full"
              style={{
                background: `radial-gradient(ellipse at 60% 60%, ${airlineColor}10, transparent 60%)`
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
