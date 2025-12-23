import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider
} from "@mantine/core";
import { josefinSans, lato, theme } from "@/app/theme";
import type { ReactNode } from "react";
import Footer from "@/widgets/Footer/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Notifications } from "@mantine/notifications";
import {Header} from "@/widgets/Header/Header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

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
        <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <MantineProvider theme={theme}>
            <Notifications />
            <Header/>
            {children}
            <Footer />
          </MantineProvider>
        </body>
      </html>
    </NextIntlClientProvider>
  );
}
