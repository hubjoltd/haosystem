package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "offer_letters")
public class OfferLetter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 30)
    private String offerNumber;
    
    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
    
    @ManyToOne
    @JoinColumn(name = "requisition_id")
    private JobRequisition requisition;
    
    @Column(nullable = false, length = 200)
    private String positionTitle;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    
    @ManyToOne
    @JoinColumn(name = "reporting_to_id")
    private Employee reportingTo;
    
    @ManyToOne
    @JoinColumn(name = "grade_id")
    private Grade grade;
    
    @Column(length = 50)
    private String employmentType;
    
    private LocalDate proposedJoinDate;
    
    private BigDecimal offeredSalary;
    private BigDecimal signingBonus;
    
    @Column(columnDefinition = "TEXT")
    private String salaryBreakdown;
    
    @Column(columnDefinition = "TEXT")
    private String benefits;
    
    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;
    
    private LocalDate validUntil;
    
    @Column(nullable = false, length = 30)
    private String status = "DRAFT";
    
    private LocalDateTime sentAt;
    
    private LocalDateTime acceptedAt;
    private LocalDateTime declinedAt;
    
    @Column(columnDefinition = "TEXT")
    private String declineReason;
    
    @Column(length = 500)
    private String signedDocumentUrl;
    
    @ManyToOne
    @JoinColumn(name = "approved_by_id")
    private Employee approvedBy;
    
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String letterContent;
    
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
    public String getOfferNumber() { return offerNumber; }
    public void setOfferNumber(String offerNumber) { this.offerNumber = offerNumber; }
    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }
    public JobRequisition getRequisition() { return requisition; }
    public void setRequisition(JobRequisition requisition) { this.requisition = requisition; }
    public String getPositionTitle() { return positionTitle; }
    public void setPositionTitle(String positionTitle) { this.positionTitle = positionTitle; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public Employee getReportingTo() { return reportingTo; }
    public void setReportingTo(Employee reportingTo) { this.reportingTo = reportingTo; }
    public Grade getGrade() { return grade; }
    public void setGrade(Grade grade) { this.grade = grade; }
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    public LocalDate getProposedJoinDate() { return proposedJoinDate; }
    public void setProposedJoinDate(LocalDate proposedJoinDate) { this.proposedJoinDate = proposedJoinDate; }
    public BigDecimal getOfferedSalary() { return offeredSalary; }
    public void setOfferedSalary(BigDecimal offeredSalary) { this.offeredSalary = offeredSalary; }
    public BigDecimal getSigningBonus() { return signingBonus; }
    public void setSigningBonus(BigDecimal signingBonus) { this.signingBonus = signingBonus; }
    public String getSalaryBreakdown() { return salaryBreakdown; }
    public void setSalaryBreakdown(String salaryBreakdown) { this.salaryBreakdown = salaryBreakdown; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public String getTermsAndConditions() { return termsAndConditions; }
    public void setTermsAndConditions(String termsAndConditions) { this.termsAndConditions = termsAndConditions; }
    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
    public LocalDateTime getDeclinedAt() { return declinedAt; }
    public void setDeclinedAt(LocalDateTime declinedAt) { this.declinedAt = declinedAt; }
    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }
    public String getSignedDocumentUrl() { return signedDocumentUrl; }
    public void setSignedDocumentUrl(String signedDocumentUrl) { this.signedDocumentUrl = signedDocumentUrl; }
    public Employee getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Employee approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getLetterContent() { return letterContent; }
    public void setLetterContent(String letterContent) { this.letterContent = letterContent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
