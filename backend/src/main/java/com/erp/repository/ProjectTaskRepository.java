package com.erp.repository;

import com.erp.model.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    List<ProjectTask> findByProjectId(Long projectId);
    List<ProjectTask> findByAssigneeId(Long assigneeId);
    List<ProjectTask> findByProjectIdAndStatus(Long projectId, String status);
}
