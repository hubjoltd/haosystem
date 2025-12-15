package com.erp.repository;

import com.erp.model.JobRole;
import com.erp.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, Long> {
    Optional<JobRole> findByCode(String code);
    Optional<JobRole> findByTitle(String title);
    List<JobRole> findByActiveTrue();
    List<JobRole> findByDepartment(Department department);
}
