package com.envisionad.webservice.business.dataaccesslayer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    List<Employee> findAllByBusinessId_BusinessId(String businessId);
    Employee findByUserId(String employeeId);
    boolean existsByUserIdAndBusinessId_BusinessId(String userId, String businessId);
    boolean existsByUserId(String userId);
}
