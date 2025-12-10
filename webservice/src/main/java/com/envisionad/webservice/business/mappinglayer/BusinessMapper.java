package com.envisionad.webservice.business.mappinglayer;

import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.presentationlayer.models.AddressResponseModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import org.springframework.stereotype.Component;

@Component
public class BusinessMapper {

    public Business requestModelToEntity(BusinessRequestModel requestModel) {
        Address address = new Address(
                requestModel.getAddress().getStreet(),
                requestModel.getAddress().getCity(),
                requestModel.getAddress().getState(),
                requestModel.getAddress().getZipCode(),
                requestModel.getAddress().getCountry()
        );

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
        response.setEmployees(business.getEmployeeIds());

        if (business.getAddress() != null) {
            AddressResponseModel addressModel = new AddressResponseModel();
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
