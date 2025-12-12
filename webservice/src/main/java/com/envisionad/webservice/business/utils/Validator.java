package com.envisionad.webservice.business.utils;

import com.envisionad.webservice.business.exceptions.InvalidBusinessException;
import com.envisionad.webservice.business.presentationlayer.models.AddressRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.RoleRequestModel;

public class Validator {
    public static void validateBusiness(BusinessRequestModel requestModel) {
        if (requestModel == null || !validateRoles(requestModel) || !validateName(requestModel) || !validateCompanySize(requestModel) || !validateAddress(requestModel))
            throw new InvalidBusinessException();
    }

    private static boolean validateName(BusinessRequestModel requestModel){
        return requestModel.getName() != null && !requestModel.getName().trim().isEmpty();
    }

    private static boolean validateRoles(BusinessRequestModel requestModel) {
        RoleRequestModel roles = requestModel.getRoles();
        if (roles == null) {
            return false;
        }

        return roles.isMediaOwner() || roles.isAdvertiser();
    }

    private static boolean validateCompanySize(BusinessRequestModel requestModel) {
        return requestModel.getCompanySize() != null;
    }

    private static boolean validateAddress(BusinessRequestModel requestModel) {
        AddressRequestModel address = requestModel.getAddress();
        if (address == null) {
            return false;
        }

        return address.getStreet() != null && !address.getStreet().trim().isEmpty()
                && address.getCity() != null && !address.getCity().trim().isEmpty()
                && address.getState() != null && !address.getState().trim().isEmpty()
                && address.getZipCode() != null && !address.getZipCode().trim().isEmpty()
                && address.getCountry() != null && !address.getCountry().trim().isEmpty();
    }
}
