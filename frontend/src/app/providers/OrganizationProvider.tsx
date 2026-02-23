"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getEmployeeOrganization } from "@/features/organization-management/api";
import { OrganizationResponseDTO } from "@/entities/organization";
import { useRouter, usePathname } from "@/shared/lib/i18n/navigation";
import { usePermissions } from "@/app/providers/PermissionProvider";

interface OrganizationContextType {
    organization: OrganizationResponseDTO | null;
    refreshOrganization: () => Promise<void>;
    loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [organization, setOrganization] = useState<OrganizationResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useUser();
    const { permissions, loading: permissionsLoading } = usePermissions();
    const router = useRouter();
    const pathname = usePathname();
    const hasRedirected = useRef(false);

    useEffect(() => {
        hasRedirected.current = false;
    }, [user?.sub]);

    const fetchOrganization = useCallback(async () => {
        if (!user || permissionsLoading || (
            permissions.includes('patch:media_status') &&
            permissions.includes('readAll:verification') &&
            permissions.includes('update:verification'))
        ) {
            setOrganization(null);
            setLoading(false);
            return;
        }

        try {
            const business = await getEmployeeOrganization(user.sub);
            setOrganization(business);
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                setOrganization(null);
                if (!hasRedirected.current) {
                    if (!pathname.endsWith('/invite')) {
                        router.push('/dashboard');
                    }
                    hasRedirected.current = true;
                }
            } else {
                console.error('Failed to fetch organization:', error);
                setOrganization(null);
            }
        } finally {
            setLoading(false);
        }
    }, [user, permissions, permissionsLoading, router, pathname]);

    const refreshOrganization = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        await fetchOrganization();
    }, [fetchOrganization, user]);

    useEffect(() => {
        if (!isLoading && !permissionsLoading) {
            void fetchOrganization();
        }
    }, [isLoading, permissionsLoading, fetchOrganization]);

    return (
        <OrganizationContext.Provider value={{ organization, refreshOrganization, loading: loading || isLoading }}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within OrganizationProvider');
    }
    return context;
}