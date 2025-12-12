package com.envisionad.webservice.business.mappinglayer;

import com.envisionad.webservice.business.dataaccesslayer.Address;
import com.envisionad.webservice.business.dataaccesslayer.Business;
import com.envisionad.webservice.business.dataaccesslayer.BusinessIdentifier;
import com.envisionad.webservice.business.dataaccesslayer.Roles;
import com.envisionad.webservice.business.presentationlayer.models.AddressResponseModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessRequestModel;
import com.envisionad.webservice.business.presentationlayer.models.BusinessResponseModel;
import com.envisionad.webservice.business.presentationlayer.models.RoleResponseModel;
import org.springframework.stereotype.Component;

@Component
public class BusinessModelMapper {

    public Business requestModelToEntity(BusinessRequestModel requestModel) {
        Address address = new Address(
                requestModel.getAddress().getStreet(),
                requestModel.getAddress().getCity(),
                requestModel.getAddress().getState(),
                requestModel.getAddress().getZipCode(),
                requestModel.getAddress().getCountry()
        );

        Roles roles = new Roles(
                requestModel.getRoles().isMediaOwner(),
                requestModel.getRoles().isAdvertiser()
        );

        Business business = new Business();
        business.setBusinessId(new BusinessIdentifier());
        business.setName(requestModel.getName());
        business.setCompanySize(requestModel.getCompanySize());
        business.setAddress(address);
        business.setRoles(roles);

        return business;
    }

    public BusinessResponseModel entityToResponseModel(Business business) {
        BusinessResponseModel response = new BusinessResponseModel();
        response.setBusinessId(business.getBusinessId().getBusinessId());
        response.setName(business.getName());
        response.setCompanySize(business.getCompanySize());
        response.setDateCreated(business.getDateCreated());
        response.setEmployees(business.getEmployeeIds());
        response.setOwner(business.getOwnerId());

        AddressResponseModel addressModel = new AddressResponseModel();
        addressModel.setStreet(business.getAddress().getStreet());
        addressModel.setCity(business.getAddress().getCity());
        addressModel.setState(business.getAddress().getState());
        addressModel.setZipCode(business.getAddress().getZipCode());
        addressModel.setCountry(business.getAddress().getCountry());
        response.setAddress(addressModel);

        RoleResponseModel roleModel = new RoleResponseModel();
        roleModel.setAdvertiser(business.getRoles().isAdvertiser());
        roleModel.setMediaOwner(business.getRoles().isMediaOwner());
        response.setRoles(roleModel);

        return response;
    }
}
