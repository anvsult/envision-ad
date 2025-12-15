package com.envisionad.webservice.business.mappinglayer;

import com.envisionad.webservice.business.dataaccesslayer.Employee;
import com.envisionad.webservice.business.presentationlayer.models.EmployeeResponseModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {
    @Mapping(target = "employeeId", expression = "java(employee.getEmployeeId().getEmployeeId())")
    EmployeeResponseModel toResponse(Employee employee);
}
