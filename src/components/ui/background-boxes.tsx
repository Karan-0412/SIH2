"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBoxes = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const squares = Array.from({ length: 100 }, (_, i) => ({
    x: i % 10,
    y: Math.floor(i / 10),
  }));

  const renderSquares = () => {
    return (
      <div className="absolute inset-0 h-full w-full">
        {squares.map((sq, i) => (
          <motion.div
            key={i}
            className="absolute h-4 w-4 border border-white/20 cursor-pointer"
            style={{
              left: `${sq.x * 10}%`,
              top: `${sq.y * 10}%`,
            }}
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : { opacity: 0 }}
            whileHover={{
              scale: 1.2,
              opacity: 0.8,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            whileTap={{ scale: 0.9 }}
            transition={{
              duration: 1,
              delay: i * 0.01,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-black p-10 group",
        containerClassName
      )}
    >
      <div className="absolute inset-0 z-0">
        {renderSquares()}
      </div>
      <div className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
};
