import { Stack, NavLink, Badge } from "@mantine/core";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { IconLayoutDashboard, IconDeviceTv, IconAd, IconFileDescription, IconCurrencyDollar } from "@tabler/icons-react";

interface DashboardSidebarProps {
    adRequestsCount?: number;
}

export function DashboardSidebar({ adRequestsCount = 0 }: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <Stack gap="xs">
            <NavLink
                component={Link}
                href="/dashboard/overview"
                label="Overview"
                leftSection={<IconLayoutDashboard size={20} stroke={1.5} />}
                active={pathname?.includes("/overview")}
            />
            <NavLink
                component={Link}
                href="/dashboard"
                label="Media"
                leftSection={<IconDeviceTv size={20} stroke={1.5} />}
                active={pathname === "/dashboard" || pathname?.endsWith("/dashboard")}
            />
            <NavLink
                component={Link}
                href="/dashboard/displayed-ads"
                label="Displayed ads"
                leftSection={<IconAd size={20} stroke={1.5} />}
                active={pathname?.includes("/displayed-ads")}
            />
            <NavLink
                component={Link}
                href="/dashboard/ad-requests"
                label="Ad requests"
                leftSection={<IconFileDescription size={20} stroke={1.5} />}
                active={pathname?.includes("/ad-requests")}
                rightSection={
                    <Badge size="sm" color="blue" variant="filled">
                        {adRequestsCount}
                    </Badge>
                }
            />
            <NavLink
                component={Link}
                href="/dashboard/transactions"
                label="Transactions"
                leftSection={<IconCurrencyDollar size={20} stroke={1.5} />}
                active={pathname?.includes("/transactions")}
            />
        </Stack>
    );
}
