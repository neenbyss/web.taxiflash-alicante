"use client";

import * as React from "react";
import { m, useReducedMotion } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Orientation = "top" | "bottom" | "left" | "right";

export type AnimatedProps = {
  className?: string;
  children: React.ReactNode;

  orientation?: Orientation;

  /** px de desplazamiento inicial (tipo “Distance”) */
  distance?: number;

  /** ms/seg según tu lib; se mantiene tu default */
  duration?: number;
  delay?: number;
  ease?: [number, number, number, number];

  /** Toggle “Animate Opacity” */
  animateOpacity?: boolean;

  initialBlur?: `${number}rem`;

  /** “Initial Opacity” (solo si animateOpacity=true) */
  initialOpacity?: number;

  /** “Initial Scale” */
  initialScale?: number;

  /** “Threshold” (0..1) */
  threshold?: number;

  /** true = re-animar al re-entrar al viewport */
  loop?: boolean;
  scroll?: boolean;

  /** viewport margin, e.g. "0px 0px -20% 0px" */
  marginViewport?: string;
};

export function AnimatedContent({
  className,
  children,
  orientation = "bottom",
  distance = 80,
  duration = 0.65,
  delay = 0,
  ease = [0.26, 0.66, 0, 0.98],
  animateOpacity = true,
  initialOpacity = 0,
  initialScale = 1,
  threshold = 0.1,
  loop = false,
  scroll = true,
  marginViewport,
}: AnimatedProps) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  if (isMobile || reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  const offset = {
    top: { y: -distance },
    bottom: { y: distance },
    left: { x: -distance },
    right: { x: distance },
  }[orientation];
  const from = {
    ...offset,
    scale: initialScale,
    opacity: animateOpacity ? initialOpacity : 1,
  };
  const to = { x: 0, y: 0, scale: 1, opacity: 1 };

  return (
    <m.div
      className={cn(className)}
      initial={from}
      {...(scroll ? { whileInView: to } : { animate: to })}
      transition={{ duration, delay, ease }}
      viewport={{
        once: !loop,
        margin: marginViewport,
        amount: Math.max(0, Math.min(1, threshold)),
      }}
    >
      {children}
    </m.div>
  );
}
