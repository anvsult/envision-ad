import { NavLink, Stack, Accordion } from "@mantine/core";
import { Link, usePathname } from "@/shared/lib/i18n/navigation";
import {
    IconAd,
    IconDeviceTv,
    IconLayoutDashboard,
    IconUsers,
    IconShieldCheck, IconDiscountCheck,
} from "@tabler/icons-react";
import {useTranslations} from "next-intl";
import {usePermissions} from "@/app/providers/PermissionProvider";

export default function SideBar() {
    const { permissions } = usePermissions();
    const pathname = usePathname();
    const t = useTranslations("sideBar");

    const mediaOwnerNavItems = [
        (permissions.includes('create:media')) && (
            <NavLink
                key="media"
                component={Link}
                href="/dashboard/media-owner/media"
                label={t("media-owner.media")}
                leftSection={<IconDeviceTv size={20} stroke={1.5} />}
                active={pathname?.endsWith("/media-owner/media")}
            />
        ),
    ].filter(Boolean);

    const advertiserNavItems = [
        (permissions.includes('read:campaign')) && (
                <NavLink
                    key="campaigns"
                    component={Link}
                    href="/dashboard/advertiser/campaigns"
                    label={t("advertiser.myAds")}
                    leftSection={<IconAd size={20} stroke={1.5} />}
                    active={pathname?.endsWith("/advertiser/campaigns")}
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
            { advertiserNavItems.length > 0 &&
                <Accordion.Item value="advertiser">
                    <Accordion.Control>{t("advertiserTitle")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            {advertiserNavItems}
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            }

            { mediaOwnerNavItems.length > 0 &&
                <Accordion.Item value="media-owner">
                    <Accordion.Control>{t("mediaOwnerTitle")}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack gap="xs">
                            {mediaOwnerNavItems}
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            }

            { adminNavItems.length == 0 &&
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

                            { (permissions.includes('read:employee')) &&
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

            { adminNavItems.length > 0 &&
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
