"use client";
import * as React from "react";
import { RiMoonLine, RiSunLine } from "@/components/icons";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export function ThemeToggleButton({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      variant="outline"
      size="icon"
      className={cn(className, "size-10 dark:bg-background")}
    >
      <RiSunLine className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <RiMoonLine className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

