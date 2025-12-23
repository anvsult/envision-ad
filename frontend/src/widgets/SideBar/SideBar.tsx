import {NavLink, Stack, Accordion} from "@mantine/core";
import {Link, usePathname} from "@/shared/lib/i18n/navigation";
import {
    IconAd,
    IconDeviceTv,
    IconFileDescription,
    IconLayoutDashboard,
    IconUsers,
    IconShieldCheck,
} from "@tabler/icons-react";
import React from "react";
import {useTranslations} from "next-intl";

export default function SideBar() {
    const pathname = usePathname();
    // const isMobile = useMediaQuery("(max-width: 768px)");
    const t = useTranslations("sideBar");

    return (
        <Accordion
            multiple
            variant="separated"

            defaultValue={["organization", "media-owner", "advertiser", "admin"]}
        >
            <Accordion.Item value="media-owner">
                <Accordion.Control>{t("mediaOwnerTitle")}</Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="xs">
                        {/*<NavLink*/}
                        {/*    component={Link}*/}
                        {/*    href="/dashboard/media-owner/overview"*/}
                        {/*    label={t("media-owner.overview")}*/}
                        {/*    leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}*/}
                        {/*    active={pathname?.endsWith("/media-owner/overview")}*/}
                        {/*/>*/}

                        <NavLink
                            component={Link}
                            href="/dashboard/media-owner/media"
                            label={t("media-owner.media")}
                            leftSection={<IconDeviceTv size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/media-owner/media")}
                        />

                        {/*<NavLink*/}
                        {/*    component={Link}*/}
                        {/*    href="/dashboard/media-owner/displayed-ads"*/}
                        {/*    label={t("media-owner.displayedAds")}*/}
                        {/*    leftSection={<IconAd size={20} stroke={1.5} />}*/}
                        {/*    active={pathname?.endsWith("/media-owner/displayed-ads")}*/}
                        {/*/>*/}

                        {/*<NavLink*/}
                        {/*    component={Link}*/}
                        {/*    href="/dashboard/media-owner/ad-requests"*/}
                        {/*    label={t("media-owner.adRequests")}*/}
                        {/*    leftSection={<IconFileDescription size={20} stroke={1.5} />}*/}
                        {/*    active={pathname?.endsWith("/media-owner/ad-requests")}*/}
                        {/*/>*/}
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="organization">
                <Accordion.Control>{t("organizationTitle")}</Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="xs">
                        <NavLink
                            component={Link}
                            href="/dashboard/organization/overview"
                            label={t("organization.overview")}
                            leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/organization/overview")}
                        />

                        <NavLink
                            component={Link}
                            href="/dashboard/organization/employees"
                            label={t("organization.employees")}
                            leftSection={<IconUsers size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/organization/employees")}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
            {/*<NavLink*/}
            {/*    component={Link}*/}
            {/*    href="/dashboard/transactions"*/}
            {/*    label={t("sidebar.transactions")}*/}
            {/*    leftSection={<IconCurrencyDollar size={20} stroke={1.5} />}*/}
            {/*    active={pathname?.includes("/transactions")}*/}
            {/*    onClick={isMobile ? close : undefined}*/}
            {/*/>*/}
            <Accordion.Item value="advertiser">
                <Accordion.Control>{t("advertiserTitle")}</Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="xs">
                        {/*<NavLink*/}
                        {/*    component={Link}* /}
                        {/*    href="/dashboard/advertiser/overview"*/}
                        {/*    label={t("organization.overview")}*/}
                        {/*    leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}*/}
                        {/*    active={pathname?.endsWith("/organization/overview")}*/}
                        {/*/>*/}

                        <NavLink
                            component={Link}
                            href="/dashboard/advertiser/campaigns"
                            label={t("advertiser.myAds")}
                            leftSection={<IconAd size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/advertiser/campaigns")}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="admin">
                        <Accordion.Control>{t("adminTitle")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            <NavLink
                                component={Link}
                                href="/dashboard/admin/media/pending"
                                label={t("admin.pendingMedia")}
                                leftSection={<IconShieldCheck size={20} stroke={1.5} />}
                                active={pathname?.includes("/dashboard/admin/media/pending")}
                            />
                        </Stack>
                    </Accordion.Panel>
            </Accordion.Item>
            {/*<NavLink*/}
            {/*    component={Link}*/}
            {/*    href="/dashboard/transactions"*/}
            {/*    label={t("sidebar.transactions")}*/}
            {/*    leftSection={<IconCurrencyDollar size={20} stroke={1.5} />}*/}
            {/*    active={pathname?.includes("/transactions")}*/}
            {/*    onClick={isMobile ? close : undefined}*/}
            {/*/>*/}
        </Accordion>
)
}