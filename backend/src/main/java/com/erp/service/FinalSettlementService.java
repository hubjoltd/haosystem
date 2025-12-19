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
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class FinalSettlementService {
    
    @Autowired
    private FinalSettlementRepository settlementRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private EmployeeSalaryRepository salaryRepository;
    
    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;
    
    @Autowired
    private LoanApplicationRepository loanRepository;
    
    @Autowired
    private EmployeeAssetRepository assetRepository;
    
    @Autowired
    private PrefixSettingsService prefixService;
    
    public List<FinalSettlement> findAll() {
        return settlementRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Optional<FinalSettlement> findById(Long id) {
        return settlementRepository.findById(id);
    }
    
    public List<FinalSettlement> findByStatus(String status) {
        return settlementRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public Optional<FinalSettlement> findByEmployeeId(Long employeeId) {
        return settlementRepository.findByEmployeeId(employeeId);
    }
    
    @Transactional
    public FinalSettlement initiateSettlement(Long employeeId, LocalDate lastWorkingDay, String separationType, String createdBy) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (settlementRepository.existsByEmployeeId(employeeId)) {
            throw new RuntimeException("Settlement already exists for this employee");
        }
        
        FinalSettlement settlement = new FinalSettlement();
        settlement.setSettlementNumber(prefixService.generateId("SETTLEMENT"));
        settlement.setEmployee(employee);
        settlement.setLastWorkingDay(lastWorkingDay);
        settlement.setResignationDate(employee.getResignationDate());
        settlement.setSeparationType(separationType);
        settlement.setCreatedBy(createdBy);
        settlement.setStatus("DRAFT");
        
        calculateSettlement(settlement, employee);
        
        return settlementRepository.save(settlement);
    }
    
    private void calculateSettlement(FinalSettlement settlement, Employee employee) {
        BigDecimal totalEarnings = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        
        Optional<EmployeeSalary> currentSalaryOpt = salaryRepository.findByEmployeeIdAndIsCurrentTrue(employee.getId());
        if (currentSalaryOpt.isPresent()) {
            EmployeeSalary salary = currentSalaryOpt.get();
            
            long daysWorked = 0;
            if (settlement.getLastWorkingDay() != null) {
                LocalDate startOfMonth = settlement.getLastWorkingDay().withDayOfMonth(1);
                daysWorked = ChronoUnit.DAYS.between(startOfMonth, settlement.getLastWorkingDay()) + 1;
            }
            
            BigDecimal dailyRate = salary.getBasicSalary() != null ? 
                salary.getBasicSalary().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            settlement.setBasicSalaryDue(dailyRate.multiply(BigDecimal.valueOf(daysWorked)));
            
            BigDecimal allowances = BigDecimal.ZERO;
            if (salary.getHraAmount() != null) allowances = allowances.add(salary.getHraAmount());
            if (salary.getDaAmount() != null) allowances = allowances.add(salary.getDaAmount());
            if (salary.getTaAmount() != null) allowances = allowances.add(salary.getTaAmount());
            if (salary.getMedicalAllowance() != null) allowances = allowances.add(salary.getMedicalAllowance());
            if (salary.getSpecialAllowance() != null) allowances = allowances.add(salary.getSpecialAllowance());
            BigDecimal dailyAllowance = allowances.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
            settlement.setAllowancesDue(dailyAllowance.multiply(BigDecimal.valueOf(daysWorked)));
        } else {
            settlement.setBasicSalaryDue(BigDecimal.ZERO);
            settlement.setAllowancesDue(BigDecimal.ZERO);
        }
        
        List<LeaveBalance> leaveBalances = leaveBalanceRepository.findByEmployeeId(employee.getId());
        int totalLeaveDays = 0;
        for (LeaveBalance lb : leaveBalances) {
            if (lb.getBalance() != null) {
                totalLeaveDays += lb.getBalance().intValue();
            }
        }
        settlement.setLeaveBalanceDays(totalLeaveDays);
        
        BigDecimal perDayRate = currentSalaryOpt.map(s -> 
            s.getBasicSalary() != null ? s.getBasicSalary().divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO
        ).orElse(BigDecimal.ZERO);
        settlement.setLeaveEncashment(perDayRate.multiply(BigDecimal.valueOf(totalLeaveDays)));
        
        if (employee.getJoiningDate() != null && settlement.getLastWorkingDay() != null) {
            long yearsOfService = ChronoUnit.YEARS.between(employee.getJoiningDate(), settlement.getLastWorkingDay());
            if (yearsOfService >= 5) {
                BigDecimal monthlyBasic = currentSalaryOpt.map(EmployeeSalary::getBasicSalary).orElse(BigDecimal.ZERO);
                BigDecimal gratuity = monthlyBasic.multiply(BigDecimal.valueOf(15))
                    .multiply(BigDecimal.valueOf(yearsOfService))
                    .divide(BigDecimal.valueOf(26), 2, RoundingMode.HALF_UP);
                settlement.setGratuityAmount(gratuity);
            } else {
                settlement.setGratuityAmount(BigDecimal.ZERO);
            }
        } else {
            settlement.setGratuityAmount(BigDecimal.ZERO);
        }
        
        settlement.setBonusDue(BigDecimal.ZERO);
        settlement.setNoticePayRecovery(BigDecimal.ZERO);
        settlement.setOtherEarnings(BigDecimal.ZERO);
        
        if (settlement.getBasicSalaryDue() != null) totalEarnings = totalEarnings.add(settlement.getBasicSalaryDue());
        if (settlement.getAllowancesDue() != null) totalEarnings = totalEarnings.add(settlement.getAllowancesDue());
        if (settlement.getBonusDue() != null) totalEarnings = totalEarnings.add(settlement.getBonusDue());
        if (settlement.getLeaveEncashment() != null) totalEarnings = totalEarnings.add(settlement.getLeaveEncashment());
        if (settlement.getGratuityAmount() != null) totalEarnings = totalEarnings.add(settlement.getGratuityAmount());
        if (settlement.getOtherEarnings() != null) totalEarnings = totalEarnings.add(settlement.getOtherEarnings());
        settlement.setTotalEarnings(totalEarnings);
        
        List<LoanApplication> activeLoans = loanRepository.findByEmployeeIdAndStatus(employee.getId(), "DISBURSED");
        BigDecimal loanRecovery = BigDecimal.ZERO;
        for (LoanApplication loan : activeLoans) {
            if (loan.getOutstandingBalance() != null) {
                loanRecovery = loanRecovery.add(loan.getOutstandingBalance());
            }
        }
        settlement.setLoanRecovery(loanRecovery);
        
        List<EmployeeAsset> issuedAssets = assetRepository.findByEmployeeIdAndStatus(employee.getId(), "Issued");
        BigDecimal assetRecovery = BigDecimal.ZERO;
        for (EmployeeAsset asset : issuedAssets) {
            assetRecovery = assetRecovery.add(BigDecimal.valueOf(100));
        }
        settlement.setAssetRecovery(assetRecovery);
        
        settlement.setAdvanceRecovery(BigDecimal.ZERO);
        settlement.setTaxDeduction(BigDecimal.ZERO);
        settlement.setOtherDeductions(BigDecimal.ZERO);
        
        if (settlement.getLoanRecovery() != null) totalDeductions = totalDeductions.add(settlement.getLoanRecovery());
        if (settlement.getAdvanceRecovery() != null) totalDeductions = totalDeductions.add(settlement.getAdvanceRecovery());
        if (settlement.getAssetRecovery() != null) totalDeductions = totalDeductions.add(settlement.getAssetRecovery());
        if (settlement.getTaxDeduction() != null) totalDeductions = totalDeductions.add(settlement.getTaxDeduction());
        if (settlement.getOtherDeductions() != null) totalDeductions = totalDeductions.add(settlement.getOtherDeductions());
        if (settlement.getNoticePayRecovery() != null) totalDeductions = totalDeductions.add(settlement.getNoticePayRecovery());
        settlement.setTotalDeductions(totalDeductions);
        
        settlement.setNetPayable(totalEarnings.subtract(totalDeductions));
    }
    
    @Transactional
    public FinalSettlement update(Long id, FinalSettlement updatedSettlement) {
        FinalSettlement existing = settlementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        if (!"DRAFT".equals(existing.getStatus())) {
            throw new RuntimeException("Can only update settlements in DRAFT status");
        }
        
        existing.setLastWorkingDay(updatedSettlement.getLastWorkingDay());
        existing.setSeparationType(updatedSettlement.getSeparationType());
        existing.setBasicSalaryDue(updatedSettlement.getBasicSalaryDue());
        existing.setAllowancesDue(updatedSettlement.getAllowancesDue());
        existing.setBonusDue(updatedSettlement.getBonusDue());
        existing.setLeaveEncashment(updatedSettlement.getLeaveEncashment());
        existing.setLeaveBalanceDays(updatedSettlement.getLeaveBalanceDays());
        existing.setGratuityAmount(updatedSettlement.getGratuityAmount());
        existing.setNoticePayRecovery(updatedSettlement.getNoticePayRecovery());
        existing.setOtherEarnings(updatedSettlement.getOtherEarnings());
        existing.setLoanRecovery(updatedSettlement.getLoanRecovery());
        existing.setAdvanceRecovery(updatedSettlement.getAdvanceRecovery());
        existing.setAssetRecovery(updatedSettlement.getAssetRecovery());
        existing.setTaxDeduction(updatedSettlement.getTaxDeduction());
        existing.setOtherDeductions(updatedSettlement.getOtherDeductions());
        existing.setRemarks(updatedSettlement.getRemarks());
        
        recalculateTotals(existing);
        
        return settlementRepository.save(existing);
    }
    
    private void recalculateTotals(FinalSettlement s) {
        BigDecimal totalEarnings = BigDecimal.ZERO;
        if (s.getBasicSalaryDue() != null) totalEarnings = totalEarnings.add(s.getBasicSalaryDue());
        if (s.getAllowancesDue() != null) totalEarnings = totalEarnings.add(s.getAllowancesDue());
        if (s.getBonusDue() != null) totalEarnings = totalEarnings.add(s.getBonusDue());
        if (s.getLeaveEncashment() != null) totalEarnings = totalEarnings.add(s.getLeaveEncashment());
        if (s.getGratuityAmount() != null) totalEarnings = totalEarnings.add(s.getGratuityAmount());
        if (s.getOtherEarnings() != null) totalEarnings = totalEarnings.add(s.getOtherEarnings());
        s.setTotalEarnings(totalEarnings);
        
        BigDecimal totalDeductions = BigDecimal.ZERO;
        if (s.getLoanRecovery() != null) totalDeductions = totalDeductions.add(s.getLoanRecovery());
        if (s.getAdvanceRecovery() != null) totalDeductions = totalDeductions.add(s.getAdvanceRecovery());
        if (s.getAssetRecovery() != null) totalDeductions = totalDeductions.add(s.getAssetRecovery());
        if (s.getTaxDeduction() != null) totalDeductions = totalDeductions.add(s.getTaxDeduction());
        if (s.getOtherDeductions() != null) totalDeductions = totalDeductions.add(s.getOtherDeductions());
        if (s.getNoticePayRecovery() != null) totalDeductions = totalDeductions.add(s.getNoticePayRecovery());
        s.setTotalDeductions(totalDeductions);
        
        s.setNetPayable(totalEarnings.subtract(totalDeductions));
    }
    
    @Transactional
    public FinalSettlement submit(Long id) {
        FinalSettlement settlement = settlementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        if (!"DRAFT".equals(settlement.getStatus())) {
            throw new RuntimeException("Can only submit settlements in DRAFT status");
        }
        
        settlement.setStatus("PENDING_APPROVAL");
        return settlementRepository.save(settlement);
    }
    
    @Transactional
    public FinalSettlement approve(Long id, String approvedBy) {
        FinalSettlement settlement = settlementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        if (!"PENDING_APPROVAL".equals(settlement.getStatus())) {
            throw new RuntimeException("Can only approve settlements pending approval");
        }
        
        settlement.setStatus("APPROVED");
        settlement.setApprovedBy(approvedBy);
        settlement.setApprovedAt(LocalDateTime.now());
        return settlementRepository.save(settlement);
    }
    
    @Transactional
    public FinalSettlement reject(Long id, String remarks) {
        FinalSettlement settlement = settlementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        settlement.setStatus("REJECTED");
        settlement.setRemarks(remarks);
        return settlementRepository.save(settlement);
    }
    
    @Transactional
    public FinalSettlement process(Long id, String processedBy) {
        FinalSettlement settlement = settlementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        if (!"APPROVED".equals(settlement.getStatus())) {
            throw new RuntimeException("Can only process approved settlements");
        }
        
        settlement.setStatus("PROCESSED");
        settlement.setProcessedBy(processedBy);
        settlement.setProcessedAt(LocalDateTime.now());
        
        Employee employee = settlement.getEmployee();
        employee.setEmploymentStatus("Terminated");
        employee.setActive(false);
        employeeRepository.save(employee);
        
        return settlementRepository.save(settlement);
    }
    
    public void delete(Long id) {
        FinalSettlement settlement = settlementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        if (!"DRAFT".equals(settlement.getStatus())) {
            throw new RuntimeException("Can only delete settlements in DRAFT status");
        }
        
        settlementRepository.deleteById(id);
    }
    
    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("total", settlementRepository.count());
        dashboard.put("draft", settlementRepository.findByStatus("DRAFT").size());
        dashboard.put("pendingApproval", settlementRepository.findByStatus("PENDING_APPROVAL").size());
        dashboard.put("approved", settlementRepository.findByStatus("APPROVED").size());
        dashboard.put("processed", settlementRepository.findByStatus("PROCESSED").size());
        dashboard.put("rejected", settlementRepository.findByStatus("REJECTED").size());
        return dashboard;
    }
}
