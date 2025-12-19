package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class LoanService {

    @Autowired
    private LoanApplicationRepository loanRepository;

    @Autowired
    private LoanRepaymentRepository repaymentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<LoanApplication> findAllLoans() {
        return loanRepository.findAll();
    }

    public Optional<LoanApplication> findLoanById(Long id) {
        return loanRepository.findById(id);
    }

    public List<LoanApplication> findLoansByEmployee(Long employeeId) {
        return loanRepository.findByEmployeeId(employeeId);
    }

    public List<LoanApplication> findActiveLoansForEmployee(Long employeeId) {
        return loanRepository.findActiveLoansForEmployee(employeeId);
    }

    public List<LoanApplication> findLoansByStatus(String status) {
        return loanRepository.findByStatus(status);
    }

    public List<LoanApplication> findPendingApproval() {
        return loanRepository.findPendingApproval();
    }

    public List<LoanApplication> findLoansWithOutstandingBalance() {
        return loanRepository.findLoansWithOutstandingBalance();
    }

    public BigDecimal getTotalOutstandingByEmployee(Long employeeId) {
        BigDecimal total = loanRepository.getTotalOutstandingByEmployee(employeeId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional
    public LoanApplication applyForLoan(Map<String, Object> data) {
        LoanApplication loan = new LoanApplication();
        loan.setApplicationNumber(generateLoanNumber());
        updateLoanFromMap(loan, data);
        loan.setStatus("DRAFT");
        
        BigDecimal principal = loan.getRequestedAmount();
        BigDecimal interestRate = loan.getInterestRate();
        Integer tenure = loan.getRequestedTenureMonths();
        
        if (principal != null && tenure != null && tenure > 0) {
            BigDecimal emi = calculateEMI(principal, interestRate, tenure);
            loan.setEmiAmount(emi);
        }
        
        return loanRepository.save(loan);
    }

    @Transactional
    public LoanApplication updateLoan(Long id, Map<String, Object> data) {
        LoanApplication loan = loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan application not found"));
        updateLoanFromMap(loan, data);
        
        if (loan.getRequestedAmount() != null && loan.getRequestedTenureMonths() != null && loan.getRequestedTenureMonths() > 0) {
            BigDecimal emi = calculateEMI(loan.getRequestedAmount(), loan.getInterestRate(), loan.getRequestedTenureMonths());
            loan.setEmiAmount(emi);
        }
        
        return loanRepository.save(loan);
    }

    private void updateLoanFromMap(LoanApplication loan, Map<String, Object> data) {
        if (data.containsKey("employeeId") && data.get("employeeId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("employeeId").toString())).ifPresent(loan::setEmployee);
        }
        if (data.containsKey("loanType")) loan.setLoanType((String) data.get("loanType"));
        if (data.containsKey("requestedAmount") && data.get("requestedAmount") != null) {
            loan.setRequestedAmount(new BigDecimal(data.get("requestedAmount").toString()));
        }
        if (data.containsKey("purpose")) loan.setPurpose((String) data.get("purpose"));
        if (data.containsKey("requestedTenureMonths")) loan.setRequestedTenureMonths(Integer.valueOf(data.get("requestedTenureMonths").toString()));
        if (data.containsKey("interestRate") && data.get("interestRate") != null) {
            loan.setInterestRate(new BigDecimal(data.get("interestRate").toString()));
        }
        if (data.containsKey("notes")) loan.setNotes((String) data.get("notes"));
    }

    private BigDecimal calculateEMI(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        if (annualRate == null || annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
        }
        
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        double onePlusRPowerN = Math.pow(onePlusR.doubleValue(), tenureMonths);
        BigDecimal numerator = principal.multiply(monthlyRate).multiply(BigDecimal.valueOf(onePlusRPowerN));
        BigDecimal denominator = BigDecimal.valueOf(onePlusRPowerN - 1);
        
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    @Transactional
    public LoanApplication submitLoan(Long id) {
        LoanApplication loan = loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan application not found"));
        loan.setStatus("PENDING_APPROVAL");
        loan.setSubmittedAt(LocalDateTime.now());
        return loanRepository.save(loan);
    }

    @Transactional
    public LoanApplication approveLoan(Long id, Long approverId, String remarks, BigDecimal approvedAmount) {
        LoanApplication loan = loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan application not found"));
        
        employeeRepository.findById(approverId).ifPresent(loan::setApprovedBy);
        loan.setApprovedAt(LocalDateTime.now());
        loan.setApproverRemarks(remarks);
        loan.setApprovedAmount(approvedAmount != null ? approvedAmount : loan.getRequestedAmount());
        loan.setStatus("APPROVED");
        
        Integer tenure = loan.getApprovedTenureMonths() != null ? loan.getApprovedTenureMonths() : loan.getRequestedTenureMonths();
        if (loan.getApprovedAmount() != null && tenure != null && tenure > 0) {
            BigDecimal emi = calculateEMI(loan.getApprovedAmount(), loan.getInterestRate(), tenure);
            loan.setEmiAmount(emi);
        }
        
        return loanRepository.save(loan);
    }

    @Transactional
    public LoanApplication rejectLoan(Long id, String reason) {
        LoanApplication loan = loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan application not found"));
        loan.setRejectedAt(LocalDateTime.now());
        loan.setRejectionReason(reason);
        loan.setStatus("REJECTED");
        return loanRepository.save(loan);
    }

    @Transactional
    public LoanApplication disburseLoan(Long id, LocalDate disbursementDate) {
        LoanApplication loan = loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan application not found"));
        
        loan.setActualDisbursementDate(disbursementDate);
        loan.setOutstandingBalance(loan.getApprovedAmount());
        loan.setStatus("DISBURSED");
        
        generateRepaymentSchedule(loan);
        
        loan.setStatus("ACTIVE");
        return loanRepository.save(loan);
    }

    private void generateRepaymentSchedule(LoanApplication loan) {
        BigDecimal principal = loan.getApprovedAmount();
        BigDecimal annualRate = loan.getInterestRate();
        int tenureMonths = loan.getApprovedTenureMonths() != null ? loan.getApprovedTenureMonths() : loan.getRequestedTenureMonths();
        BigDecimal emi = loan.getEmiAmount();
        LocalDate firstDueDate = loan.getActualDisbursementDate().plusMonths(1);
        
        BigDecimal outstandingPrincipal = principal;
        BigDecimal monthlyRate = annualRate != null ? annualRate.divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        for (int i = 1; i <= tenureMonths; i++) {
            LoanRepayment repayment = new LoanRepayment();
            repayment.setLoan(loan);
            repayment.setInstallmentNumber(i);
            repayment.setDueDate(firstDueDate.plusMonths(i - 1));
            
            BigDecimal interestAmount = outstandingPrincipal.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalAmount = emi.subtract(interestAmount);
            
            if (i == tenureMonths) {
                principalAmount = outstandingPrincipal;
            }
            
            repayment.setInterestAmount(interestAmount);
            repayment.setPrincipalAmount(principalAmount);
            repayment.setEmiAmount(principalAmount.add(interestAmount));
            repayment.setOutstandingAfter(outstandingPrincipal.subtract(principalAmount));
            repayment.setStatus("PENDING");
            
            repaymentRepository.save(repayment);
            
            outstandingPrincipal = outstandingPrincipal.subtract(principalAmount);
        }
    }

    public List<LoanRepayment> findRepaymentsByLoan(Long loanId) {
        return repaymentRepository.findByLoanIdOrderByInstallment(loanId);
    }

    public List<LoanRepayment> findDueRepayments(LocalDate date) {
        return repaymentRepository.findDueRepayments(date);
    }

    public List<LoanRepayment> findOverdueRepayments() {
        return repaymentRepository.findOverdueRepayments(LocalDate.now());
    }

    public List<LoanRepayment> findUpcomingRepaymentsByEmployee(Long employeeId, LocalDate start, LocalDate end) {
        return repaymentRepository.findUpcomingRepaymentsByEmployee(employeeId, start, end);
    }

    @Transactional
    public LoanRepayment recordPayment(Long repaymentId, BigDecimal paidAmount, LocalDate paymentDate, String paymentReference) {
        LoanRepayment repayment = repaymentRepository.findById(repaymentId)
            .orElseThrow(() -> new RuntimeException("Repayment not found"));
        
        repayment.setPaidAmount(paidAmount);
        repayment.setPaidDate(paymentDate);
        repayment.setPaymentReference(paymentReference);
        repayment.setStatus("PAID");
        
        LoanRepayment saved = repaymentRepository.save(repayment);
        
        LoanApplication loan = repayment.getLoan();
        loan.setOutstandingBalance(repayment.getOutstandingAfter());
        
        if (repayment.getOutstandingAfter().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setStatus("CLOSED");
            loan.setFullyRepaid(true);
            loan.setRepaidAt(LocalDateTime.now());
        }
        
        loanRepository.save(loan);
        
        return saved;
    }

    @Transactional
    public LoanRepayment recordPayrollDeduction(Long repaymentId, Long payrollRecordId) {
        LoanRepayment repayment = repaymentRepository.findById(repaymentId)
            .orElseThrow(() -> new RuntimeException("Repayment not found"));
        
        repayment.setDeductedFromPayroll(true);
        repayment.setPaidDate(LocalDate.now());
        repayment.setPaidAmount(repayment.getEmiAmount());
        repayment.setStatus("PAID");
        
        LoanRepayment saved = repaymentRepository.save(repayment);
        
        LoanApplication loan = repayment.getLoan();
        loan.setOutstandingBalance(repayment.getOutstandingAfter());
        
        if (repayment.getOutstandingAfter().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setStatus("CLOSED");
            loan.setFullyRepaid(true);
            loan.setRepaidAt(LocalDateTime.now());
        }
        
        loanRepository.save(loan);
        
        return saved;
    }

    @Transactional
    public void deleteLoan(Long id) {
        repaymentRepository.findByLoanId(id).forEach(r -> repaymentRepository.delete(r));
        loanRepository.deleteById(id);
    }

    public Map<String, Object> getLoanDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("pendingApproval", loanRepository.findPendingApproval().size());
        dashboard.put("activeLoans", loanRepository.findByStatus("ACTIVE").size());
        dashboard.put("overduePayments", repaymentRepository.findOverdueRepayments(LocalDate.now()).size());
        dashboard.put("dueThisMonth", repaymentRepository.findDueRepayments(LocalDate.now().plusMonths(1)).size());
        return dashboard;
    }

    public Map<String, Object> getEmployeeLoanSummary(Long employeeId) {
        Map<String, Object> summary = new HashMap<>();
        List<LoanApplication> activeLoans = loanRepository.findActiveLoansForEmployee(employeeId);
        summary.put("activeLoans", activeLoans.size());
        summary.put("totalOutstanding", getTotalOutstandingByEmployee(employeeId));
        
        BigDecimal totalEmi = activeLoans.stream()
            .map(LoanApplication::getEmiAmount)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("monthlyEmi", totalEmi);
        
        return summary;
    }

    private String generateLoanNumber() {
        String prefix = "LN";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = loanRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }
}
