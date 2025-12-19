package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "candidates")
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 30)
    private String candidateNumber;
    
    @Column(nullable = false, length = 100)
    private String firstName;
    
    @Column(length = 100)
    private String middleName;
    
    @Column(nullable = false, length = 100)
    private String lastName;
    
    @Column(nullable = false, length = 150)
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 20)
    private String alternatePhone;
    
    private LocalDate dateOfBirth;
    
    @Column(length = 20)
    private String gender;
    
    @Column(columnDefinition = "TEXT")
    private String currentAddress;
    
    @Column(length = 100)
    private String city;
    
    @Column(length = 100)
    private String state;
    
    @Column(length = 100)
    private String country;
    
    @Column(length = 20)
    private String postalCode;
    
    @Column(length = 200)
    private String currentEmployer;
    
    @Column(length = 200)
    private String currentDesignation;
    
    private BigDecimal currentSalary;
    private BigDecimal expectedSalary;
    
    private Integer totalExperience;
    private Integer relevantExperience;
    
    @Column(length = 30)
    private String noticePeriod;
    
    private LocalDate availableFrom;
    
    @Column(length = 200)
    private String highestEducation;
    
    @Column(length = 200)
    private String university;
    
    private Integer graduationYear;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    @Column(columnDefinition = "TEXT")
    private String certifications;
    
    @Column(length = 500)
    private String linkedinUrl;
    
    @Column(length = 500)
    private String portfolioUrl;
    
    @Column(length = 500)
    private String resumeUrl;
    
    @Column(columnDefinition = "TEXT")
    private String resumeText;
    
    @Column(length = 50)
    private String source;
    
    @Column(length = 200)
    private String referredBy;
    
    @ManyToOne
    @JoinColumn(name = "job_posting_id")
    private JobPosting jobPosting;
    
    @ManyToOne
    @JoinColumn(name = "requisition_id")
    private JobRequisition requisition;
    
    @Column(nullable = false, length = 30)
    private String status = "NEW";
    
    @Column(length = 30)
    private String stage = "APPLICATION";
    
    private Integer overallRating;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @ManyToOne
    @JoinColumn(name = "assigned_recruiter_id")
    private Employee assignedRecruiter;
    
    @ManyToOne
    @JoinColumn(name = "converted_employee_id")
    private Employee convertedEmployee;
    
    private LocalDateTime convertedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    
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
    public String getCandidateNumber() { return candidateNumber; }
    public void setCandidateNumber(String candidateNumber) { this.candidateNumber = candidateNumber; }
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
    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getCurrentEmployer() { return currentEmployer; }
    public void setCurrentEmployer(String currentEmployer) { this.currentEmployer = currentEmployer; }
    public String getCurrentDesignation() { return currentDesignation; }
    public void setCurrentDesignation(String currentDesignation) { this.currentDesignation = currentDesignation; }
    public BigDecimal getCurrentSalary() { return currentSalary; }
    public void setCurrentSalary(BigDecimal currentSalary) { this.currentSalary = currentSalary; }
    public BigDecimal getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(BigDecimal expectedSalary) { this.expectedSalary = expectedSalary; }
    public Integer getTotalExperience() { return totalExperience; }
    public void setTotalExperience(Integer totalExperience) { this.totalExperience = totalExperience; }
    public Integer getRelevantExperience() { return relevantExperience; }
    public void setRelevantExperience(Integer relevantExperience) { this.relevantExperience = relevantExperience; }
    public String getNoticePeriod() { return noticePeriod; }
    public void setNoticePeriod(String noticePeriod) { this.noticePeriod = noticePeriod; }
    public LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }
    public String getHighestEducation() { return highestEducation; }
    public void setHighestEducation(String highestEducation) { this.highestEducation = highestEducation; }
    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getReferredBy() { return referredBy; }
    public void setReferredBy(String referredBy) { this.referredBy = referredBy; }
    public JobPosting getJobPosting() { return jobPosting; }
    public void setJobPosting(JobPosting jobPosting) { this.jobPosting = jobPosting; }
    public JobRequisition getRequisition() { return requisition; }
    public void setRequisition(JobRequisition requisition) { this.requisition = requisition; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }
    public Integer getOverallRating() { return overallRating; }
    public void setOverallRating(Integer overallRating) { this.overallRating = overallRating; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Employee getAssignedRecruiter() { return assignedRecruiter; }
    public void setAssignedRecruiter(Employee assignedRecruiter) { this.assignedRecruiter = assignedRecruiter; }
    public Employee getConvertedEmployee() { return convertedEmployee; }
    public void setConvertedEmployee(Employee convertedEmployee) { this.convertedEmployee = convertedEmployee; }
    public LocalDateTime getConvertedAt() { return convertedAt; }
    public void setConvertedAt(LocalDateTime convertedAt) { this.convertedAt = convertedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
