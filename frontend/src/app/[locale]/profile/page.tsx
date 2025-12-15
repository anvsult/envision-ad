import { auth0 } from "@/lib/auth0/auth0";
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

    const user = session.user;
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
