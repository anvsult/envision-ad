"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {getEmployeeOrganization} from "@/features/organization-management/api";
import {OrganizationResponseDTO} from "@/entities/organization";
import { useRouter} from "next/navigation";
import { useLocale } from "next-intl";

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
    const router = useRouter();
    const locale = useLocale();

    const fetchOrganization = useCallback(async () => {
        if (!user) {
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
                router.push(`/${locale}/dashboard`);
            } else {
                console.error('Failed to fetch organization:', error);
                setOrganization(null);
            }
        } finally {
            setLoading(false);
        }
    }, [user, router, locale]);

    const refreshOrganization = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            await fetchOrganization();
        } catch (error) {
            console.error('Failed to refresh organization:', error);
            setLoading(false);
        }
    }, [fetchOrganization, user]);

    useEffect(() => {
        if (!isLoading) {
            fetchOrganization();
        }
    }, [isLoading, fetchOrganization]);

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
