import React from "react";

import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

import { ViewTransition } from "react";
import { Footer } from "@/components/layout/footer";
import { ReactLenis } from "lenis/react";

export default function Template({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransition>
      <ReactLenis root>
        <Header />
        {children}
        <Footer />
        <Toaster />
      </ReactLenis>
    </ViewTransition>
  );
}

