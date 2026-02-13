import { NavLink, Stack, Accordion } from "@mantine/core";
import { Link, usePathname } from "@/shared/lib/i18n/navigation";
import {
    IconAd,
    IconDeviceTv,
    IconLayoutDashboard,
    IconUsers,
    IconShieldCheck,
    IconDiscountCheck,
    IconChartDots,
    IconFileDescription,
    IconInbox,
    IconSpeakerphone,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/app/providers/PermissionProvider";

export default function SideBar() {
    const { permissions } = usePermissions();
    const pathname = usePathname();
    const t = useTranslations("sideBar");
    const hasMediaOwnerAccess =
        permissions.includes("create:media") || permissions.includes("update:reservation");

    const mediaOwnerNavItems = [
        hasMediaOwnerAccess && (
            <NavLink
                key="metrics"
                component={Link}
                href="/dashboard/media-owner/metrics"
                label={t("media-owner.metrics")}
                leftSection={<IconChartDots size={20} stroke={1.5} />}
                active={pathname?.includes("/media-owner/metrics")}
            />
        ),
        (permissions.includes('create:media')) && (
            <NavLink
                key="media"
                component={Link}
                href="/dashboard/media-owner/locations"
                label={t("media-owner.media")}
                leftSection={<IconDeviceTv size={20} stroke={1.5} />}
                active={pathname?.includes("/media-owner/locations")}
            />
        ),
        (permissions.includes("create:media")) && (
            <NavLink
                key="proof"
                component={Link}
                href="/dashboard/media-owner/proof"
                label={t("media-owner.proof")}
                leftSection={<IconFileDescription size={20} stroke={1.5} />}
                active={pathname?.endsWith("/media-owner/proof")}
            />
        ),
        (permissions.includes("update:reservation")) && (
            <NavLink
                key="requests"
                component={Link}
                href="/dashboard/media-owner/ad-requests"
                label={t("media-owner.adRequests")}
                leftSection={<IconInbox size={20} stroke={1.5} />}
                active={pathname?.includes("/dashboard/media-owner/ad-requests")}
            />
        )
    ].filter(Boolean);

    const advertiserNavItems = [
        (permissions.includes('read:campaign')) && (
            <NavLink
                key="metricOverview"
                component={Link}
                href="/dashboard/advertiser/metrics"
                label={t("advertiser.metricOverview")}
                leftSection={<IconChartDots size={20} stroke={1.5} />}
                active={pathname === "/dashboard/advertiser/metrics"}
            />
        ),
        (permissions.includes('read:campaign')) && (
            <NavLink
                key="campaigns"
                component={Link}
                href="/dashboard/advertiser/campaigns"
                label={t("advertiser.myAds")}
                leftSection={<IconAd size={20} stroke={1.5} />}
                active={pathname?.endsWith("/advertiser/campaigns")}
            />
        ),
        (permissions.includes('readAll:reservation')) && (
            <NavLink
                key="advertisements"
                component={Link}
                href="/dashboard/advertiser/advertisements"
                label={t("advertiser.advertisements")}
                leftSection={<IconSpeakerphone size={20} stroke={1.5} />}
                active={pathname?.endsWith("/advertiser/advertisements")}
            />
        )
    ].filter(Boolean);

    const adminNavItems = [
        (permissions.includes('update:verification')) && ( //temporarily, this page is scheduled to be removed.
            <NavLink
                key="pendingMedia"
                component={Link}
                href="/dashboard/admin/media/pending"
                label={t("admin.pendingMedia")}
                leftSection={<IconShieldCheck size={20} stroke={1.5} />}
                active={pathname?.includes("/dashboard/admin/media/pending")}
            />
        ),

        (permissions.includes('update:verification')) && (
            <NavLink
                key="pendingOrganizations"
                component={Link}
                href="/dashboard/admin/organization/verification"
                label={t("admin.pendingOrganizations")}
                leftSection={<IconDiscountCheck size={20} stroke={1.5} />}
                active={pathname?.includes("/dashboard/admin/organization/verification")}
            />
        )
    ].filter(Boolean);

    return (
        <Accordion
            multiple
            variant="separated"

            defaultValue={["organization", "media-owner", "advertiser", "admin"]}
        >
            {advertiserNavItems.length > 0 &&
                <Accordion.Item value="advertiser">
                    <Accordion.Control>{t("advertiserTitle")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            {advertiserNavItems}
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            }

            {mediaOwnerNavItems.length > 0 &&
                <Accordion.Item value="media-owner">
                    <Accordion.Control>{t("mediaOwnerTitle")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            {mediaOwnerNavItems}
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            }

            {adminNavItems.length == 0 &&
                <Accordion.Item value="organization">
                    <Accordion.Control>{t("organizationTitle")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            <NavLink
                                key="organizationOverview"
                                component={Link}
                                href="/dashboard/organization/overview"
                                label={t("organization.overview")}
                                leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
                                active={pathname?.endsWith("/organization/overview")}
                            />

                            {(permissions.includes('read:employee')) &&
                                <NavLink
                                    key="employees"
                                    component={Link}
                                    href="/dashboard/organization/employees"
                                    label={t("organization.employees")}
                                    leftSection={<IconUsers size={20} stroke={1.5} />}
                                    active={pathname?.endsWith("/organization/employees")}
                                />
                            }
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            }

            {adminNavItems.length > 0 &&
                <Accordion.Item value="admin">
                    <Accordion.Control>{t("adminTitle")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            {adminNavItems}
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            }
        </Accordion>
    )
}
