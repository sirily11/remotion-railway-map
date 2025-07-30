"use client";

import { motion } from "framer-motion";

export const FlyingEmojis = () => {
  const floatingEmojis = ["☁️", "⭐", "💖", "🌸", "🌈", "✨", "🦄", "🍭"];
  
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {/* Floating clouds */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute text-8xl"
          initial={{
            x: "-20vw",
            y: `${10 + i * 25}vh`,
          }}
          animate={{
            x: "120vw",
          }}
          transition={{
            duration: 40 + i * 10,
            delay: i * 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            opacity: 0.3,
          }}
        >
          ☁️
        </motion.div>
      ))}
      
      {/* Floating kawaii elements */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={`emoji-${i}`}
          className="absolute"
          initial={{
            x: `${Math.random() * 100}vw`,
            y: "110vh",
            rotate: 0,
          }}
          animate={{
            y: "-10vh",
            rotate: 360,
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            delay: i * 2 + Math.random() * 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            fontSize: `${2 + Math.random() * 2}rem`,
            opacity: 0.6,
          }}
        >
          {emoji}
        </motion.div>
      ))}
      
      {/* Twinkling stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-2xl"
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};
