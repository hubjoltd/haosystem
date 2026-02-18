package com.erp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String employeeCode;
    
    private String firstName;
    private String middleName;
    private String lastName;
    
    private String email;
    private String phone;
    private String alternatePhone;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String maritalStatus;
    private String bloodGroup;
    private String nationality;
    
    @Column(columnDefinition = "TEXT")
    private String permanentAddress;
    private String permanentCity;
    private String permanentState;
    private String permanentCountry;
    private String permanentZipCode;
    
    @Column(columnDefinition = "TEXT")
    private String currentAddress;
    private String currentCity;
    private String currentState;
    private String currentCountry;
    private String currentZipCode;
    
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactPhone;
    
    private String profilePhoto;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "employees"})
    private Branch branch;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Department department;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designation_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Designation designation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_role_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private JobRole jobRole;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Grade grade;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Location location;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reportingManager", "department", "designation", "branch"})
    private Employee reportingManager;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_center_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CostCenter costCenter;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_center_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ExpenseCenter expenseCenter;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;
    
    private LocalDate joiningDate;
    private LocalDate confirmationDate;
    private LocalDate probationEndDate;
    private LocalDate resignationDate;
    private LocalDate lastWorkingDate;
    
    private String employmentType;
    private String employmentStatus;
    
    private String panNumber;
    private String aadharNumber;
    private String passportNumber;
    private LocalDate passportExpiry;
    
    private String ssn;
    private String nationalId;
    private String citizenship;
    private String visaType;
    private LocalDate visaExpiry;
    private String i9Status;
    private LocalDate i9ExpiryDate;
    private String workAuthorizationType;
    
    private Integer probationMonths;
    private Integer noticePeriodDays;
    
    private java.math.BigDecimal salary;
    private java.math.BigDecimal hourlyRate;
    
    private Boolean active = true;
    
    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String loginPassword;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    public Employee() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAlternatePhone() { return alternatePhone; }
    public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public String getPermanentAddress() { return permanentAddress; }
    public void setPermanentAddress(String permanentAddress) { this.permanentAddress = permanentAddress; }
    public String getPermanentCity() { return permanentCity; }
    public void setPermanentCity(String permanentCity) { this.permanentCity = permanentCity; }
    public String getPermanentState() { return permanentState; }
    public void setPermanentState(String permanentState) { this.permanentState = permanentState; }
    public String getPermanentCountry() { return permanentCountry; }
    public void setPermanentCountry(String permanentCountry) { this.permanentCountry = permanentCountry; }
    public String getPermanentZipCode() { return permanentZipCode; }
    public void setPermanentZipCode(String permanentZipCode) { this.permanentZipCode = permanentZipCode; }
    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }
    public String getCurrentCity() { return currentCity; }
    public void setCurrentCity(String currentCity) { this.currentCity = currentCity; }
    public String getCurrentState() { return currentState; }
    public void setCurrentState(String currentState) { this.currentState = currentState; }
    public String getCurrentCountry() { return currentCountry; }
    public void setCurrentCountry(String currentCountry) { this.currentCountry = currentCountry; }
    public String getCurrentZipCode() { return currentZipCode; }
    public void setCurrentZipCode(String currentZipCode) { this.currentZipCode = currentZipCode; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public String getEmergencyContactRelation() { return emergencyContactRelation; }
    public void setEmergencyContactRelation(String emergencyContactRelation) { this.emergencyContactRelation = emergencyContactRelation; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Designation getDesignation() { return designation; }
    public void setDesignation(Designation designation) { this.designation = designation; }
    public JobRole getJobRole() { return jobRole; }
    public void setJobRole(JobRole jobRole) { this.jobRole = jobRole; }
    public Grade getGrade() { return grade; }
    public void setGrade(Grade grade) { this.grade = grade; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public Employee getReportingManager() { return reportingManager; }
    public void setReportingManager(Employee reportingManager) { this.reportingManager = reportingManager; }
    public CostCenter getCostCenter() { return costCenter; }
    public void setCostCenter(CostCenter costCenter) { this.costCenter = costCenter; }
    public ExpenseCenter getExpenseCenter() { return expenseCenter; }
    public void setExpenseCenter(ExpenseCenter expenseCenter) { this.expenseCenter = expenseCenter; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
    public LocalDate getConfirmationDate() { return confirmationDate; }
    public void setConfirmationDate(LocalDate confirmationDate) { this.confirmationDate = confirmationDate; }
    public LocalDate getProbationEndDate() { return probationEndDate; }
    public void setProbationEndDate(LocalDate probationEndDate) { this.probationEndDate = probationEndDate; }
    public LocalDate getResignationDate() { return resignationDate; }
    public void setResignationDate(LocalDate resignationDate) { this.resignationDate = resignationDate; }
    public LocalDate getLastWorkingDate() { return lastWorkingDate; }
    public void setLastWorkingDate(LocalDate lastWorkingDate) { this.lastWorkingDate = lastWorkingDate; }
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }
    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }
    public String getAadharNumber() { return aadharNumber; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }
    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }
    public LocalDate getPassportExpiry() { return passportExpiry; }
    public void setPassportExpiry(LocalDate passportExpiry) { this.passportExpiry = passportExpiry; }
    public String getSsn() { return ssn; }
    public void setSsn(String ssn) { this.ssn = ssn; }
    public String getNationalId() { return nationalId; }
    public void setNationalId(String nationalId) { this.nationalId = nationalId; }
    public String getCitizenship() { return citizenship; }
    public void setCitizenship(String citizenship) { this.citizenship = citizenship; }
    public String getVisaType() { return visaType; }
    public void setVisaType(String visaType) { this.visaType = visaType; }
    public LocalDate getVisaExpiry() { return visaExpiry; }
    public void setVisaExpiry(LocalDate visaExpiry) { this.visaExpiry = visaExpiry; }
    public String getI9Status() { return i9Status; }
    public void setI9Status(String i9Status) { this.i9Status = i9Status; }
    public LocalDate getI9ExpiryDate() { return i9ExpiryDate; }
    public void setI9ExpiryDate(LocalDate i9ExpiryDate) { this.i9ExpiryDate = i9ExpiryDate; }
    public String getWorkAuthorizationType() { return workAuthorizationType; }
    public void setWorkAuthorizationType(String workAuthorizationType) { this.workAuthorizationType = workAuthorizationType; }
    public Integer getProbationMonths() { return probationMonths; }
    public void setProbationMonths(Integer probationMonths) { this.probationMonths = probationMonths; }
    public Integer getNoticePeriodDays() { return noticePeriodDays; }
    public void setNoticePeriodDays(Integer noticePeriodDays) { this.noticePeriodDays = noticePeriodDays; }
    public java.math.BigDecimal getSalary() { return salary; }
    public void setSalary(java.math.BigDecimal salary) { this.salary = salary; }
    public java.math.BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(java.math.BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public String getLoginPassword() { return loginPassword; }
    public void setLoginPassword(String loginPassword) { this.loginPassword = loginPassword; }
    
    public String getFullName() {
        StringBuilder name = new StringBuilder();
        if (firstName != null) name.append(firstName);
        if (middleName != null && !middleName.isEmpty()) name.append(" ").append(middleName);
        if (lastName != null) name.append(" ").append(lastName);
        return name.toString().trim();
    }
}
