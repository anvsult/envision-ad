import {NavLink, Stack, Accordion} from "@mantine/core";
import {Link, usePathname} from "@/lib/i18n/navigation";
import {
    IconAd,
    IconDeviceTv,
    IconFileDescription,
    IconLayoutDashboard,
    IconUsers
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
            defaultValue={["business", "media-owner", "advertiser"]}
        >
            <Accordion.Item value="media-owner">
                <Accordion.Control>{t("mediaOwnerTitle")}</Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="xs">
                        <NavLink
                            component={Link}
                            href="/dashboard/media-owner/overview"
                            label={t("media-owner.overview")}
                            leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/media-owner/overview")}
                        />

                        <NavLink
                            component={Link}
                            href="/dashboard/media-owner/media"
                            label={t("media-owner.media")}
                            leftSection={<IconDeviceTv size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/media-owner/media")}
                        />

                        <NavLink
                            component={Link}
                            href="/dashboard/media-owner/displayed-ads"
                            label={t("media-owner.displayedAds")}
                            leftSection={<IconAd size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/media-owner/displayed-ads")}
                        />

                        <NavLink
                            component={Link}
                            href="/dashboard/media-owner/ad-requests"
                            label={t("media-owner.adRequests")}
                            leftSection={<IconFileDescription size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/media-owner/ad-requests")}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="business">
                <Accordion.Control>{t("businessTitle")}</Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="xs">
                        <NavLink
                            component={Link}
                            href="/dashboard/business/overview"
                            label={t("business.overview")}
                            leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/business/overview")}
                        />

                        <NavLink
                            component={Link}
                            href="/dashboard/business/employees"
                            label={t("business.employees")}
                            leftSection={<IconUsers size={20} stroke={1.5} />}
                            active={pathname?.endsWith("/business/employees")}
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
                        {/*    component={Link}*/}
                        {/*    href="/dashboard/advertiser/overview"*/}
                        {/*    label={t("business.overview")}*/}
                        {/*    leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}*/}
                        {/*    active={pathname?.endsWith("/business/overview")}*/}
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
        </Accordion>
    )
}