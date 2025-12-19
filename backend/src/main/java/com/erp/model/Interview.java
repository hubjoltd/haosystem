package com.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
    
    @Column(nullable = false, length = 100)
    private String interviewType;
    
    @Column(length = 100)
    private String roundName;
    
    private Integer roundNumber = 1;
    
    private LocalDate interviewDate;
    private LocalTime startTime;
    private LocalTime endTime;
    
    @Column(length = 30)
    private String interviewMode;
    
    @Column(length = 500)
    private String location;
    
    @Column(length = 500)
    private String meetingLink;
    
    @ManyToOne
    @JoinColumn(name = "interviewer_id")
    private Employee interviewer;
    
    @Column(columnDefinition = "TEXT")
    private String interviewerNotes;
    
    @Column(columnDefinition = "TEXT")
    private String agenda;
    
    @Column(nullable = false, length = 30)
    private String status = "SCHEDULED";
    
    private Integer technicalRating;
    private Integer communicationRating;
    private Integer problemSolvingRating;
    private Integer cultureFitRating;
    private Integer overallRating;
    
    @Column(length = 30)
    private String recommendation;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(columnDefinition = "TEXT")
    private String strengths;
    
    @Column(columnDefinition = "TEXT")
    private String weaknesses;
    
    private LocalDateTime feedbackSubmittedAt;
    
    private Boolean candidateNotified = false;
    private Boolean interviewerNotified = false;
    
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
    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }
    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }
    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }
    public LocalDate getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDate interviewDate) { this.interviewDate = interviewDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getInterviewMode() { return interviewMode; }
    public void setInterviewMode(String interviewMode) { this.interviewMode = interviewMode; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public Employee getInterviewer() { return interviewer; }
    public void setInterviewer(Employee interviewer) { this.interviewer = interviewer; }
    public String getInterviewerNotes() { return interviewerNotes; }
    public void setInterviewerNotes(String interviewerNotes) { this.interviewerNotes = interviewerNotes; }
    public String getAgenda() { return agenda; }
    public void setAgenda(String agenda) { this.agenda = agenda; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTechnicalRating() { return technicalRating; }
    public void setTechnicalRating(Integer technicalRating) { this.technicalRating = technicalRating; }
    public Integer getCommunicationRating() { return communicationRating; }
    public void setCommunicationRating(Integer communicationRating) { this.communicationRating = communicationRating; }
    public Integer getProblemSolvingRating() { return problemSolvingRating; }
    public void setProblemSolvingRating(Integer problemSolvingRating) { this.problemSolvingRating = problemSolvingRating; }
    public Integer getCultureFitRating() { return cultureFitRating; }
    public void setCultureFitRating(Integer cultureFitRating) { this.cultureFitRating = cultureFitRating; }
    public Integer getOverallRating() { return overallRating; }
    public void setOverallRating(Integer overallRating) { this.overallRating = overallRating; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
    public LocalDateTime getFeedbackSubmittedAt() { return feedbackSubmittedAt; }
    public void setFeedbackSubmittedAt(LocalDateTime feedbackSubmittedAt) { this.feedbackSubmittedAt = feedbackSubmittedAt; }
    public Boolean getCandidateNotified() { return candidateNotified; }
    public void setCandidateNotified(Boolean candidateNotified) { this.candidateNotified = candidateNotified; }
    public Boolean getInterviewerNotified() { return interviewerNotified; }
    public void setInterviewerNotified(Boolean interviewerNotified) { this.interviewerNotified = interviewerNotified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
