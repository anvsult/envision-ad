import { auth0 } from "@/lib/auth0/auth0";
import { Auth0ManagementService } from "@/lib/auth0/management";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Stack, Title, Text, Container } from "@mantine/core";
import React from "react";
import ProfileContent from "./ProfileContent";
import { Header } from "@/components/Header/Header";
import { UserType } from "@/types/UserType";

export default async function ProfilePage() {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        redirect("/api/auth/login");
    }

    let user = session.user as UserType;

    try {
        // Fetch fresh user data from Auth0 to reflect recent updates immediately
        const auth0User = await Auth0ManagementService.getUser(session.user.sub);
        if (auth0User) {
            user = auth0User as UserType;
        }
    } catch (e) {
    }

    const t = await getTranslations("profilePage");

    return (
        <>
            <Header />
            <Container size="lg" py="xl">
                <ProfileContent user={user} />
            </Container>
        </>
    );
}
