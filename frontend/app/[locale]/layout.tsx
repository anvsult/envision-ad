import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import {ColorSchemeScript, mantineHtmlProps, MantineProvider} from "@mantine/core";
import {josefinSans, lato, theme} from "@/app/theme";
import type {ReactNode} from "react";
import Footer from "@/widgets/Footer/Footer";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {Notifications} from "@mantine/notifications";
import {Header} from "@/widgets/Header/Header";
import {ModalsProvider} from "@mantine/modals";
import {auth0} from "@/shared/api/auth0/auth0";
import {Auth0Provider} from "@auth0/nextjs-auth0";
import {OrganizationProvider, PermissionsProvider} from "@/app/providers";
import {Metadata, Viewport} from "next";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    // maximumScale: 1, // Removed this to allow users to zoom if needed for accessibility
    // userScalable: false,
}

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "metadata"});

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
    const {locale} = await params;
    const messages = await getMessages({locale});

    const session = await auth0.getSession();
    const user = session?.user;

    return (
            <html
                lang={locale}
                {...mantineHtmlProps}
                className={`${lato.variable} ${josefinSans.variable}`}
            >
            <head>
                {/* The title is handled by Next.js*/}
                <ColorSchemeScript defaultColorScheme="light"/>
            </head>
            <body style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <NextIntlClientProvider messages={messages} locale={locale}>
                <Auth0Provider user={user}>
                    <PermissionsProvider>
                        <OrganizationProvider>
                            <MantineProvider theme={theme}>
                                <ModalsProvider>
                                    <Notifications/>
                                    <Header/>
                                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                                        {children}
                                        <Footer/>
                                    </div>
                                </ModalsProvider>
                            </MantineProvider>
                        </OrganizationProvider>
                    </PermissionsProvider>
                </Auth0Provider>
            </NextIntlClientProvider>
            </body>
        </html>
    );
}