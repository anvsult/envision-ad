import { auth0 } from "@/lib/auth0/auth0";
import { getTranslations } from "next-intl/server";
import { getEmployeeBusiness } from "@/services/BusinessService";
import { Container, Title } from "@mantine/core";
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

    let business = null;
    try {
        business = await getEmployeeBusiness(user.sub);
    } catch (e) {
        console.error("Failed to fetch business:", e);
    }

    return (
        <Container size="lg" py="xl">
            <Title order={1} mb="xl">{t("title")}</Title>
            <ProfileContent user={user} business={business} />
        </Container>
    );
}
