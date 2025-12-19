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
public class CompensationService {

    @Autowired
    private SalaryBandRepository salaryBandRepository;

    @Autowired
    private BenefitPlanRepository benefitPlanRepository;

    @Autowired
    private EmployeeSalaryRepository employeeSalaryRepository;

    @Autowired
    private EmployeeBenefitRepository employeeBenefitRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private GradeRepository gradeRepository;

    public List<SalaryBand> findAllSalaryBands() {
        return salaryBandRepository.findAll();
    }

    public List<SalaryBand> findActiveSalaryBands() {
        return salaryBandRepository.findByIsActiveTrue();
    }

    public Optional<SalaryBand> findSalaryBandById(Long id) {
        return salaryBandRepository.findById(id);
    }

    public List<SalaryBand> findSalaryBandsByGrade(Long gradeId) {
        return salaryBandRepository.findByGradeId(gradeId);
    }

    @Transactional
    public SalaryBand createSalaryBand(Map<String, Object> data) {
        SalaryBand band = new SalaryBand();
        updateSalaryBandFromMap(band, data);
        return salaryBandRepository.save(band);
    }

    @Transactional
    public SalaryBand updateSalaryBand(Long id, Map<String, Object> data) {
        SalaryBand band = salaryBandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Salary band not found"));
        updateSalaryBandFromMap(band, data);
        return salaryBandRepository.save(band);
    }

    private void updateSalaryBandFromMap(SalaryBand band, Map<String, Object> data) {
        if (data.containsKey("bandCode")) band.setBandCode((String) data.get("bandCode"));
        if (data.containsKey("name")) band.setName((String) data.get("name"));
        if (data.containsKey("gradeId") && data.get("gradeId") != null) {
            gradeRepository.findById(Long.valueOf(data.get("gradeId").toString())).ifPresent(band::setGrade);
        }
        if (data.containsKey("minSalary") && data.get("minSalary") != null) {
            band.setMinSalary(new BigDecimal(data.get("minSalary").toString()));
        }
        if (data.containsKey("midSalary") && data.get("midSalary") != null) {
            band.setMidSalary(new BigDecimal(data.get("midSalary").toString()));
        }
        if (data.containsKey("maxSalary") && data.get("maxSalary") != null) {
            band.setMaxSalary(new BigDecimal(data.get("maxSalary").toString()));
        }
        if (data.containsKey("currency")) band.setCurrency((String) data.get("currency"));
        if (data.containsKey("payFrequency")) band.setPayFrequency((String) data.get("payFrequency"));
        if (data.containsKey("hraPercentage") && data.get("hraPercentage") != null) {
            band.setHraPercentage(new BigDecimal(data.get("hraPercentage").toString()));
        }
        if (data.containsKey("daPercentage") && data.get("daPercentage") != null) {
            band.setDaPercentage(new BigDecimal(data.get("daPercentage").toString()));
        }
        if (data.containsKey("taPercentage") && data.get("taPercentage") != null) {
            band.setTaPercentage(new BigDecimal(data.get("taPercentage").toString()));
        }
        if (data.containsKey("effectiveFrom") && data.get("effectiveFrom") != null) {
            band.setEffectiveFrom(LocalDate.parse((String) data.get("effectiveFrom")));
        }
        if (data.containsKey("effectiveTo") && data.get("effectiveTo") != null) {
            band.setEffectiveTo(LocalDate.parse((String) data.get("effectiveTo")));
        }
        if (data.containsKey("isActive")) band.setIsActive((Boolean) data.get("isActive"));
        if (data.containsKey("notes")) band.setNotes((String) data.get("notes"));
        if (data.containsKey("createdBy")) band.setCreatedBy((String) data.get("createdBy"));
    }

    @Transactional
    public void deleteSalaryBand(Long id) {
        salaryBandRepository.deleteById(id);
    }

    public List<BenefitPlan> findAllBenefitPlans() {
        return benefitPlanRepository.findAll();
    }

    public List<BenefitPlan> findActiveBenefitPlans() {
        return benefitPlanRepository.findByIsActiveTrue();
    }

    public Optional<BenefitPlan> findBenefitPlanById(Long id) {
        return benefitPlanRepository.findById(id);
    }

    public List<BenefitPlan> findBenefitPlansByType(String type) {
        return benefitPlanRepository.findByBenefitType(type);
    }

    @Transactional
    public BenefitPlan createBenefitPlan(Map<String, Object> data) {
        BenefitPlan plan = new BenefitPlan();
        updateBenefitPlanFromMap(plan, data);
        return benefitPlanRepository.save(plan);
    }

    @Transactional
    public BenefitPlan updateBenefitPlan(Long id, Map<String, Object> data) {
        BenefitPlan plan = benefitPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Benefit plan not found"));
        updateBenefitPlanFromMap(plan, data);
        return benefitPlanRepository.save(plan);
    }

    private void updateBenefitPlanFromMap(BenefitPlan plan, Map<String, Object> data) {
        if (data.containsKey("planCode")) plan.setPlanCode((String) data.get("planCode"));
        if (data.containsKey("name")) plan.setName((String) data.get("name"));
        if (data.containsKey("description")) plan.setDescription((String) data.get("description"));
        if (data.containsKey("benefitType")) plan.setBenefitType((String) data.get("benefitType"));
        if (data.containsKey("category")) plan.setCategory((String) data.get("category"));
        if (data.containsKey("provider")) plan.setProvider((String) data.get("provider"));
        if (data.containsKey("policyNumber")) plan.setPolicyNumber((String) data.get("policyNumber"));
        if (data.containsKey("employerContribution") && data.get("employerContribution") != null) {
            plan.setEmployerContribution(new BigDecimal(data.get("employerContribution").toString()));
        }
        if (data.containsKey("employeeContribution") && data.get("employeeContribution") != null) {
            plan.setEmployeeContribution(new BigDecimal(data.get("employeeContribution").toString()));
        }
        if (data.containsKey("contributionType")) plan.setContributionType((String) data.get("contributionType"));
        if (data.containsKey("coverageAmount") && data.get("coverageAmount") != null) {
            plan.setCoverageAmount(new BigDecimal(data.get("coverageAmount").toString()));
        }
        if (data.containsKey("coverageDetails")) plan.setCoverageDetails((String) data.get("coverageDetails"));
        if (data.containsKey("eligibilityRules")) plan.setEligibilityRules((String) data.get("eligibilityRules"));
        if (data.containsKey("waitingPeriodDays") && data.get("waitingPeriodDays") != null) {
            plan.setWaitingPeriodDays(Integer.valueOf(data.get("waitingPeriodDays").toString()));
        }
        if (data.containsKey("effectiveFrom") && data.get("effectiveFrom") != null) {
            plan.setEffectiveFrom(LocalDate.parse((String) data.get("effectiveFrom")));
        }
        if (data.containsKey("effectiveTo") && data.get("effectiveTo") != null) {
            plan.setEffectiveTo(LocalDate.parse((String) data.get("effectiveTo")));
        }
        if (data.containsKey("enrollmentStartDate") && data.get("enrollmentStartDate") != null) {
            plan.setEnrollmentStartDate(LocalDate.parse((String) data.get("enrollmentStartDate")));
        }
        if (data.containsKey("enrollmentEndDate") && data.get("enrollmentEndDate") != null) {
            plan.setEnrollmentEndDate(LocalDate.parse((String) data.get("enrollmentEndDate")));
        }
        if (data.containsKey("isActive")) plan.setIsActive((Boolean) data.get("isActive"));
        if (data.containsKey("isMandatory")) plan.setIsMandatory((Boolean) data.get("isMandatory"));
        if (data.containsKey("termsAndConditions")) plan.setTermsAndConditions((String) data.get("termsAndConditions"));
        if (data.containsKey("exclusions")) plan.setExclusions((String) data.get("exclusions"));
        if (data.containsKey("createdBy")) plan.setCreatedBy((String) data.get("createdBy"));
    }

    @Transactional
    public void deleteBenefitPlan(Long id) {
        benefitPlanRepository.deleteById(id);
    }

    public List<EmployeeSalary> findSalaryHistoryByEmployee(Long employeeId) {
        return employeeSalaryRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId);
    }

    public Optional<EmployeeSalary> findCurrentSalary(Long employeeId) {
        return employeeSalaryRepository.findByEmployeeIdAndIsCurrentTrue(employeeId);
    }

    @Transactional
    public EmployeeSalary createSalaryRevision(Map<String, Object> data) {
        Long employeeId = Long.valueOf(data.get("employeeId").toString());
        
        employeeSalaryRepository.findByEmployeeIdAndIsCurrentTrue(employeeId).ifPresent(current -> {
            current.setIsCurrent(false);
            if (data.containsKey("effectiveFrom")) {
                LocalDate effectiveFrom = LocalDate.parse((String) data.get("effectiveFrom"));
                current.setEffectiveTo(effectiveFrom.minusDays(1));
            }
            employeeSalaryRepository.save(current);
        });
        
        EmployeeSalary newSalary = new EmployeeSalary();
        updateEmployeeSalaryFromMap(newSalary, data);
        newSalary.setIsCurrent(true);
        
        calculateSalaryComponents(newSalary);
        
        return employeeSalaryRepository.save(newSalary);
    }

    @Transactional
    public EmployeeSalary updateEmployeeSalary(Long id, Map<String, Object> data) {
        EmployeeSalary salary = employeeSalaryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee salary record not found"));
        updateEmployeeSalaryFromMap(salary, data);
        calculateSalaryComponents(salary);
        return employeeSalaryRepository.save(salary);
    }

    private void updateEmployeeSalaryFromMap(EmployeeSalary salary, Map<String, Object> data) {
        if (data.containsKey("employeeId") && data.get("employeeId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("employeeId").toString())).ifPresent(salary::setEmployee);
        }
        if (data.containsKey("basicSalary") && data.get("basicSalary") != null) {
            salary.setBasicSalary(new BigDecimal(data.get("basicSalary").toString()));
        }
        if (data.containsKey("hraAmount") && data.get("hraAmount") != null) {
            salary.setHraAmount(new BigDecimal(data.get("hraAmount").toString()));
        }
        if (data.containsKey("daAmount") && data.get("daAmount") != null) {
            salary.setDaAmount(new BigDecimal(data.get("daAmount").toString()));
        }
        if (data.containsKey("taAmount") && data.get("taAmount") != null) {
            salary.setTaAmount(new BigDecimal(data.get("taAmount").toString()));
        }
        if (data.containsKey("medicalAllowance") && data.get("medicalAllowance") != null) {
            salary.setMedicalAllowance(new BigDecimal(data.get("medicalAllowance").toString()));
        }
        if (data.containsKey("specialAllowance") && data.get("specialAllowance") != null) {
            salary.setSpecialAllowance(new BigDecimal(data.get("specialAllowance").toString()));
        }
        if (data.containsKey("otherAllowances") && data.get("otherAllowances") != null) {
            salary.setOtherAllowances(new BigDecimal(data.get("otherAllowances").toString()));
        }
        if (data.containsKey("pfDeduction") && data.get("pfDeduction") != null) {
            salary.setPfDeduction(new BigDecimal(data.get("pfDeduction").toString()));
        }
        if (data.containsKey("esiDeduction") && data.get("esiDeduction") != null) {
            salary.setEsiDeduction(new BigDecimal(data.get("esiDeduction").toString()));
        }
        if (data.containsKey("professionalTax") && data.get("professionalTax") != null) {
            salary.setProfessionalTax(new BigDecimal(data.get("professionalTax").toString()));
        }
        if (data.containsKey("tdsDeduction") && data.get("tdsDeduction") != null) {
            salary.setTdsDeduction(new BigDecimal(data.get("tdsDeduction").toString()));
        }
        if (data.containsKey("otherDeductions") && data.get("otherDeductions") != null) {
            salary.setOtherDeductions(new BigDecimal(data.get("otherDeductions").toString()));
        }
        if (data.containsKey("payFrequency")) salary.setPayFrequency((String) data.get("payFrequency"));
        if (data.containsKey("changeReason")) salary.setChangeReason((String) data.get("changeReason"));
        if (data.containsKey("effectiveFrom") && data.get("effectiveFrom") != null) {
            salary.setEffectiveFrom(LocalDate.parse((String) data.get("effectiveFrom")));
        }
        if (data.containsKey("effectiveTo") && data.get("effectiveTo") != null) {
            salary.setEffectiveTo(LocalDate.parse((String) data.get("effectiveTo")));
        }
        if (data.containsKey("remarks")) salary.setRemarks((String) data.get("remarks"));
        if (data.containsKey("createdBy")) salary.setCreatedBy((String) data.get("createdBy"));
    }

    private void calculateSalaryComponents(EmployeeSalary salary) {
        BigDecimal gross = BigDecimal.ZERO;
        
        if (salary.getBasicSalary() != null) gross = gross.add(salary.getBasicSalary());
        if (salary.getHraAmount() != null) gross = gross.add(salary.getHraAmount());
        if (salary.getDaAmount() != null) gross = gross.add(salary.getDaAmount());
        if (salary.getTaAmount() != null) gross = gross.add(salary.getTaAmount());
        if (salary.getMedicalAllowance() != null) gross = gross.add(salary.getMedicalAllowance());
        if (salary.getSpecialAllowance() != null) gross = gross.add(salary.getSpecialAllowance());
        if (salary.getOtherAllowances() != null) gross = gross.add(salary.getOtherAllowances());
        
        salary.setGrossSalary(gross);
        
        BigDecimal deductions = BigDecimal.ZERO;
        if (salary.getPfDeduction() != null) deductions = deductions.add(salary.getPfDeduction());
        if (salary.getEsiDeduction() != null) deductions = deductions.add(salary.getEsiDeduction());
        if (salary.getProfessionalTax() != null) deductions = deductions.add(salary.getProfessionalTax());
        if (salary.getTdsDeduction() != null) deductions = deductions.add(salary.getTdsDeduction());
        if (salary.getOtherDeductions() != null) deductions = deductions.add(salary.getOtherDeductions());
        
        salary.setNetSalary(gross.subtract(deductions));
        
        salary.setCtcAnnual(gross.multiply(BigDecimal.valueOf(12)));
        
        if (gross.compareTo(BigDecimal.ZERO) > 0) {
            salary.setHourlyRate(gross.multiply(BigDecimal.valueOf(12))
                .divide(BigDecimal.valueOf(2080), 2, RoundingMode.HALF_UP));
        }
    }

    public List<EmployeeBenefit> findBenefitsByEmployee(Long employeeId) {
        return employeeBenefitRepository.findByEmployeeId(employeeId);
    }

    public List<EmployeeBenefit> findActiveBenefitsByEmployee(Long employeeId) {
        return employeeBenefitRepository.findByEmployeeIdAndIsActiveTrue(employeeId);
    }

    @Transactional
    public EmployeeBenefit enrollEmployeeInBenefit(Map<String, Object> data) {
        EmployeeBenefit benefit = new EmployeeBenefit();
        updateEmployeeBenefitFromMap(benefit, data);
        
        if (benefit.getEmployeeContribution() != null) {
            benefit.setAnnualEmployeeContribution(benefit.getEmployeeContribution().multiply(BigDecimal.valueOf(12)));
        }
        if (benefit.getEmployerContribution() != null) {
            benefit.setAnnualEmployerContribution(benefit.getEmployerContribution().multiply(BigDecimal.valueOf(12)));
        }
        
        return employeeBenefitRepository.save(benefit);
    }

    @Transactional
    public EmployeeBenefit updateEmployeeBenefit(Long id, Map<String, Object> data) {
        EmployeeBenefit benefit = employeeBenefitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee benefit not found"));
        updateEmployeeBenefitFromMap(benefit, data);
        
        if (benefit.getEmployeeContribution() != null) {
            benefit.setAnnualEmployeeContribution(benefit.getEmployeeContribution().multiply(BigDecimal.valueOf(12)));
        }
        if (benefit.getEmployerContribution() != null) {
            benefit.setAnnualEmployerContribution(benefit.getEmployerContribution().multiply(BigDecimal.valueOf(12)));
        }
        
        return employeeBenefitRepository.save(benefit);
    }

    private void updateEmployeeBenefitFromMap(EmployeeBenefit benefit, Map<String, Object> data) {
        if (data.containsKey("employeeId") && data.get("employeeId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("employeeId").toString())).ifPresent(benefit::setEmployee);
        }
        if (data.containsKey("benefitType")) benefit.setBenefitType((String) data.get("benefitType"));
        if (data.containsKey("planName")) benefit.setPlanName((String) data.get("planName"));
        if (data.containsKey("coverageLevel")) benefit.setCoverageLevel((String) data.get("coverageLevel"));
        if (data.containsKey("employeeContribution") && data.get("employeeContribution") != null) {
            benefit.setEmployeeContribution(new BigDecimal(data.get("employeeContribution").toString()));
        }
        if (data.containsKey("employerContribution") && data.get("employerContribution") != null) {
            benefit.setEmployerContribution(new BigDecimal(data.get("employerContribution").toString()));
        }
        if (data.containsKey("contributionType")) benefit.setContributionType((String) data.get("contributionType"));
        if (data.containsKey("contributionPercentage") && data.get("contributionPercentage") != null) {
            benefit.setContributionPercentage(new BigDecimal(data.get("contributionPercentage").toString()));
        }
        if (data.containsKey("employerMatchPercentage") && data.get("employerMatchPercentage") != null) {
            benefit.setEmployerMatchPercentage(new BigDecimal(data.get("employerMatchPercentage").toString()));
        }
        if (data.containsKey("employerMatchLimit") && data.get("employerMatchLimit") != null) {
            benefit.setEmployerMatchLimit(new BigDecimal(data.get("employerMatchLimit").toString()));
        }
        if (data.containsKey("enrollmentDate") && data.get("enrollmentDate") != null) {
            benefit.setEnrollmentDate(LocalDate.parse((String) data.get("enrollmentDate")));
        }
        if (data.containsKey("effectiveDate") && data.get("effectiveDate") != null) {
            benefit.setEffectiveDate(LocalDate.parse((String) data.get("effectiveDate")));
        }
        if (data.containsKey("terminationDate") && data.get("terminationDate") != null) {
            benefit.setTerminationDate(LocalDate.parse((String) data.get("terminationDate")));
        }
        if (data.containsKey("isPreTax")) benefit.setIsPreTax((Boolean) data.get("isPreTax"));
        if (data.containsKey("isActive")) benefit.setIsActive((Boolean) data.get("isActive"));
        if (data.containsKey("notes")) benefit.setNotes((String) data.get("notes"));
    }

    @Transactional
    public EmployeeBenefit terminateBenefit(Long id, LocalDate terminationDate) {
        EmployeeBenefit benefit = employeeBenefitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee benefit not found"));
        benefit.setTerminationDate(terminationDate);
        benefit.setIsActive(false);
        return employeeBenefitRepository.save(benefit);
    }

    @Transactional
    public void deleteEmployeeBenefit(Long id) {
        employeeBenefitRepository.deleteById(id);
    }

    public Map<String, Object> getCompensationDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalSalaryBands", salaryBandRepository.count());
        dashboard.put("activeSalaryBands", salaryBandRepository.findByIsActiveTrue().size());
        dashboard.put("totalBenefitPlans", benefitPlanRepository.count());
        dashboard.put("activeBenefitPlans", benefitPlanRepository.findByIsActiveTrue().size());
        return dashboard;
    }

    public Map<String, Object> getEmployeeCompensationSummary(Long employeeId) {
        Map<String, Object> summary = new HashMap<>();
        
        Optional<EmployeeSalary> currentSalary = employeeSalaryRepository.findByEmployeeIdAndIsCurrentTrue(employeeId);
        summary.put("currentSalary", currentSalary.orElse(null));
        
        List<EmployeeBenefit> activeBenefits = employeeBenefitRepository.findByEmployeeIdAndIsActiveTrue(employeeId);
        summary.put("activeBenefits", activeBenefits);
        
        BigDecimal totalBenefitCost = activeBenefits.stream()
            .map(b -> {
                BigDecimal emp = b.getEmployeeContribution() != null ? b.getEmployeeContribution() : BigDecimal.ZERO;
                BigDecimal empr = b.getEmployerContribution() != null ? b.getEmployerContribution() : BigDecimal.ZERO;
                return emp.add(empr);
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("monthlyBenefitCost", totalBenefitCost);
        
        List<EmployeeSalary> salaryHistory = employeeSalaryRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId);
        summary.put("salaryRevisions", salaryHistory.size());
        
        return summary;
    }
}
