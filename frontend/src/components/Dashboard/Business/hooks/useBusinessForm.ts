import {useState} from "react";
import {BusinessRequest, CompanySize} from "@/types/BusinessTypes";

export function useBusinessForm() {
    const initialState: BusinessRequest = {
        name: "",
        owner: "",
        companySize: CompanySize.SMALL,

        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
        },

        roles: {
            advertiser: false,
            mediaOwner: false,
        },
    };

    const [formState, setFormState] = useState<BusinessRequest>(initialState);

    const updateField = <K extends keyof BusinessRequest>(
        key: K,
        value: BusinessRequest[K]
    ) => {
        setFormState(prev => ({
            ...prev,
            [key]: value,
        }));
    };


    const resetForm = () => {
        setFormState(initialState);
    };

    return {formState, updateField, resetForm, setFormState};
}
