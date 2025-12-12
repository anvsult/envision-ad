import { useState, useCallback, useEffect } from "react";
import { BusinessResponse, BusinessRequest } from "@/entities/businesses/model";
import { getAllBusinesses, getBusinessById, updateBusiness, deleteBusiness } from "@/entities/businesses/api";

export function useBusinessList() {
    const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllBusinesses();
            setBusinesses(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBusinessById = useCallback(async (id: string | number) => {
        return await getBusinessById(id);
    }, []);

    const editBusiness = useCallback(async (id: string | number, data: BusinessRequest) => {
        await updateBusiness(id, data);
        await fetchBusinesses();
    }, [fetchBusinesses]);

    const deleteBusinessById = useCallback(async (id: string | number) => {
        await deleteBusiness(id);
        await fetchBusinesses();
    }, [fetchBusinesses]);

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    return { 
        businesses, 
        loading, 
        error, 
        refreshBusinesses: fetchBusinesses,
        fetchBusinessById,
        editBusiness,
        deleteBusinessById
    };
}
