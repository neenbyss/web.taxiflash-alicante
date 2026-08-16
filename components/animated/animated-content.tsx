/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { motion } from "motion/react";
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

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function offsetFrom(orientation: Orientation, distance: number) {
  switch (orientation) {
    case "top":
      return { y: -distance };
    case "bottom":
      return { y: distance };
    case "left":
      return { x: -distance };
    case "right":
      return { x: distance };
  }
}



export function AnimatedContent({
  className,
  children,

  orientation = "bottom",
  distance = 80,

  duration = 0.9,
  delay = 0,
  ease = [0.26, 0.66, 0, 0.98],

  animateOpacity = true,
  initialOpacity = 0,
  initialScale = 1,
  initialBlur = ".2rem",

  threshold = 0.1,

  loop = false,
  scroll = true,
  marginViewport,
}: AnimatedProps) {

  const from: Record<string, any> = {
    ...offsetFrom(orientation, distance),
    scale: initialScale,
    filter: `blur(${initialBlur})`
  };


  const to: Record<string, any> = {
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0)"
  };

  if (animateOpacity) {
    from.opacity = initialOpacity;
    to.opacity = 1;
  }

  const toTransition = !scroll ? {animate: to} : {whileInView: to}


  return (
    <motion.div
      className={cn(className)}
      initial={from}
      {...toTransition}
      transition={{ duration, delay, ease }}
      viewport={{
        once: !loop,
        margin: marginViewport,
        amount: clamp01(threshold),
      }}
      style={{ willChange: animateOpacity ? "transform, opacity" : "transform" }}
    >
      {children}
    </motion.div>
  );
}
