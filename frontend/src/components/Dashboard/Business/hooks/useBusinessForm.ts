import { useState } from "react";
import { BusinessRequest, CompanySize } from "@/types/BusinessTypes";

export function useBusinessForm() {
    const initialState: BusinessRequest = {
        name: "",
        companySize: CompanySize.SMALL, // Default value
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
    };

    const [formState, setFormState] = useState<BusinessRequest>(initialState);

    const updateField = <K extends keyof BusinessRequest>(
        field: K,
        value: BusinessRequest[K]
    ) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormState(initialState);
    };

    return { formState, updateField, resetForm, setFormState };
}
