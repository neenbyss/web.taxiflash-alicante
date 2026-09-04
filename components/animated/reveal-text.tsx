"use client";

import * as React from "react";
import { m, useReducedMotion } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Orientation = "top" | "bottom" | "left" | "right";

function TextReveal({
  children,
  className,
  orientation,
  duration,
  delay,
  loop,
  marginViewport,
}: {
  children: React.ReactNode;
  className?: string;
  orientation: Orientation;
  duration: number;
  delay: number;
  loop: boolean;
  marginViewport?: string;
}) {
  const offset = {
    top: { y: "-100%" },
    bottom: { y: "100%" },
    left: { x: "-100%" },
    right: { x: "100%" },
  }[orientation];

  return (
    <span className="relative -my-3 inline-block overflow-clip text-inherit">
      <m.span
        className={cn("block text-inherit", className)}
        initial={{ ...offset, opacity: 0 }}
        whileInView={{ x: 0, y: 0, opacity: 1 }}
        transition={{ duration, delay, ease: [0.26, 0.66, 0, 0.98] }}
        viewport={{ once: !loop, margin: marginViewport }}
      >
        {children}
      </m.span>
    </span>
  );
}

type StylesMap = Record<string, string>;

type RevealTextProps = {
  text: string; // soporta tags simples: <gold>...</gold>, <accent>...</accent>, etc.
  styles?: StylesMap; // { gold: "clases...", accent: "clases..." }
  className?: string;
  as?: React.ElementType;
  split?: "words" | "chars"; // words = más liviano, chars = “letras”
  orientation?: Orientation;
  duration?: number;
  delay?: number; // delay base
  stagger?: number; // incremento por token animado
  loop?: boolean;
  marginViewport?: string;
};

type Run = { text: string; className?: string };

function parseTaggedText(input: string, styles: StylesMap = {}): Run[] {
  const re = /<\/?([a-zA-Z][\w-]*)>/g;
  const stack: string[] = [];
  const runs: Run[] = [];

  let last = 0;
  let m: RegExpExecArray | null;

  const currentClass = () =>
    stack
      .map((t) => styles[t])
      .filter(Boolean)
      .join(" ")
      .trim() || undefined;

  while ((m = re.exec(input))) {
    const idx = m.index;
    if (idx > last) {
      runs.push({ text: input.slice(last, idx), className: currentClass() });
    }

    const full = m[0];
    const tag = m[1];
    const isClose = full.startsWith("</");

    if (isClose) {
      const p = stack.lastIndexOf(tag);
      if (p !== -1) stack.splice(p, 1);
    } else {
      stack.push(tag);
    }

    last = re.lastIndex;
  }

  if (last < input.length) {
    runs.push({ text: input.slice(last), className: currentClass() });
  }

  return runs;
}

function splitKeepingNewlines(text: string): Array<string | "\n"> {
  return text.split(/(\n)/).filter((x) => x !== "");
}

function splitTokens(text: string, mode: "words" | "chars"): string[] {
  if (mode === "chars") return Array.from(text);
  return text.split(/(\s+)/).filter((x) => x !== "");
}

export function RevealText({
  text,
  styles = {},
  className,
  as: As = "span",
  split = "words",
  orientation = "bottom",
  duration = 0.65,
  delay = 0,
  stagger = 0.035,
  loop = false,
  marginViewport,
}: RevealTextProps) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  type Item =
    | { kind: "br"; key: string }
    | { kind: "text"; key: string; text: string } // espacios
    | {
        kind: "token";
        key: string;
        text: string;
        className?: string;
        idx: number;
      };

  const items = React.useMemo<Item[]>(() => {
    const runs = parseTaggedText(text, styles);

    const initial = { items: [] as Item[], idx: 0 };

    const out = runs.reduce((acc, run, runIdx) => {
      const parts = splitKeepingNewlines(run.text);

      return parts.reduce((acc2, part, partIdx) => {
        if (part === "\n") {
          return {
            ...acc2,
            items: [
              ...acc2.items,
              { kind: "br", key: `br-${runIdx}-${partIdx}` },
            ],
          };
        }

        const tokens = splitTokens(part, split);

        return tokens.reduce((acc3, tok, tokIdx) => {
          const isSpace = split === "words" ? /^\s+$/.test(tok) : tok === " ";

          if (isSpace) {
            return {
              ...acc3,
              items: [
                ...acc3.items,
                {
                  kind: "text",
                  key: `s-${runIdx}-${partIdx}-${tokIdx}`,
                  text: tok,
                },
              ],
            };
          }

          const item: Item = {
            kind: "token",
            key: `t-${runIdx}-${partIdx}-${tokIdx}`,
            text: tok,
            className: run.className,
            idx: acc3.idx,
          };

          return { items: [...acc3.items, item], idx: acc3.idx + 1 };
        }, acc2);
      }, acc);
    }, initial);

    return out.items;
  }, [text, styles, split]);

  return (
    <As className={className}>
      {items.map((item) => {
        if (item.kind === "br") return <br key={item.key} />;

        if (item.kind === "text") {
          return <React.Fragment key={item.key}>{item.text}</React.Fragment>;
        }

        if (isMobile || reduceMotion) {
          return (
            <span key={item.key} className={item.className}>
              {item.text}
            </span>
          );
        }

        return (
          <TextReveal
            key={item.key}
            className={item.className}
            orientation={orientation}
            duration={duration}
            delay={delay + item.idx * stagger}
            loop={loop}
            marginViewport={marginViewport}
          >
            {item.text}
          </TextReveal>
        );
      })}
    </As>
  );
}

