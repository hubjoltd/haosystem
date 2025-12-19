package com.erp.controller;

import com.erp.model.*;
import com.erp.service.RecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruitment")
@CrossOrigin(origins = "*")
public class RecruitmentController {

    @Autowired
    private RecruitmentService recruitmentService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(recruitmentService.getRecruitmentDashboard());
    }

    @GetMapping("/requisitions")
    public ResponseEntity<List<JobRequisition>> getAllRequisitions() {
        return ResponseEntity.ok(recruitmentService.findAllRequisitions());
    }

    @GetMapping("/requisitions/{id}")
    public ResponseEntity<JobRequisition> getRequisition(@PathVariable Long id) {
        return recruitmentService.findRequisitionById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/requisitions/status/{status}")
    public ResponseEntity<List<JobRequisition>> getRequisitionsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(recruitmentService.findRequisitionsByStatus(status));
    }

    @GetMapping("/requisitions/open")
    public ResponseEntity<List<JobRequisition>> getOpenRequisitions() {
        return ResponseEntity.ok(recruitmentService.findOpenRequisitions());
    }

    @GetMapping("/requisitions/department/{departmentId}")
    public ResponseEntity<List<JobRequisition>> getRequisitionsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(recruitmentService.findRequisitionsByDepartment(departmentId));
    }

    @PostMapping("/requisitions")
    public ResponseEntity<JobRequisition> createRequisition(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.createRequisition(data));
    }

    @PutMapping("/requisitions/{id}")
    public ResponseEntity<JobRequisition> updateRequisition(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.updateRequisition(id, data));
    }

    @PostMapping("/requisitions/{id}/submit")
    public ResponseEntity<JobRequisition> submitRequisition(@PathVariable Long id) {
        return ResponseEntity.ok(recruitmentService.submitRequisition(id));
    }

    @PostMapping("/requisitions/{id}/approve")
    public ResponseEntity<JobRequisition> approveRequisition(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        Long approverId = Long.valueOf(data.get("approverId").toString());
        String remarks = (String) data.get("remarks");
        return ResponseEntity.ok(recruitmentService.approveRequisition(id, approverId, remarks));
    }

    @PostMapping("/requisitions/{id}/reject")
    public ResponseEntity<JobRequisition> rejectRequisition(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String reason = (String) data.get("reason");
        return ResponseEntity.ok(recruitmentService.rejectRequisition(id, reason));
    }

    @DeleteMapping("/requisitions/{id}")
    public ResponseEntity<Void> deleteRequisition(@PathVariable Long id) {
        recruitmentService.deleteRequisition(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/job-postings")
    public ResponseEntity<List<JobPosting>> getAllJobPostings() {
        return ResponseEntity.ok(recruitmentService.findAllJobPostings());
    }

    @GetMapping("/job-postings/{id}")
    public ResponseEntity<JobPosting> getJobPosting(@PathVariable Long id) {
        return recruitmentService.findJobPostingById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/job-postings/active")
    public ResponseEntity<List<JobPosting>> getActiveJobPostings() {
        return ResponseEntity.ok(recruitmentService.findActiveJobPostings());
    }

    @GetMapping("/job-postings/requisition/{requisitionId}")
    public ResponseEntity<List<JobPosting>> getJobPostingsByRequisition(@PathVariable Long requisitionId) {
        return ResponseEntity.ok(recruitmentService.findJobPostingsByRequisition(requisitionId));
    }

    @PostMapping("/job-postings")
    public ResponseEntity<JobPosting> createJobPosting(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.createJobPosting(data));
    }

    @PutMapping("/job-postings/{id}")
    public ResponseEntity<JobPosting> updateJobPosting(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.updateJobPosting(id, data));
    }

    @PostMapping("/job-postings/{id}/publish")
    public ResponseEntity<JobPosting> publishJobPosting(@PathVariable Long id) {
        return ResponseEntity.ok(recruitmentService.publishJobPosting(id));
    }

    @PostMapping("/job-postings/{id}/close")
    public ResponseEntity<JobPosting> closeJobPosting(@PathVariable Long id) {
        return ResponseEntity.ok(recruitmentService.closeJobPosting(id));
    }

    @DeleteMapping("/job-postings/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id) {
        recruitmentService.deleteJobPosting(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(recruitmentService.findAllCandidates());
    }

    @GetMapping("/candidates/{id}")
    public ResponseEntity<Candidate> getCandidate(@PathVariable Long id) {
        return recruitmentService.findCandidateById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/candidates/status/{status}")
    public ResponseEntity<List<Candidate>> getCandidatesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(recruitmentService.findCandidatesByStatus(status));
    }

    @GetMapping("/candidates/requisition/{requisitionId}")
    public ResponseEntity<List<Candidate>> getCandidatesByRequisition(@PathVariable Long requisitionId) {
        return ResponseEntity.ok(recruitmentService.findCandidatesByRequisition(requisitionId));
    }

    @GetMapping("/candidates/posting/{postingId}")
    public ResponseEntity<List<Candidate>> getCandidatesByPosting(@PathVariable Long postingId) {
        return ResponseEntity.ok(recruitmentService.findCandidatesByJobPosting(postingId));
    }

    @GetMapping("/candidates/search")
    public ResponseEntity<List<Candidate>> searchCandidates(@RequestParam String q) {
        return ResponseEntity.ok(recruitmentService.searchCandidates(q));
    }

    @PostMapping("/candidates")
    public ResponseEntity<Candidate> createCandidate(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.createCandidate(data));
    }

    @PutMapping("/candidates/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.updateCandidate(id, data));
    }

    @PostMapping("/candidates/{id}/stage")
    public ResponseEntity<Candidate> updateCandidateStage(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String stage = (String) data.get("stage");
        String status = (String) data.get("status");
        return ResponseEntity.ok(recruitmentService.updateCandidateStage(id, stage, status));
    }

    @PostMapping("/candidates/{id}/convert")
    public ResponseEntity<Employee> convertCandidate(@PathVariable Long id, @RequestBody Map<String, Object> employeeData) {
        return ResponseEntity.ok(recruitmentService.convertCandidateToEmployee(id, employeeData));
    }

    @DeleteMapping("/candidates/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        recruitmentService.deleteCandidate(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<Interview>> getAllInterviews() {
        return ResponseEntity.ok(recruitmentService.findAllInterviews());
    }

    @GetMapping("/interviews/{id}")
    public ResponseEntity<Interview> getInterview(@PathVariable Long id) {
        return recruitmentService.findInterviewById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/interviews/candidate/{candidateId}")
    public ResponseEntity<List<Interview>> getInterviewsByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(recruitmentService.findInterviewsByCandidate(candidateId));
    }

    @GetMapping("/interviews/interviewer/{interviewerId}")
    public ResponseEntity<List<Interview>> getInterviewsByInterviewer(@PathVariable Long interviewerId) {
        return ResponseEntity.ok(recruitmentService.findInterviewsByInterviewer(interviewerId));
    }

    @GetMapping("/interviews/scheduled")
    public ResponseEntity<List<Interview>> getScheduledInterviews(
            @RequestParam String start, @RequestParam String end) {
        LocalDateTime startDate = LocalDateTime.parse(start);
        LocalDateTime endDate = LocalDateTime.parse(end);
        return ResponseEntity.ok(recruitmentService.findScheduledInterviews(startDate, endDate));
    }

    @GetMapping("/interviews/upcoming")
    public ResponseEntity<List<Interview>> getUpcomingInterviews() {
        return ResponseEntity.ok(recruitmentService.findUpcomingInterviews());
    }

    @PostMapping("/interviews")
    public ResponseEntity<Interview> scheduleInterview(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.scheduleInterview(data));
    }

    @PutMapping("/interviews/{id}")
    public ResponseEntity<Interview> updateInterview(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.updateInterview(id, data));
    }

    @PostMapping("/interviews/{id}/complete")
    public ResponseEntity<Interview> completeInterview(@PathVariable Long id, @RequestBody Map<String, Object> feedbackData) {
        return ResponseEntity.ok(recruitmentService.completeInterview(id, feedbackData));
    }

    @PostMapping("/interviews/{id}/cancel")
    public ResponseEntity<Interview> cancelInterview(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String reason = (String) data.get("reason");
        return ResponseEntity.ok(recruitmentService.cancelInterview(id, reason));
    }

    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        recruitmentService.deleteInterview(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/offers")
    public ResponseEntity<List<OfferLetter>> getAllOfferLetters() {
        return ResponseEntity.ok(recruitmentService.findAllOfferLetters());
    }

    @GetMapping("/offers/{id}")
    public ResponseEntity<OfferLetter> getOfferLetter(@PathVariable Long id) {
        return recruitmentService.findOfferLetterById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/offers/candidate/{candidateId}")
    public ResponseEntity<List<OfferLetter>> getOffersByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(recruitmentService.findOfferLettersByCandidate(candidateId));
    }

    @GetMapping("/offers/status/{status}")
    public ResponseEntity<List<OfferLetter>> getOffersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(recruitmentService.findOfferLettersByStatus(status));
    }

    @PostMapping("/offers")
    public ResponseEntity<OfferLetter> createOfferLetter(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.createOfferLetter(data));
    }

    @PutMapping("/offers/{id}")
    public ResponseEntity<OfferLetter> updateOfferLetter(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(recruitmentService.updateOfferLetter(id, data));
    }

    @PostMapping("/offers/{id}/send")
    public ResponseEntity<OfferLetter> sendOfferLetter(@PathVariable Long id) {
        return ResponseEntity.ok(recruitmentService.sendOfferLetter(id));
    }

    @PostMapping("/offers/{id}/accept")
    public ResponseEntity<OfferLetter> acceptOfferLetter(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        LocalDate confirmedJoinDate = null;
        if (data.containsKey("confirmedJoinDate")) {
            confirmedJoinDate = LocalDate.parse((String) data.get("confirmedJoinDate"));
        }
        return ResponseEntity.ok(recruitmentService.acceptOfferLetter(id, confirmedJoinDate));
    }

    @PostMapping("/offers/{id}/decline")
    public ResponseEntity<OfferLetter> declineOfferLetter(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String reason = (String) data.get("reason");
        return ResponseEntity.ok(recruitmentService.declineOfferLetter(id, reason));
    }

    @DeleteMapping("/offers/{id}")
    public ResponseEntity<Void> deleteOfferLetter(@PathVariable Long id) {
        recruitmentService.deleteOfferLetter(id);
        return ResponseEntity.ok().build();
    }
}
