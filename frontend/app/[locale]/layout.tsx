import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import {
  AppShell, AppShellFooter, AppShellHeader, AppShellMain,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { josefinSans, lato } from "@/shared/config/theme";
import type { ReactNode } from "react";
import { Header, Footer } from "@/shared/ui";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { AppProvider } from "@/app/providers";

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
        {/*<body>*/}
          <AppProvider>
            <AppShell >
              <AppShellMain style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Header />
                <div style={{ flex: 1 }}>
                  {children}
                </div>
                <Footer />
              </AppShellMain>
            </AppShell>
          </AppProvider>
        </body>
      </html>
    </NextIntlClientProvider>
  );
}
