import { auth0 } from "@/lib/auth0/auth0";
import { Auth0ManagementService } from "@/lib/auth0/management";
import { getTranslations } from "next-intl/server";
import { Container } from "@mantine/core";
import { Header } from "@/components/Header/Header";
import { redirect } from "next/navigation";
import React from "react";
import ProfileContent from "./ProfileContent";
import { mapAuth0UserToUser } from "@/services/UserService";

export default async function ProfilePage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/api/auth/login");
    }

    let user: any = {
        ...session.user,
        user_id: session.user.sub,
        user_metadata: (session.user as any).user_metadata || {}
    };
    try {
        const auth0User = await Auth0ManagementService.getUser(session.user.sub);
        if (auth0User) {
            user = { ...auth0User, sub: auth0User.user_id };
        }
    } catch (e) {
        // Fallback to session user if Auth0 API fails
        console.error("Failed to fetch latest user data from Auth0, using session data.", e);
    }

    const camelCaseUser = mapAuth0UserToUser(user);

    const t = await getTranslations("profilePage");

    return (
        <>
            <Header />
            <Container size="lg" py="xl">
                <ProfileContent user={camelCaseUser} />
            </Container>
        </>
    );
}
