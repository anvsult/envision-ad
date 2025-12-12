"use client";

import { MantineProvider } from "@mantine/core";
import { ReactNode } from "react";
import { theme } from "@/shared/config";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
