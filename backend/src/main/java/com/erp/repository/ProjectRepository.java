package com.erp.repository;

import com.erp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String projectCode);
    List<Project> findByDeletedFalseOrderByCreatedAtDesc();
    List<Project> findByStatusAndDeletedFalse(String status);
    List<Project> findByCustomerIdAndDeletedFalse(Long customerId);
    List<Project> findByArchivedTrueAndDeletedFalse();
}
