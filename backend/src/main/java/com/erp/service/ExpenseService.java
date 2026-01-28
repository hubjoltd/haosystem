package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRequestRepository expenseRequestRepository;

    @Autowired
    private ExpenseItemRepository expenseItemRepository;

    @Autowired
    private ExpenseCategoryRepository expenseCategoryRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CostCenterRepository costCenterRepository;

    @Autowired
    private PayrollRecordRepository payrollRecordRepository;

    public List<ExpenseCategory> findAllCategories() {
        return expenseCategoryRepository.findAll();
    }

    public List<ExpenseCategory> findActiveCategories() {
        return expenseCategoryRepository.findByActiveOrderByDisplayOrderAsc(true);
    }

    public Optional<ExpenseCategory> findCategoryById(Long id) {
        return expenseCategoryRepository.findById(id);
    }

    @Transactional
    public ExpenseCategory saveCategory(ExpenseCategory category) {
        return expenseCategoryRepository.save(category);
    }

    @Transactional
    public ExpenseCategory createCategory(Map<String, Object> data) {
        ExpenseCategory category = new ExpenseCategory();
        updateCategoryFromMap(category, data);
        return expenseCategoryRepository.save(category);
    }

    @Transactional
    public ExpenseCategory updateCategory(Long id, Map<String, Object> data) {
        ExpenseCategory category = expenseCategoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense category not found"));
        updateCategoryFromMap(category, data);
        return expenseCategoryRepository.save(category);
    }

    private void updateCategoryFromMap(ExpenseCategory category, Map<String, Object> data) {
        if (data.containsKey("code")) category.setCode((String) data.get("code"));
        if (data.containsKey("name")) category.setName((String) data.get("name"));
        if (data.containsKey("description")) category.setDescription((String) data.get("description"));
        if (data.containsKey("expenseType")) category.setExpenseType((String) data.get("expenseType"));
        if (data.containsKey("requiresReceipt")) category.setRequiresReceipt((Boolean) data.get("requiresReceipt"));
        if (data.containsKey("maxAmount") && data.get("maxAmount") != null) {
            category.setMaxAmount(new BigDecimal(data.get("maxAmount").toString()));
        }
        if (data.containsKey("requiresApproval")) category.setRequiresApproval((Boolean) data.get("requiresApproval"));
        if (data.containsKey("accountCode")) category.setAccountCode((String) data.get("accountCode"));
        if (data.containsKey("displayOrder") && data.get("displayOrder") != null) {
            category.setDisplayOrder(Integer.valueOf(data.get("displayOrder").toString()));
        }
        if (data.containsKey("active")) category.setActive((Boolean) data.get("active"));
        if (data.containsKey("parentId") && data.get("parentId") != null) {
            Long parentId = Long.valueOf(data.get("parentId").toString());
            expenseCategoryRepository.findById(parentId).ifPresent(category::setParent);
        }
    }

    @Transactional
    public void deleteCategoryById(Long id) {
        expenseCategoryRepository.deleteById(id);
    }

    public List<ExpenseRequest> findAllRequests() {
        return expenseRequestRepository.findAll();
    }

    public Optional<ExpenseRequest> findRequestById(Long id) {
        return expenseRequestRepository.findById(id);
    }

    public List<ExpenseRequest> findRequestsByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        return expenseRequestRepository.findByEmployeeOrderByCreatedAtDesc(employee);
    }

    public List<ExpenseRequest> findRequestsByStatus(String status) {
        return expenseRequestRepository.findByStatus(status);
    }

    public List<ExpenseRequest> findPendingApprovals(Long approverId) {
        Employee approver = employeeRepository.findById(approverId)
            .orElseThrow(() -> new RuntimeException("Approver not found"));
        return expenseRequestRepository.findPendingApprovalsByApprover(approver, "PENDING_APPROVAL");
    }

    public List<ExpenseRequest> findPendingReimbursements() {
        return expenseRequestRepository.findPendingReimbursements();
    }

    public List<ExpenseRequest> findApprovedNotPosted() {
        return expenseRequestRepository.findApprovedNotPosted();
    }

    @Transactional
    public ExpenseRequest createRequest(Map<String, Object> data) {
        ExpenseRequest request = new ExpenseRequest();
        
        String requestNumber = generateRequestNumber();
        request.setRequestNumber(requestNumber);
        
        if (data.containsKey("employeeId")) {
            Long employeeId = Long.valueOf(data.get("employeeId").toString());
            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            request.setEmployee(employee);
            
            if (employee.getReportingManager() != null) {
                request.setApprover(employee.getReportingManager());
            }
            
            if (employee.getCostCenter() != null) {
                request.setCostCenter(employee.getCostCenter());
            }
        }
        
        updateRequestFromMap(request, data);
        if (request.getStatus() == null) {
            request.setStatus("DRAFT");
        }
        
        if (request.getTitle() == null || request.getTitle().isEmpty()) {
            request.setTitle("Expense Request " + requestNumber);
        }
        
        ExpenseRequest saved = expenseRequestRepository.save(request);
        
        if (data.containsKey("items")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
            for (Map<String, Object> itemData : items) {
                addItemToRequest(saved, itemData);
            }
            saved.recalculateTotal();
            saved = expenseRequestRepository.save(saved);
        }
        
        return saved;
    }

    @Transactional
    public ExpenseRequest updateRequest(Long id, Map<String, Object> data) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"DRAFT".equals(request.getStatus()) && !"RETURNED".equals(request.getStatus())) {
            throw new RuntimeException("Cannot update expense request in status: " + request.getStatus());
        }
        
        updateRequestFromMap(request, data);
        return expenseRequestRepository.save(request);
    }

    private void updateRequestFromMap(ExpenseRequest request, Map<String, Object> data) {
        if (data.containsKey("title")) request.setTitle((String) data.get("title"));
        if (data.containsKey("description")) request.setDescription((String) data.get("description"));
        if (data.containsKey("expenseDate") && data.get("expenseDate") != null) {
            request.setExpenseDate(LocalDate.parse((String) data.get("expenseDate")));
        }
        if (data.containsKey("periodFrom") && data.get("periodFrom") != null) {
            request.setPeriodFrom(LocalDate.parse((String) data.get("periodFrom")));
        }
        if (data.containsKey("periodTo") && data.get("periodTo") != null) {
            request.setPeriodTo(LocalDate.parse((String) data.get("periodTo")));
        }
        if (data.containsKey("costCenterId") && data.get("costCenterId") != null) {
            Long costCenterId = Long.valueOf(data.get("costCenterId").toString());
            costCenterRepository.findById(costCenterId).ifPresent(request::setCostCenter);
        }
        if (data.containsKey("projectCode")) request.setProjectCode((String) data.get("projectCode"));
        if (data.containsKey("payeeName")) request.setPayeeName((String) data.get("payeeName"));
        if (data.containsKey("categoryId") && data.get("categoryId") != null) {
            Long categoryId = Long.valueOf(data.get("categoryId").toString());
            expenseCategoryRepository.findById(categoryId).ifPresent(request::setCategory);
        }
        if (data.containsKey("reimbursementRequired")) {
            request.setReimbursementRequired((Boolean) data.get("reimbursementRequired"));
        }
        if (data.containsKey("approverId") && data.get("approverId") != null) {
            Long approverId = Long.valueOf(data.get("approverId").toString());
            employeeRepository.findById(approverId).ifPresent(request::setApprover);
        }
        if (data.containsKey("createdBy")) request.setCreatedBy((String) data.get("createdBy"));
        if (data.containsKey("updatedBy")) request.setUpdatedBy((String) data.get("updatedBy"));
        if (data.containsKey("receiptNumber")) request.setReceiptNumber((String) data.get("receiptNumber"));
        if (data.containsKey("receiptUrl")) request.setReceiptUrl((String) data.get("receiptUrl"));
        if (data.containsKey("totalAmount") && data.get("totalAmount") != null) {
            request.setTotalAmount(new BigDecimal(data.get("totalAmount").toString()));
        }
        if (data.containsKey("status") && data.get("status") != null) {
            request.setStatus((String) data.get("status"));
        }
    }

    @Transactional
    public ExpenseItem addItemToRequest(Long requestId, Map<String, Object> itemData) {
        ExpenseRequest request = expenseRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        return addItemToRequest(request, itemData);
    }

    private ExpenseItem addItemToRequest(ExpenseRequest request, Map<String, Object> itemData) {
        ExpenseItem item = new ExpenseItem();
        item.setExpenseRequest(request);
        
        if (itemData.containsKey("categoryId")) {
            Long categoryId = Long.valueOf(itemData.get("categoryId").toString());
            ExpenseCategory category = expenseCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Expense category not found"));
            item.setCategory(category);
        }
        
        if (itemData.containsKey("description")) item.setDescription((String) itemData.get("description"));
        if (itemData.containsKey("expenseDate") && itemData.get("expenseDate") != null) {
            item.setExpenseDate(LocalDate.parse((String) itemData.get("expenseDate")));
        }
        if (itemData.containsKey("vendor")) item.setVendor((String) itemData.get("vendor"));
        if (itemData.containsKey("amount") && itemData.get("amount") != null) {
            item.setAmount(new BigDecimal(itemData.get("amount").toString()));
        }
        if (itemData.containsKey("currency")) item.setCurrency((String) itemData.get("currency"));
        if (itemData.containsKey("quantity") && itemData.get("quantity") != null) {
            item.setQuantity(Integer.valueOf(itemData.get("quantity").toString()));
        }
        if (itemData.containsKey("unitPrice") && itemData.get("unitPrice") != null) {
            item.setUnitPrice(new BigDecimal(itemData.get("unitPrice").toString()));
        }
        if (itemData.containsKey("receiptNumber")) item.setReceiptNumber((String) itemData.get("receiptNumber"));
        if (itemData.containsKey("receiptUrl")) item.setReceiptUrl((String) itemData.get("receiptUrl"));
        if (itemData.containsKey("receiptAttached")) item.setReceiptAttached((Boolean) itemData.get("receiptAttached"));
        if (itemData.containsKey("paymentMethod")) item.setPaymentMethod((String) itemData.get("paymentMethod"));
        if (itemData.containsKey("notes")) item.setNotes((String) itemData.get("notes"));
        if (itemData.containsKey("billable")) item.setBillable((Boolean) itemData.get("billable"));
        if (itemData.containsKey("clientCode")) item.setClientCode((String) itemData.get("clientCode"));
        
        ExpenseItem saved = expenseItemRepository.save(item);
        request.getItems().add(saved);
        request.recalculateTotal();
        expenseRequestRepository.save(request);
        
        return saved;
    }

    @Transactional
    public void removeItemFromRequest(Long requestId, Long itemId) {
        ExpenseRequest request = expenseRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        request.getItems().removeIf(item -> item.getId().equals(itemId));
        expenseItemRepository.deleteById(itemId);
        request.recalculateTotal();
        expenseRequestRepository.save(request);
    }

    @Transactional
    public ExpenseRequest submitRequest(Long id, String submittedBy) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"DRAFT".equals(request.getStatus()) && !"RETURNED".equals(request.getStatus())) {
            throw new RuntimeException("Cannot submit expense request in status: " + request.getStatus());
        }
        
        if (request.getItems().isEmpty()) {
            throw new RuntimeException("Cannot submit expense request without any items");
        }
        
        request.setStatus("PENDING_APPROVAL");
        request.setSubmittedAt(LocalDateTime.now());
        request.setReimbursementStatus("PENDING");
        
        return expenseRequestRepository.save(request);
    }

    @Transactional
    public ExpenseRequest approveRequest(Long id, Map<String, Object> approvalData) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"PENDING_APPROVAL".equals(request.getStatus())) {
            throw new RuntimeException("Cannot approve expense request in status: " + request.getStatus());
        }
        
        BigDecimal approvedAmount = request.getTotalAmount();
        if (approvalData.containsKey("approvedAmount") && approvalData.get("approvedAmount") != null) {
            approvedAmount = new BigDecimal(approvalData.get("approvedAmount").toString());
        }
        
        request.setStatus("APPROVED");
        request.setApprovedAmount(approvedAmount);
        request.setApprovedAt(LocalDateTime.now());
        
        if (approvalData.containsKey("approverRemarks")) {
            request.setApproverRemarks((String) approvalData.get("approverRemarks"));
        }
        
        for (ExpenseItem item : request.getItems()) {
            item.setApproved(true);
            item.setApprovedAmount(item.getAmount());
        }
        
        return expenseRequestRepository.save(request);
    }

    @Transactional
    public ExpenseRequest rejectRequest(Long id, String rejectionReason) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"PENDING_APPROVAL".equals(request.getStatus())) {
            throw new RuntimeException("Cannot reject expense request in status: " + request.getStatus());
        }
        
        request.setStatus("REJECTED");
        request.setRejectedAt(LocalDateTime.now());
        request.setRejectionReason(rejectionReason);
        request.setReimbursementStatus("CANCELLED");
        
        return expenseRequestRepository.save(request);
    }

    @Transactional
    public ExpenseRequest returnRequest(Long id, String returnReason) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"PENDING_APPROVAL".equals(request.getStatus())) {
            throw new RuntimeException("Cannot return expense request in status: " + request.getStatus());
        }
        
        request.setStatus("RETURNED");
        request.setApproverRemarks(returnReason);
        
        return expenseRequestRepository.save(request);
    }

    @Transactional
    public ExpenseRequest markReimbursed(Long id, Long payrollRecordId) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Can only reimburse approved expense requests");
        }
        
        if (payrollRecordId != null) {
            PayrollRecord payrollRecord = payrollRecordRepository.findById(payrollRecordId)
                .orElse(null);
            if (payrollRecord != null) {
                BigDecimal currentReimbursements = payrollRecord.getReimbursements();
                if (currentReimbursements == null) {
                    currentReimbursements = BigDecimal.ZERO;
                }
                payrollRecord.setReimbursements(currentReimbursements.add(request.getApprovedAmount()));
                payrollRecordRepository.save(payrollRecord);
                request.setPayrollRecord(payrollRecord);
            }
        }
        
        request.setReimbursementStatus("COMPLETED");
        request.setReimbursedAt(LocalDateTime.now());
        
        return expenseRequestRepository.save(request);
    }

    @Transactional
    public ExpenseRequest processReimbursementThroughPayroll(Long expenseId, Long employeeId) {
        ExpenseRequest request = expenseRequestRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Can only process reimbursement for approved expenses");
        }
        
        List<PayrollRecord> pendingRecords = payrollRecordRepository.findByEmployeeId(employeeId)
            .stream()
            .filter(r -> "DRAFT".equals(r.getStatus()))
            .toList();
        
        if (!pendingRecords.isEmpty()) {
            PayrollRecord record = pendingRecords.get(0);
            BigDecimal currentReimbursements = record.getReimbursements();
            if (currentReimbursements == null) {
                currentReimbursements = BigDecimal.ZERO;
            }
            record.setReimbursements(currentReimbursements.add(request.getApprovedAmount()));
            payrollRecordRepository.save(record);
            
            request.setPayrollRecord(record);
            request.setReimbursementStatus("IN_PROGRESS");
        } else {
            request.setReimbursementStatus("PENDING");
        }
        
        return expenseRequestRepository.save(request);
    }

    @Transactional
    public ExpenseRequest postToAccounts(Long id, String accountingReference) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Can only post approved expense requests to accounts");
        }
        
        request.setPostedToAccounts(true);
        request.setPostedAt(LocalDateTime.now());
        request.setAccountingReference(accountingReference);
        
        return expenseRequestRepository.save(request);
    }

    @Transactional
    public void deleteRequest(Long id) {
        ExpenseRequest request = expenseRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense request not found"));
        
        if (!"DRAFT".equals(request.getStatus())) {
            throw new RuntimeException("Can only delete draft expense requests");
        }
        
        expenseRequestRepository.deleteById(id);
    }

    public Map<String, Object> getExpenseStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalDraft", expenseRequestRepository.countByStatus("DRAFT"));
        stats.put("totalPending", expenseRequestRepository.countByStatus("PENDING_APPROVAL"));
        stats.put("totalApproved", expenseRequestRepository.countByStatus("APPROVED"));
        stats.put("totalRejected", expenseRequestRepository.countByStatus("REJECTED"));
        
        return stats;
    }

    public Map<String, Object> getExpensesByCategory(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        
        List<ExpenseCategory> categories = expenseCategoryRepository.findByActive(true);
        List<Map<String, Object>> categoryData = new ArrayList<>();
        
        for (ExpenseCategory category : categories) {
            Map<String, Object> data = new HashMap<>();
            data.put("categoryId", category.getId());
            data.put("categoryName", category.getName());
            BigDecimal amount = expenseItemRepository.sumAmountByCategory(category);
            data.put("totalAmount", amount != null ? amount : BigDecimal.ZERO);
            categoryData.add(data);
        }
        
        result.put("categories", categoryData);
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        
        return result;
    }

    private String generateRequestNumber() {
        String prefix = "EXP";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = expenseRequestRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    @Transactional
    public void initializeDefaultCategories() {
        if (expenseCategoryRepository.count() == 0) {
            createDefaultCategory("TRAVEL", "Travel", "Travel related expenses", "TRAVEL", 1);
            createDefaultCategory("FUEL", "Fuel", "Fuel and transportation expenses", "TRAVEL", 2);
            createDefaultCategory("MEALS", "Meals", "Meal and food expenses", "MEALS", 3);
            createDefaultCategory("LODGING", "Lodging", "Hotel and accommodation expenses", "TRAVEL", 4);
            createDefaultCategory("SUPPLIES", "Office Supplies", "Office supply purchases", "PURCHASES", 5);
            createDefaultCategory("EQUIPMENT", "Equipment", "Equipment purchases", "PURCHASES", 6);
            createDefaultCategory("SOFTWARE", "Software", "Software and subscriptions", "PURCHASES", 7);
            createDefaultCategory("TRAINING", "Training", "Training and education expenses", "OTHER", 8);
            createDefaultCategory("COMMUNICATION", "Communication", "Phone, internet, and communication costs", "OTHER", 9);
            createDefaultCategory("OTHER", "Other", "Miscellaneous expenses", "OTHER", 10);
        }
    }

    private void createDefaultCategory(String code, String name, String description, String expenseType, int order) {
        ExpenseCategory category = new ExpenseCategory();
        category.setCode(code);
        category.setName(name);
        category.setDescription(description);
        category.setExpenseType(expenseType);
        category.setRequiresReceipt(true);
        category.setRequiresApproval(true);
        category.setDisplayOrder(order);
        category.setActive(true);
        expenseCategoryRepository.save(category);
    }
}
