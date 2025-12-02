import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { josefinSans, lato, theme } from "../../theme";
import type { ReactNode } from "react";
import Footer from "../../components/Footer/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// This will be used for SEO (Search Engine Optimization)
export const metadata = {
  title: "Envision AD - Affordable Ads, Unforgettable Impact",
  description:
    "Find affordable advertising spaces with visual impact. Browse available ad spaces and grow your business.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <html
        lang={locale}
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
          <MantineProvider theme={theme}>
            {children}
            <Footer />
          </MantineProvider>
        </body>
      </html>
    </NextIntlClientProvider>
  );
}
