import { auth0 } from "@/lib/auth0/auth0";
import { Auth0ManagementService } from "@/lib/auth0/management";
import { getTranslations } from "next-intl/server";
import { Container } from "@mantine/core";
import { Header } from "@/components/Header/Header";
import { redirect } from "next/navigation";
import React from "react";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/api/auth/login");
    }

    const auth0User = await Auth0ManagementService.getUser(session.user.sub);
    const user = auth0User ? { ...auth0User, sub: auth0User.user_id } : session.user;

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
