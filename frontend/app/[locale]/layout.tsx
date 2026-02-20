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
import {Metadata} from "next";
import {OrganizationProvider, PermissionsProvider} from "@/app/providers";

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
        <NextIntlClientProvider messages={messages} locale={locale}>
            <html
                lang={locale}
                {...mantineHtmlProps}
                className={`${lato.variable} ${josefinSans.variable}`}
            >
            <head>
                <ColorSchemeScript/>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
            </head>
            <body
                style={{minHeight: "100vh", display: "flex", flexDirection: "column"}}>
            <Auth0Provider user={user}>
                <PermissionsProvider>
                    <OrganizationProvider>
                        <MantineProvider theme={theme}>
                            <ModalsProvider>
                                <Notifications/>
                                <Header/>
                                {children}
                                <Footer/>
                            </ModalsProvider>
                        </MantineProvider>
                    </OrganizationProvider>
                </PermissionsProvider>
            </Auth0Provider>
            </body>
            </html>
        </NextIntlClientProvider>
    );
}