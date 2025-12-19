package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_enrollments")
public class TrainingEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private TrainingSession session;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    private LocalDate enrolledDate;
    
    @Column(nullable = false, length = 30)
    private String status = "ENROLLED";
    
    private Boolean attended = false;
    private LocalDateTime attendanceMarkedAt;
    
    private Integer attendancePercentage;
    
    private Boolean completed = false;
    private LocalDateTime completedAt;
    
    private Integer score;
    
    @Column(length = 20)
    private String grade;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    private Integer rating;
    
    private Boolean certificateIssued = false;
    
    @Column(length = 100)
    private String certificateNumber;
    
    private LocalDate certificateIssuedDate;
    private LocalDate certificateExpiryDate;
    
    @Column(length = 500)
    private String certificateUrl;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
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
    public TrainingSession getSession() { return session; }
    public void setSession(TrainingSession session) { this.session = session; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public LocalDate getEnrolledDate() { return enrolledDate; }
    public void setEnrolledDate(LocalDate enrolledDate) { this.enrolledDate = enrolledDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }
    public LocalDateTime getAttendanceMarkedAt() { return attendanceMarkedAt; }
    public void setAttendanceMarkedAt(LocalDateTime attendanceMarkedAt) { this.attendanceMarkedAt = attendanceMarkedAt; }
    public Integer getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Integer attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public Boolean getCertificateIssued() { return certificateIssued; }
    public void setCertificateIssued(Boolean certificateIssued) { this.certificateIssued = certificateIssued; }
    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }
    public LocalDate getCertificateIssuedDate() { return certificateIssuedDate; }
    public void setCertificateIssuedDate(LocalDate certificateIssuedDate) { this.certificateIssuedDate = certificateIssuedDate; }
    public LocalDate getCertificateExpiryDate() { return certificateExpiryDate; }
    public void setCertificateExpiryDate(LocalDate certificateExpiryDate) { this.certificateExpiryDate = certificateExpiryDate; }
    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
