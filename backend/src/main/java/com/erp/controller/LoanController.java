package com.erp.controller;

import com.erp.model.*;
import com.erp.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(loanService.getLoanDashboard());
    }

    @GetMapping
    public ResponseEntity<List<LoanApplication>> getAllLoans() {
        return ResponseEntity.ok(loanService.findAllLoans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanApplication> getLoan(@PathVariable Long id) {
        return loanService.findLoanById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LoanApplication>> getLoansByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(loanService.findLoansByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/active")
    public ResponseEntity<List<LoanApplication>> getActiveLoansForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(loanService.findActiveLoansForEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/summary")
    public ResponseEntity<Map<String, Object>> getEmployeeLoanSummary(@PathVariable Long employeeId) {
        return ResponseEntity.ok(loanService.getEmployeeLoanSummary(employeeId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LoanApplication>> getLoansByStatus(@PathVariable String status) {
        return ResponseEntity.ok(loanService.findLoansByStatus(status));
    }

    @GetMapping("/pending-approval")
    public ResponseEntity<List<LoanApplication>> getPendingApproval() {
        return ResponseEntity.ok(loanService.findPendingApproval());
    }

    @GetMapping("/outstanding")
    public ResponseEntity<List<LoanApplication>> getLoansWithOutstandingBalance() {
        return ResponseEntity.ok(loanService.findLoansWithOutstandingBalance());
    }

    @PostMapping
    public ResponseEntity<LoanApplication> applyForLoan(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(loanService.applyForLoan(data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanApplication> updateLoan(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(loanService.updateLoan(id, data));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<LoanApplication> submitLoan(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.submitLoan(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<LoanApplication> approveLoan(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long approverId = Long.valueOf(data.get("approverId").toString());
        String remarks = (String) data.get("remarks");
        BigDecimal approvedAmount = null;
        if (data.containsKey("approvedAmount") && data.get("approvedAmount") != null) {
            approvedAmount = new BigDecimal(data.get("approvedAmount").toString());
        }
        return ResponseEntity.ok(loanService.approveLoan(id, approverId, remarks, approvedAmount));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<LoanApplication> rejectLoan(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String reason = (String) data.get("reason");
        return ResponseEntity.ok(loanService.rejectLoan(id, reason));
    }

    @PostMapping("/{id}/disburse")
    public ResponseEntity<LoanApplication> disburseLoan(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        LocalDate disbursementDate = LocalDate.parse((String) data.get("disbursementDate"));
        return ResponseEntity.ok(loanService.disburseLoan(id, disbursementDate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoan(@PathVariable Long id) {
        loanService.deleteLoan(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{loanId}/repayments")
    public ResponseEntity<List<LoanRepayment>> getRepaymentsByLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.findRepaymentsByLoan(loanId));
    }

    @GetMapping("/repayments/due")
    public ResponseEntity<List<LoanRepayment>> getDueRepayments(@RequestParam String date) {
        LocalDate dueDate = LocalDate.parse(date);
        return ResponseEntity.ok(loanService.findDueRepayments(dueDate));
    }

    @GetMapping("/repayments/overdue")
    public ResponseEntity<List<LoanRepayment>> getOverdueRepayments() {
        return ResponseEntity.ok(loanService.findOverdueRepayments());
    }

    @GetMapping("/repayments/employee/{employeeId}/upcoming")
    public ResponseEntity<List<LoanRepayment>> getUpcomingRepaymentsByEmployee(
            @PathVariable Long employeeId,
            @RequestParam String start,
            @RequestParam String end) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return ResponseEntity.ok(loanService.findUpcomingRepaymentsByEmployee(employeeId, startDate, endDate));
    }

    @PostMapping("/repayments/{id}/pay")
    public ResponseEntity<LoanRepayment> recordPayment(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        BigDecimal paidAmount = new BigDecimal(data.get("paidAmount").toString());
        LocalDate paymentDate = LocalDate.parse((String) data.get("paymentDate"));
        String paymentReference = (String) data.get("paymentReference");
        return ResponseEntity.ok(loanService.recordPayment(id, paidAmount, paymentDate, paymentReference));
    }

    @PostMapping("/repayments/{id}/payroll-deduction")
    public ResponseEntity<LoanRepayment> recordPayrollDeduction(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long payrollRecordId = Long.valueOf(data.get("payrollRecordId").toString());
        return ResponseEntity.ok(loanService.recordPayrollDeduction(id, payrollRecordId));
    }
}
