'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const pathname = usePathname();

  // Configure transition based on route
  let yOffset = 10;
  let duration = 0.25;

  if (pathname === '/login') {
    yOffset = 8;
  } else if (pathname.includes('/trainer/courses/new') || pathname.includes('/trainer/assessments/new')) {
    yOffset = 10;
    duration = 0.3;
  } else if (pathname.includes('/admin')) {
    yOffset = 8;
    duration = 0.24;
  }

  // Use a custom cubic-bezier curve for premium enterprise feel
  const transition = {
    duration,
    ease: [0.22, 1, 0.36, 1],
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: yOffset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={transition}
        className={`w-full h-full flex flex-col flex-1 ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
