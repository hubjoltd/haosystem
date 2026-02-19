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
                    case "projectCode" -> project.setProjectCode((String) value);
                    case "status" -> project.setStatus((String) value);
                    case "billingType" -> project.setBillingType((String) value);
                    case "progress" -> project.setProgress(value == null ? null : (value instanceof Integer ? (Integer) value : Integer.parseInt(value.toString())));
                    case "archived" -> project.setArchived(value == null ? null : (Boolean) value);
                    case "startDate" -> project.setStartDate(value == null ? null : java.time.LocalDate.parse(value.toString()));
                    case "endDate" -> project.setEndDate(value == null ? null : java.time.LocalDate.parse(value.toString()));
                    case "deadline" -> project.setDeadline(value == null ? null : java.time.LocalDate.parse(value.toString()));
                    case "estimatedHours" -> project.setEstimatedHours(value == null ? null : new java.math.BigDecimal(value.toString()));
                    case "estimatedCost" -> project.setEstimatedCost(value == null ? null : new java.math.BigDecimal(value.toString()));
                    case "hourlyRate" -> project.setHourlyRate(value == null ? null : new java.math.BigDecimal(value.toString()));
                    case "fixedRateAmount" -> project.setFixedRateAmount(value == null ? null : new java.math.BigDecimal(value.toString()));
                    case "currency" -> project.setCurrency((String) value);
                    case "tags" -> project.setTags((String) value);
                    case "calculatedProgress" -> project.setCalculatedProgress((String) value);
                    case "locationTrackingEnabled" -> project.setLocationTrackingEnabled(value == null ? null : (Boolean) value);
                    case "locationLatitude" -> project.setLocationLatitude(value == null ? null : Double.parseDouble(value.toString()));
                    case "locationLongitude" -> project.setLocationLongitude(value == null ? null : Double.parseDouble(value.toString()));
                    case "locationRadiusMeters" -> project.setLocationRadiusMeters(value == null ? null : (value instanceof Integer ? (Integer) value : Integer.parseInt(value.toString())));
                    case "locationAddress" -> project.setLocationAddress((String) value);
                    case "allowCustomerViewProject" -> project.setAllowCustomerViewProject(value == null ? null : (Boolean) value);
                    case "allowCustomerViewTasks" -> project.setAllowCustomerViewTasks(value == null ? null : (Boolean) value);
                    case "allowCustomerCommentTasks" -> project.setAllowCustomerCommentTasks(value == null ? null : (Boolean) value);
                    case "allowCustomerViewTaskComments" -> project.setAllowCustomerViewTaskComments(value == null ? null : (Boolean) value);
                    case "allowCustomerViewTimesheets" -> project.setAllowCustomerViewTimesheets(value == null ? null : (Boolean) value);
                    case "allowCustomerViewFiles" -> project.setAllowCustomerViewFiles(value == null ? null : (Boolean) value);
                    case "allowCustomerUploadFiles" -> project.setAllowCustomerUploadFiles(value == null ? null : (Boolean) value);
                    case "allowCustomerViewDiscussions" -> project.setAllowCustomerViewDiscussions(value == null ? null : (Boolean) value);
                    case "billableTasks" -> project.setBillableTasks(value == null ? null : (Boolean) value);
                    case "invoiceProject" -> project.setInvoiceProject(value == null ? null : (Boolean) value);
                    case "invoiceTasks" -> project.setInvoiceTasks(value == null ? null : (Boolean) value);
                    case "invoiceTimesheets" -> project.setInvoiceTimesheets(value == null ? null : (Boolean) value);
                    case "customerId" -> {
                        if (value != null) {
                            Long custId = Long.parseLong(value.toString());
                            customerRepository.findById(custId).ifPresent(project::setCustomer);
                        } else {
                            project.setCustomer(null);
                        }
                    }
                    case "projectManagerId" -> {
                        if (value != null) {
                            Long mgrId = Long.parseLong(value.toString());
                            employeeRepository.findById(mgrId).ifPresent(project::setProjectManager);
                        } else {
                            project.setProjectManager(null);
                        }
                    }
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
