package com.envisionad.webservice.business.mappinglayer;

import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.springframework.stereotype.Component;

@Component
public class BusinessResponseMapper {

    public Business requestModelToEntity(BusinessRequestModel requestModel) {
        Address address = new Address(
                requestModel.getStreet(),
                requestModel.getCity(),
                requestModel.getState(),
                requestModel.getZipCode(),
                requestModel.getCountry());

        Business business = new Business();
        business.setName(requestModel.getName());
        business.setCompanySize(requestModel.getCompanySize());
        business.setAddress(address);

        return business;
    }

    public BusinessResponseModel entityToResponseModel(Business business) {
        BusinessResponseModel response = new BusinessResponseModel();
        response.setId(business.getId());
        response.setName(business.getName());
        response.setCompanySize(business.getCompanySize());
        response.setDateCreated(business.getDateCreated());

        if (business.getAddress() != null) {
            BusinessResponseModel.AddressResponseModel addressModel = new BusinessResponseModel.AddressResponseModel();
            addressModel.setId(business.getAddress().getId());
            addressModel.setStreet(business.getAddress().getStreet());
            addressModel.setCity(business.getAddress().getCity());
            addressModel.setState(business.getAddress().getState());
            addressModel.setZipCode(business.getAddress().getZipCode());
            addressModel.setCountry(business.getAddress().getCountry());

            response.setAddress(addressModel);
        }

        return response;
    }
}
