import { useState, useCallback, useEffect } from "react";
import { BusinessResponse } from "@/types/BusinessTypes";
import { getAllBusinesses } from "@/services/BusinessService";

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

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    return { businesses, loading, error, refreshBusinesses: fetchBusinesses };
}
