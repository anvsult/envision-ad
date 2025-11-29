import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { josefinSans, lato, theme } from "../theme";
import type { ReactNode } from "react";

// This will be used for SEO (Search Engine Optimization)
export const metadata = {
  title: "Envision AD - Affordable Ads, Unforgettable Impact",
  description:
    "Find affordable advertising spaces with visual impact. Browse available ad spaces and grow your business.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}
      className={`${lato.variable} ${josefinSans.variable}`}
    >
      <head>
        <ColorSchemeScript />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
