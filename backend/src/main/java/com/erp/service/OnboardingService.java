package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OnboardingService {

    @Autowired
    private OnboardingPlanRepository planRepository;

    @Autowired
    private OnboardingTaskRepository taskRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<OnboardingPlan> findAllPlans() {
        return planRepository.findAll();
    }

    public Optional<OnboardingPlan> findPlanById(Long id) {
        return planRepository.findById(id);
    }

    public Optional<OnboardingPlan> findPlanByEmployee(Long employeeId) {
        return planRepository.findByEmployeeId(employeeId);
    }

    public List<OnboardingPlan> findPlansByStatus(String status) {
        return planRepository.findByStatus(status);
    }

    public List<OnboardingPlan> findOverduePlans() {
        return planRepository.findOverduePlans(LocalDate.now());
    }

    public List<OnboardingPlan> findIncompletePlans() {
        return planRepository.findIncompletePlans();
    }

    @Transactional
    public OnboardingPlan createPlan(Map<String, Object> data) {
        OnboardingPlan plan = new OnboardingPlan();
        plan.setPlanNumber(generatePlanNumber());
        updatePlanFromMap(plan, data);
        plan.setStatus("NOT_STARTED");
        plan.setProgressPercentage(0);
        return planRepository.save(plan);
    }

    private String generatePlanNumber() {
        String prefix = "ONB";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = planRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    @Transactional
    public OnboardingPlan updatePlan(Long id, Map<String, Object> data) {
        OnboardingPlan plan = planRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Onboarding plan not found"));
        updatePlanFromMap(plan, data);
        return planRepository.save(plan);
    }

    private void updatePlanFromMap(OnboardingPlan plan, Map<String, Object> data) {
        if (data.containsKey("employeeId") && data.get("employeeId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("employeeId").toString())).ifPresent(plan::setEmployee);
        }
        if (data.containsKey("buddyId") && data.get("buddyId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("buddyId").toString())).ifPresent(plan::setBuddy);
        }
        if (data.containsKey("hrManagerId") && data.get("hrManagerId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("hrManagerId").toString())).ifPresent(plan::setHrCoordinator);
        }
        if (data.containsKey("startDate") && data.get("startDate") != null) {
            plan.setStartDate(LocalDate.parse((String) data.get("startDate")));
        }
        if (data.containsKey("targetCompletionDate") && data.get("targetCompletionDate") != null) {
            plan.setTargetCompletionDate(LocalDate.parse((String) data.get("targetCompletionDate")));
        }
        if (data.containsKey("welcomeMessage")) plan.setWelcomeMessage((String) data.get("welcomeMessage"));
        if (data.containsKey("notes")) plan.setNotes((String) data.get("notes"));
    }

    @Transactional
    public OnboardingPlan startPlan(Long id) {
        OnboardingPlan plan = planRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Onboarding plan not found"));
        plan.setStatus("IN_PROGRESS");
        plan.setStartDate(LocalDate.now());
        return planRepository.save(plan);
    }

    @Transactional
    public OnboardingPlan completePlan(Long id) {
        OnboardingPlan plan = planRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Onboarding plan not found"));
        plan.setStatus("COMPLETED");
        plan.setActualCompletionDate(LocalDate.now());
        plan.setProgressPercentage(100);
        return planRepository.save(plan);
    }

    @Transactional
    public void deletePlan(Long id) {
        taskRepository.findByOnboardingPlanId(id).forEach(task -> taskRepository.delete(task));
        planRepository.deleteById(id);
    }

    public List<OnboardingTask> findTasksByPlan(Long planId) {
        return taskRepository.findByOnboardingPlanId(planId);
    }

    public Optional<OnboardingTask> findTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public List<OnboardingTask> findTasksByAssignee(Long employeeId) {
        return taskRepository.findByAssignedToId(employeeId);
    }

    public List<OnboardingTask> findPendingTasksForEmployee(Long employeeId) {
        return taskRepository.findPendingTasksForEmployee(employeeId);
    }

    public List<OnboardingTask> findOverdueTasks() {
        return taskRepository.findOverdueTasks(LocalDate.now());
    }

    @Transactional
    public OnboardingTask createTask(Map<String, Object> data) {
        OnboardingTask task = new OnboardingTask();
        updateTaskFromMap(task, data);
        task.setStatus("PENDING");
        OnboardingTask saved = taskRepository.save(task);
        updatePlanProgress(saved.getOnboardingPlan().getId());
        return saved;
    }

    @Transactional
    public OnboardingTask updateTask(Long id, Map<String, Object> data) {
        OnboardingTask task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Onboarding task not found"));
        updateTaskFromMap(task, data);
        OnboardingTask saved = taskRepository.save(task);
        updatePlanProgress(saved.getOnboardingPlan().getId());
        return saved;
    }

    private void updateTaskFromMap(OnboardingTask task, Map<String, Object> data) {
        if (data.containsKey("onboardingPlanId") && data.get("onboardingPlanId") != null) {
            planRepository.findById(Long.valueOf(data.get("onboardingPlanId").toString())).ifPresent(task::setOnboardingPlan);
        }
        if (data.containsKey("title")) task.setTaskName((String) data.get("title"));
        if (data.containsKey("description")) task.setDescription((String) data.get("description"));
        if (data.containsKey("category")) task.setCategory((String) data.get("category"));
        if (data.containsKey("sequenceOrder")) task.setSortOrder(Integer.valueOf(data.get("sequenceOrder").toString()));
        if (data.containsKey("assignedToId") && data.get("assignedToId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("assignedToId").toString())).ifPresent(task::setAssignedTo);
        }
        if (data.containsKey("dueDate") && data.get("dueDate") != null) {
            task.setDueDate(LocalDate.parse((String) data.get("dueDate")));
        }
        if (data.containsKey("mandatory")) task.setIsMandatory((Boolean) data.get("mandatory"));
        if (data.containsKey("requiresSignature")) task.setRequiresSignature((Boolean) data.get("requiresSignature"));
        if (data.containsKey("documentUrl")) task.setAttachmentUrl((String) data.get("documentUrl"));
        if (data.containsKey("notes")) task.setCompletionNotes((String) data.get("notes"));
    }

    @Transactional
    public OnboardingTask startTask(Long id) {
        OnboardingTask task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Onboarding task not found"));
        task.setStatus("IN_PROGRESS");
        return taskRepository.save(task);
    }

    @Transactional
    public OnboardingTask completeTask(Long id, Long completedById) {
        OnboardingTask task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Onboarding task not found"));
        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        if (completedById != null) {
            employeeRepository.findById(completedById).ifPresent(task::setCompletedBy);
        }
        OnboardingTask saved = taskRepository.save(task);
        updatePlanProgress(saved.getOnboardingPlan().getId());
        return saved;
    }

    @Transactional
    public void deleteTask(Long id) {
        OnboardingTask task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Onboarding task not found"));
        Long planId = task.getOnboardingPlan().getId();
        taskRepository.deleteById(id);
        updatePlanProgress(planId);
    }

    private void updatePlanProgress(Long planId) {
        Long total = taskRepository.countTotalTasksByPlanId(planId);
        Long completed = taskRepository.countCompletedTasksByPlanId(planId);
        if (total > 0) {
            int percentage = (int) ((completed * 100) / total);
            OnboardingPlan plan = planRepository.findById(planId).orElse(null);
            if (plan != null) {
                plan.setProgressPercentage(percentage);
                plan.setTotalTasks(total.intValue());
                plan.setCompletedTasks(completed.intValue());
                if (percentage == 100) {
                    plan.setStatus("COMPLETED");
                    plan.setActualCompletionDate(LocalDate.now());
                }
                planRepository.save(plan);
            }
        }
    }

    @Transactional
    public OnboardingPlan createDefaultOnboardingPlan(Employee employee, Employee buddy, Employee hrManager) {
        OnboardingPlan plan = new OnboardingPlan();
        plan.setEmployee(employee);
        plan.setBuddy(buddy);
        plan.setHrCoordinator(hrManager);
        plan.setStartDate(employee.getJoiningDate() != null ? employee.getJoiningDate() : LocalDate.now());
        plan.setTargetCompletionDate(plan.getStartDate().plusDays(30));
        plan.setStatus("NOT_STARTED");
        plan.setProgressPercentage(0);
        plan.setWelcomeMessage("Welcome to the team! We're excited to have you on board.");
        OnboardingPlan savedPlan = planRepository.save(plan);

        createDefaultTasks(savedPlan, hrManager);

        return savedPlan;
    }

    private void createDefaultTasks(OnboardingPlan plan, Employee hrManager) {
        createTask(plan, "Complete HR documentation", "HR_DOCUMENTATION", 1, hrManager, true, true);
        createTask(plan, "ID card and access setup", "IT_SETUP", 2, null, true, false);
        createTask(plan, "Workstation and equipment setup", "IT_SETUP", 3, null, true, false);
        createTask(plan, "Email and system accounts creation", "IT_SETUP", 4, null, true, false);
        createTask(plan, "Company policies orientation", "ORIENTATION", 5, hrManager, true, false);
        createTask(plan, "Team introduction", "ORIENTATION", 6, null, false, false);
        createTask(plan, "Department walkthrough", "ORIENTATION", 7, null, false, false);
        createTask(plan, "Benefits enrollment", "HR_DOCUMENTATION", 8, hrManager, true, true);
        createTask(plan, "Emergency contact information", "HR_DOCUMENTATION", 9, hrManager, true, true);
        createTask(plan, "Bank account details for payroll", "HR_DOCUMENTATION", 10, hrManager, true, true);
    }

    private void createTask(OnboardingPlan plan, String title, String category, int order, Employee assignee, boolean mandatory, boolean requiresSignature) {
        OnboardingTask task = new OnboardingTask();
        task.setOnboardingPlan(plan);
        task.setTaskName(title);
        task.setCategory(category);
        task.setSortOrder(order);
        task.setAssignedTo(assignee);
        task.setDueDate(plan.getStartDate().plusDays(order * 2));
        task.setIsMandatory(mandatory);
        task.setRequiresSignature(requiresSignature);
        task.setStatus("PENDING");
        taskRepository.save(task);
    }

    public Map<String, Object> getOnboardingDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("activePlans", planRepository.findByStatus("IN_PROGRESS").size());
        dashboard.put("overduePlans", planRepository.findOverduePlans(LocalDate.now()).size());
        dashboard.put("completedPlans", planRepository.findByStatus("COMPLETED").size());
        dashboard.put("pendingTasks", taskRepository.findByStatus("PENDING").size());
        dashboard.put("overdueTasks", taskRepository.findOverdueTasks(LocalDate.now()).size());
        return dashboard;
    }
}
