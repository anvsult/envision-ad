"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface PermissionsContextType {
    permissions: string[];
    refreshPermissions: () => Promise<void>;
    loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useUser(); // Check if user is logged in

    const fetchPermissions = useCallback(async () => {
        if (!user) {
            setPermissions([]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/permissions');

            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }

            const data = await response.json();
            setPermissions(data.permissions);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const refreshPermissions = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            await fetch('/api/auth0/token', { method: 'POST' });
            await fetchPermissions();
        } catch (error) {
            console.error('Failed to refresh permissions:', error);
            setLoading(false);
        }
    }, [fetchPermissions, user]);

    useEffect(() => {
        if (!isLoading) {
            fetchPermissions();
        }
    }, [isLoading, fetchPermissions]);

    return (
        <PermissionsContext.Provider value={{ permissions, refreshPermissions, loading: loading || isLoading }}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within PermissionsProvider');
    }
    return context;
}