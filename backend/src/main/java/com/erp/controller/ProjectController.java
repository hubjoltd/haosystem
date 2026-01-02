package com.erp.controller;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository memberRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    @Autowired
    private ProjectMilestoneRepository milestoneRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findByDeletedFalseOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        if (project.getProjectCode() == null || project.getProjectCode().isEmpty()) {
            project.setProjectCode(generateProjectCode());
        }
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return projectRepository.findById(id).map(project -> {
            updates.forEach((key, value) -> {
                switch (key) {
                    case "name" -> project.setName((String) value);
                    case "description" -> project.setDescription((String) value);
                    case "status" -> project.setStatus((String) value);
                    case "billingType" -> project.setBillingType((String) value);
                    case "progress" -> project.setProgress(value instanceof Integer ? (Integer) value : Integer.parseInt(value.toString()));
                    case "archived" -> project.setArchived((Boolean) value);
                }
            });
            return ResponseEntity.ok(projectRepository.save(project));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        return projectRepository.findById(id).map(project -> {
            project.setDeleted(true);
            projectRepository.save(project);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{projectId}/members")
    public List<ProjectMember> getProjectMembers(@PathVariable Long projectId) {
        return memberRepository.findByProjectId(projectId);
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMember> addMember(@PathVariable Long projectId, @RequestBody ProjectMember member) {
        return projectRepository.findById(projectId).map(project -> {
            member.setProject(project);
            return ResponseEntity.ok(memberRepository.save(member));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, @PathVariable Long memberId) {
        memberRepository.deleteById(memberId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{projectId}/tasks")
    public List<ProjectTask> getProjectTasks(@PathVariable Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<ProjectTask> addTask(@PathVariable Long projectId, @RequestBody ProjectTask task) {
        return projectRepository.findById(projectId).map(project -> {
            task.setProject(project);
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<ProjectTask> updateTask(@PathVariable Long projectId, @PathVariable Long taskId, @RequestBody ProjectTask task) {
        return taskRepository.findById(taskId).map(existing -> {
            existing.setName(task.getName());
            existing.setDescription(task.getDescription());
            existing.setStatus(task.getStatus());
            existing.setPriority(task.getPriority());
            existing.setDueDate(task.getDueDate());
            existing.setEstimatedHours(task.getEstimatedHours());
            existing.setBillable(task.getBillable());
            existing.setVisibleToClient(task.getVisibleToClient());
            return ResponseEntity.ok(taskRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long projectId, @PathVariable Long taskId) {
        taskRepository.deleteById(taskId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{projectId}/milestones")
    public List<ProjectMilestone> getProjectMilestones(@PathVariable Long projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }

    @PostMapping("/{projectId}/milestones")
    public ResponseEntity<ProjectMilestone> addMilestone(@PathVariable Long projectId, @RequestBody ProjectMilestone milestone) {
        return projectRepository.findById(projectId).map(project -> {
            milestone.setProject(project);
            return ResponseEntity.ok(milestoneRepository.save(milestone));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long projectId, @PathVariable Long milestoneId) {
        milestoneRepository.deleteById(milestoneId);
        return ResponseEntity.ok().build();
    }

    private String generateProjectCode() {
        long count = projectRepository.count() + 1;
        return String.format("PRJ-%06d", count);
    }
}
