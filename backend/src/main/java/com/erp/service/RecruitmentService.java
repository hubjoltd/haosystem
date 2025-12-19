package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RecruitmentService {

    @Autowired
    private JobRequisitionRepository requisitionRepository;

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private OfferLetterRepository offerLetterRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private DesignationRepository designationRepository;

    public List<JobRequisition> findAllRequisitions() {
        return requisitionRepository.findAll();
    }

    public Optional<JobRequisition> findRequisitionById(Long id) {
        return requisitionRepository.findById(id);
    }

    public List<JobRequisition> findRequisitionsByStatus(String status) {
        return requisitionRepository.findByStatus(status);
    }

    public List<JobRequisition> findOpenRequisitions() {
        return requisitionRepository.findOpenRequisitions();
    }

    public List<JobRequisition> findRequisitionsByDepartment(Long departmentId) {
        return requisitionRepository.findByDepartmentId(departmentId);
    }

    @Transactional
    public JobRequisition createRequisition(Map<String, Object> data) {
        JobRequisition req = new JobRequisition();
        req.setRequisitionNumber(generateRequisitionNumber());
        updateRequisitionFromMap(req, data);
        req.setStatus("DRAFT");
        return requisitionRepository.save(req);
    }

    @Transactional
    public JobRequisition updateRequisition(Long id, Map<String, Object> data) {
        JobRequisition req = requisitionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Requisition not found"));
        updateRequisitionFromMap(req, data);
        return requisitionRepository.save(req);
    }

    private void updateRequisitionFromMap(JobRequisition req, Map<String, Object> data) {
        if (data.containsKey("positionTitle")) req.setPositionTitle((String) data.get("positionTitle"));
        if (data.containsKey("departmentId") && data.get("departmentId") != null) {
            departmentRepository.findById(Long.valueOf(data.get("departmentId").toString())).ifPresent(req::setDepartment);
        }
        if (data.containsKey("jobRoleId") && data.get("jobRoleId") != null) {
            jobRoleRepository.findById(Long.valueOf(data.get("jobRoleId").toString())).ifPresent(req::setJobRole);
        }
        if (data.containsKey("gradeId") && data.get("gradeId") != null) {
            gradeRepository.findById(Long.valueOf(data.get("gradeId").toString())).ifPresent(req::setGrade);
        }
        if (data.containsKey("locationId") && data.get("locationId") != null) {
            locationRepository.findById(Long.valueOf(data.get("locationId").toString())).ifPresent(req::setLocation);
        }
        if (data.containsKey("reportingToId") && data.get("reportingToId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("reportingToId").toString())).ifPresent(req::setReportingTo);
        }
        if (data.containsKey("numberOfPositions")) req.setNumberOfPositions(Integer.valueOf(data.get("numberOfPositions").toString()));
        if (data.containsKey("employmentType")) req.setEmploymentType((String) data.get("employmentType"));
        if (data.containsKey("requisitionType")) req.setRequisitionType((String) data.get("requisitionType"));
        if (data.containsKey("justification")) req.setJustification((String) data.get("justification"));
        if (data.containsKey("jobDescription")) req.setJobDescription((String) data.get("jobDescription"));
        if (data.containsKey("requirements")) req.setRequirements((String) data.get("requirements"));
        if (data.containsKey("skills")) req.setSkills((String) data.get("skills"));
        if (data.containsKey("minExperience")) req.setMinExperience(Integer.valueOf(data.get("minExperience").toString()));
        if (data.containsKey("maxExperience")) req.setMaxExperience(Integer.valueOf(data.get("maxExperience").toString()));
        if (data.containsKey("educationRequirement")) req.setEducationRequirement((String) data.get("educationRequirement"));
        if (data.containsKey("budgetedSalaryMin") && data.get("budgetedSalaryMin") != null) {
            req.setBudgetedSalaryMin(new BigDecimal(data.get("budgetedSalaryMin").toString()));
        }
        if (data.containsKey("budgetedSalaryMax") && data.get("budgetedSalaryMax") != null) {
            req.setBudgetedSalaryMax(new BigDecimal(data.get("budgetedSalaryMax").toString()));
        }
        if (data.containsKey("priority")) req.setPriority((String) data.get("priority"));
        if (data.containsKey("targetJoinDate") && data.get("targetJoinDate") != null) {
            req.setTargetJoinDate(LocalDate.parse((String) data.get("targetJoinDate")));
        }
        if (data.containsKey("requestedById") && data.get("requestedById") != null) {
            employeeRepository.findById(Long.valueOf(data.get("requestedById").toString())).ifPresent(req::setRequestedBy);
        }
        if (data.containsKey("createdBy")) req.setCreatedBy((String) data.get("createdBy"));
        if (data.containsKey("updatedBy")) req.setUpdatedBy((String) data.get("updatedBy"));
    }

    @Transactional
    public JobRequisition submitRequisition(Long id) {
        JobRequisition req = requisitionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Requisition not found"));
        req.setStatus("PENDING_APPROVAL");
        req.setSubmittedAt(LocalDateTime.now());
        return requisitionRepository.save(req);
    }

    @Transactional
    public JobRequisition approveRequisition(Long id, Long approverId, String remarks) {
        JobRequisition req = requisitionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Requisition not found"));
        employeeRepository.findById(approverId).ifPresent(req::setApprovedBy);
        req.setApprovedAt(LocalDateTime.now());
        req.setApproverRemarks(remarks);
        req.setStatus("APPROVED");
        return requisitionRepository.save(req);
    }

    @Transactional
    public JobRequisition rejectRequisition(Long id, String reason) {
        JobRequisition req = requisitionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Requisition not found"));
        req.setRejectedAt(LocalDateTime.now());
        req.setRejectionReason(reason);
        req.setStatus("REJECTED");
        return requisitionRepository.save(req);
    }

    @Transactional
    public void deleteRequisition(Long id) {
        requisitionRepository.deleteById(id);
    }

    public List<JobPosting> findAllJobPostings() {
        return jobPostingRepository.findAll();
    }

    public Optional<JobPosting> findJobPostingById(Long id) {
        return jobPostingRepository.findById(id);
    }

    public List<JobPosting> findActiveJobPostings() {
        return jobPostingRepository.findActivePostings(LocalDate.now());
    }

    public List<JobPosting> findJobPostingsByRequisition(Long requisitionId) {
        return jobPostingRepository.findByRequisitionId(requisitionId);
    }

    @Transactional
    public JobPosting createJobPosting(Map<String, Object> data) {
        JobPosting posting = new JobPosting();
        posting.setPostingNumber(generatePostingNumber());
        updateJobPostingFromMap(posting, data);
        posting.setStatus("DRAFT");
        return jobPostingRepository.save(posting);
    }

    @Transactional
    public JobPosting updateJobPosting(Long id, Map<String, Object> data) {
        JobPosting posting = jobPostingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job posting not found"));
        updateJobPostingFromMap(posting, data);
        return jobPostingRepository.save(posting);
    }

    private void updateJobPostingFromMap(JobPosting posting, Map<String, Object> data) {
        if (data.containsKey("requisitionId") && data.get("requisitionId") != null) {
            requisitionRepository.findById(Long.valueOf(data.get("requisitionId").toString())).ifPresent(posting::setRequisition);
        }
        if (data.containsKey("title")) posting.setTitle((String) data.get("title"));
        if (data.containsKey("postingType")) posting.setPostingType((String) data.get("postingType"));
        if (data.containsKey("description")) posting.setDescription((String) data.get("description"));
        if (data.containsKey("requirements")) posting.setRequirements((String) data.get("requirements"));
        if (data.containsKey("benefits")) posting.setBenefits((String) data.get("benefits"));
        if (data.containsKey("openDate") && data.get("openDate") != null) {
            posting.setOpenDate(LocalDate.parse((String) data.get("openDate")));
        }
        if (data.containsKey("closeDate") && data.get("closeDate") != null) {
            posting.setCloseDate(LocalDate.parse((String) data.get("closeDate")));
        }
        if (data.containsKey("applicationUrl")) posting.setApplicationUrl((String) data.get("applicationUrl"));
        if (data.containsKey("externalJobBoards")) posting.setExternalJobBoards((String) data.get("externalJobBoards"));
    }

    @Transactional
    public JobPosting publishJobPosting(Long id) {
        JobPosting posting = jobPostingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job posting not found"));
        posting.setStatus("ACTIVE");
        posting.setOpenDate(LocalDate.now());
        posting.setPublishedAt(LocalDateTime.now());
        return jobPostingRepository.save(posting);
    }

    @Transactional
    public JobPosting closeJobPosting(Long id) {
        JobPosting posting = jobPostingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job posting not found"));
        posting.setStatus("CLOSED");
        posting.setClosedAt(LocalDateTime.now());
        return jobPostingRepository.save(posting);
    }

    @Transactional
    public void deleteJobPosting(Long id) {
        jobPostingRepository.deleteById(id);
    }

    public List<Candidate> findAllCandidates() {
        return candidateRepository.findAll();
    }

    public Optional<Candidate> findCandidateById(Long id) {
        return candidateRepository.findById(id);
    }

    public List<Candidate> findCandidatesByStatus(String status) {
        return candidateRepository.findByStatus(status);
    }

    public List<Candidate> findCandidatesByRequisition(Long requisitionId) {
        return candidateRepository.findByRequisitionId(requisitionId);
    }

    public List<Candidate> searchCandidates(String search) {
        return candidateRepository.searchCandidates(search);
    }

    @Transactional
    public Candidate createCandidate(Map<String, Object> data) {
        Candidate candidate = new Candidate();
        candidate.setCandidateNumber(generateCandidateNumber());
        updateCandidateFromMap(candidate, data);
        candidate.setStatus("NEW");
        candidate.setStage("APPLICATION");
        return candidateRepository.save(candidate);
    }

    @Transactional
    public Candidate updateCandidate(Long id, Map<String, Object> data) {
        Candidate candidate = candidateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
        updateCandidateFromMap(candidate, data);
        return candidateRepository.save(candidate);
    }

    private void updateCandidateFromMap(Candidate candidate, Map<String, Object> data) {
        if (data.containsKey("firstName")) candidate.setFirstName((String) data.get("firstName"));
        if (data.containsKey("middleName")) candidate.setMiddleName((String) data.get("middleName"));
        if (data.containsKey("lastName")) candidate.setLastName((String) data.get("lastName"));
        if (data.containsKey("email")) candidate.setEmail((String) data.get("email"));
        if (data.containsKey("phone")) candidate.setPhone((String) data.get("phone"));
        if (data.containsKey("alternatePhone")) candidate.setAlternatePhone((String) data.get("alternatePhone"));
        if (data.containsKey("dateOfBirth") && data.get("dateOfBirth") != null) {
            candidate.setDateOfBirth(LocalDate.parse((String) data.get("dateOfBirth")));
        }
        if (data.containsKey("gender")) candidate.setGender((String) data.get("gender"));
        if (data.containsKey("currentAddress")) candidate.setCurrentAddress((String) data.get("currentAddress"));
        if (data.containsKey("city")) candidate.setCity((String) data.get("city"));
        if (data.containsKey("state")) candidate.setState((String) data.get("state"));
        if (data.containsKey("country")) candidate.setCountry((String) data.get("country"));
        if (data.containsKey("postalCode")) candidate.setPostalCode((String) data.get("postalCode"));
        if (data.containsKey("currentEmployer")) candidate.setCurrentEmployer((String) data.get("currentEmployer"));
        if (data.containsKey("currentDesignation")) candidate.setCurrentDesignation((String) data.get("currentDesignation"));
        if (data.containsKey("currentSalary") && data.get("currentSalary") != null) {
            candidate.setCurrentSalary(new BigDecimal(data.get("currentSalary").toString()));
        }
        if (data.containsKey("expectedSalary") && data.get("expectedSalary") != null) {
            candidate.setExpectedSalary(new BigDecimal(data.get("expectedSalary").toString()));
        }
        if (data.containsKey("totalExperience")) candidate.setTotalExperience(Integer.valueOf(data.get("totalExperience").toString()));
        if (data.containsKey("relevantExperience")) candidate.setRelevantExperience(Integer.valueOf(data.get("relevantExperience").toString()));
        if (data.containsKey("noticePeriod")) candidate.setNoticePeriod((String) data.get("noticePeriod"));
        if (data.containsKey("availableFrom") && data.get("availableFrom") != null) {
            candidate.setAvailableFrom(LocalDate.parse((String) data.get("availableFrom")));
        }
        if (data.containsKey("highestEducation")) candidate.setHighestEducation((String) data.get("highestEducation"));
        if (data.containsKey("university")) candidate.setUniversity((String) data.get("university"));
        if (data.containsKey("graduationYear")) candidate.setGraduationYear(Integer.valueOf(data.get("graduationYear").toString()));
        if (data.containsKey("skills")) candidate.setSkills((String) data.get("skills"));
        if (data.containsKey("certifications")) candidate.setCertifications((String) data.get("certifications"));
        if (data.containsKey("linkedinUrl")) candidate.setLinkedinUrl((String) data.get("linkedinUrl"));
        if (data.containsKey("portfolioUrl")) candidate.setPortfolioUrl((String) data.get("portfolioUrl"));
        if (data.containsKey("resumeUrl")) candidate.setResumeUrl((String) data.get("resumeUrl"));
        if (data.containsKey("resumeText")) candidate.setResumeText((String) data.get("resumeText"));
        if (data.containsKey("source")) candidate.setSource((String) data.get("source"));
        if (data.containsKey("referredBy")) candidate.setReferredBy((String) data.get("referredBy"));
        if (data.containsKey("jobPostingId") && data.get("jobPostingId") != null) {
            jobPostingRepository.findById(Long.valueOf(data.get("jobPostingId").toString())).ifPresent(candidate::setJobPosting);
        }
        if (data.containsKey("requisitionId") && data.get("requisitionId") != null) {
            requisitionRepository.findById(Long.valueOf(data.get("requisitionId").toString())).ifPresent(candidate::setRequisition);
        }
        if (data.containsKey("assignedRecruiterId") && data.get("assignedRecruiterId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("assignedRecruiterId").toString())).ifPresent(candidate::setAssignedRecruiter);
        }
        if (data.containsKey("notes")) candidate.setNotes((String) data.get("notes"));
        if (data.containsKey("overallRating")) candidate.setOverallRating(Integer.valueOf(data.get("overallRating").toString()));
        if (data.containsKey("createdBy")) candidate.setCreatedBy((String) data.get("createdBy"));
    }

    @Transactional
    public Candidate updateCandidateStage(Long id, String stage, String status) {
        Candidate candidate = candidateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
        candidate.setStage(stage);
        if (status != null) candidate.setStatus(status);
        return candidateRepository.save(candidate);
    }

    @Transactional
    public void deleteCandidate(Long id) {
        candidateRepository.deleteById(id);
    }

    public List<Interview> findAllInterviews() {
        return interviewRepository.findAll();
    }

    public Optional<Interview> findInterviewById(Long id) {
        return interviewRepository.findById(id);
    }

    public List<Interview> findInterviewsByCandidate(Long candidateId) {
        return interviewRepository.findByCandidateIdOrderByScheduledAtDesc(candidateId);
    }

    public List<Interview> findInterviewsByInterviewer(Long interviewerId) {
        return interviewRepository.findByInterviewerId(interviewerId);
    }

    public List<Interview> findScheduledInterviews(LocalDateTime start, LocalDateTime end) {
        return interviewRepository.findScheduledInterviewsBetween(start.toLocalDate(), end.toLocalDate());
    }

    @Transactional
    public Interview scheduleInterview(Map<String, Object> data) {
        Interview interview = new Interview();
        updateInterviewFromMap(interview, data);
        interview.setStatus("SCHEDULED");
        return interviewRepository.save(interview);
    }

    @Transactional
    public Interview updateInterview(Long id, Map<String, Object> data) {
        Interview interview = interviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        updateInterviewFromMap(interview, data);
        return interviewRepository.save(interview);
    }

    private void updateInterviewFromMap(Interview interview, Map<String, Object> data) {
        if (data.containsKey("candidateId") && data.get("candidateId") != null) {
            candidateRepository.findById(Long.valueOf(data.get("candidateId").toString())).ifPresent(interview::setCandidate);
        }
        if (data.containsKey("interviewerId") && data.get("interviewerId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("interviewerId").toString())).ifPresent(interview::setInterviewer);
        }
        if (data.containsKey("interviewType")) interview.setInterviewType((String) data.get("interviewType"));
        if (data.containsKey("roundNumber")) interview.setRoundNumber(Integer.valueOf(data.get("roundNumber").toString()));
        if (data.containsKey("interviewDate") && data.get("interviewDate") != null) {
            interview.setInterviewDate(LocalDate.parse((String) data.get("interviewDate")));
        }
        if (data.containsKey("startTime") && data.get("startTime") != null) {
            interview.setStartTime(java.time.LocalTime.parse((String) data.get("startTime")));
        }
        if (data.containsKey("endTime") && data.get("endTime") != null) {
            interview.setEndTime(java.time.LocalTime.parse((String) data.get("endTime")));
        }
        if (data.containsKey("interviewMode")) interview.setInterviewMode((String) data.get("interviewMode"));
        if (data.containsKey("location")) interview.setLocation((String) data.get("location"));
        if (data.containsKey("meetingLink")) interview.setMeetingLink((String) data.get("meetingLink"));
        if (data.containsKey("interviewerNotes")) interview.setInterviewerNotes((String) data.get("interviewerNotes"));
    }

    @Transactional
    public Interview completeInterview(Long id, Map<String, Object> feedbackData) {
        Interview interview = interviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus("COMPLETED");
        interview.setFeedbackSubmittedAt(LocalDateTime.now());
        if (feedbackData.containsKey("feedback")) interview.setFeedback((String) feedbackData.get("feedback"));
        if (feedbackData.containsKey("overallRating")) interview.setOverallRating(Integer.valueOf(feedbackData.get("overallRating").toString()));
        if (feedbackData.containsKey("recommendation")) interview.setRecommendation((String) feedbackData.get("recommendation"));
        if (feedbackData.containsKey("strengths")) interview.setStrengths((String) feedbackData.get("strengths"));
        if (feedbackData.containsKey("weaknesses")) interview.setWeaknesses((String) feedbackData.get("weaknesses"));
        return interviewRepository.save(interview);
    }

    @Transactional
    public Interview cancelInterview(Long id, String reason) {
        Interview interview = interviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus("CANCELLED");
        interview.setInterviewerNotes(reason);
        return interviewRepository.save(interview);
    }

    @Transactional
    public void deleteInterview(Long id) {
        interviewRepository.deleteById(id);
    }

    public List<OfferLetter> findAllOfferLetters() {
        return offerLetterRepository.findAll();
    }

    public Optional<OfferLetter> findOfferLetterById(Long id) {
        return offerLetterRepository.findById(id);
    }

    public List<OfferLetter> findOfferLettersByCandidate(Long candidateId) {
        return offerLetterRepository.findByCandidateId(candidateId);
    }

    public List<OfferLetter> findOfferLettersByStatus(String status) {
        return offerLetterRepository.findByStatus(status);
    }

    @Transactional
    public OfferLetter createOfferLetter(Map<String, Object> data) {
        OfferLetter offer = new OfferLetter();
        offer.setOfferNumber(generateOfferNumber());
        updateOfferLetterFromMap(offer, data);
        offer.setStatus("DRAFT");
        return offerLetterRepository.save(offer);
    }

    @Transactional
    public OfferLetter updateOfferLetter(Long id, Map<String, Object> data) {
        OfferLetter offer = offerLetterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Offer letter not found"));
        updateOfferLetterFromMap(offer, data);
        return offerLetterRepository.save(offer);
    }

    private void updateOfferLetterFromMap(OfferLetter offer, Map<String, Object> data) {
        if (data.containsKey("candidateId") && data.get("candidateId") != null) {
            candidateRepository.findById(Long.valueOf(data.get("candidateId").toString())).ifPresent(offer::setCandidate);
        }
        if (data.containsKey("requisitionId") && data.get("requisitionId") != null) {
            requisitionRepository.findById(Long.valueOf(data.get("requisitionId").toString())).ifPresent(offer::setRequisition);
        }
        if (data.containsKey("positionTitle")) {
            offer.setPositionTitle((String) data.get("positionTitle"));
        }
        if (data.containsKey("gradeId") && data.get("gradeId") != null) {
            gradeRepository.findById(Long.valueOf(data.get("gradeId").toString())).ifPresent(offer::setGrade);
        }
        if (data.containsKey("departmentId") && data.get("departmentId") != null) {
            departmentRepository.findById(Long.valueOf(data.get("departmentId").toString())).ifPresent(offer::setDepartment);
        }
        if (data.containsKey("locationId") && data.get("locationId") != null) {
            locationRepository.findById(Long.valueOf(data.get("locationId").toString())).ifPresent(offer::setLocation);
        }
        if (data.containsKey("reportingToId") && data.get("reportingToId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("reportingToId").toString())).ifPresent(offer::setReportingTo);
        }
        if (data.containsKey("offeredSalary") && data.get("offeredSalary") != null) {
            offer.setOfferedSalary(new BigDecimal(data.get("offeredSalary").toString()));
        }
        if (data.containsKey("signingBonus") && data.get("signingBonus") != null) {
            offer.setSigningBonus(new BigDecimal(data.get("signingBonus").toString()));
        }
        if (data.containsKey("proposedJoinDate") && data.get("proposedJoinDate") != null) {
            offer.setProposedJoinDate(LocalDate.parse((String) data.get("proposedJoinDate")));
        }
        if (data.containsKey("validUntil") && data.get("validUntil") != null) {
            offer.setValidUntil(LocalDate.parse((String) data.get("validUntil")));
        }
        if (data.containsKey("termsAndConditions")) offer.setTermsAndConditions((String) data.get("termsAndConditions"));
        if (data.containsKey("benefits")) offer.setBenefits((String) data.get("benefits"));
    }

    @Transactional
    public OfferLetter sendOfferLetter(Long id) {
        OfferLetter offer = offerLetterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Offer letter not found"));
        offer.setStatus("SENT");
        offer.setSentAt(LocalDateTime.now());
        return offerLetterRepository.save(offer);
    }

    @Transactional
    public OfferLetter acceptOfferLetter(Long id, LocalDate confirmedJoinDate) {
        OfferLetter offer = offerLetterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Offer letter not found"));
        offer.setStatus("ACCEPTED");
        offer.setAcceptedAt(LocalDateTime.now());
        if (confirmedJoinDate != null) {
            offer.setProposedJoinDate(confirmedJoinDate);
        }
        Candidate candidate = offer.getCandidate();
        if (candidate != null) {
            candidate.setStatus("HIRED");
            candidate.setStage("OFFER_ACCEPTED");
            candidateRepository.save(candidate);
        }
        return offerLetterRepository.save(offer);
    }

    @Transactional
    public OfferLetter declineOfferLetter(Long id, String reason) {
        OfferLetter offer = offerLetterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Offer letter not found"));
        offer.setStatus("DECLINED");
        offer.setDeclinedAt(LocalDateTime.now());
        offer.setDeclineReason(reason);
        return offerLetterRepository.save(offer);
    }

    @Transactional
    public Employee convertCandidateToEmployee(Long candidateId, Map<String, Object> employeeData) {
        Candidate candidate = candidateRepository.findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));

        Employee employee = new Employee();
        employee.setFirstName(candidate.getFirstName());
        employee.setMiddleName(candidate.getMiddleName());
        employee.setLastName(candidate.getLastName());
        employee.setEmail(candidate.getEmail());
        employee.setPhone(candidate.getPhone());
        employee.setDateOfBirth(candidate.getDateOfBirth());
        employee.setGender(candidate.getGender());

        if (employeeData.containsKey("employeeCode")) employee.setEmployeeCode((String) employeeData.get("employeeCode"));
        if (employeeData.containsKey("departmentId") && employeeData.get("departmentId") != null) {
            departmentRepository.findById(Long.valueOf(employeeData.get("departmentId").toString())).ifPresent(employee::setDepartment);
        }
        if (employeeData.containsKey("designationId") && employeeData.get("designationId") != null) {
            designationRepository.findById(Long.valueOf(employeeData.get("designationId").toString())).ifPresent(employee::setDesignation);
        }
        if (employeeData.containsKey("locationId") && employeeData.get("locationId") != null) {
            locationRepository.findById(Long.valueOf(employeeData.get("locationId").toString())).ifPresent(employee::setLocation);
        }
        if (employeeData.containsKey("gradeId") && employeeData.get("gradeId") != null) {
            gradeRepository.findById(Long.valueOf(employeeData.get("gradeId").toString())).ifPresent(employee::setGrade);
        }
        if (employeeData.containsKey("reportingManagerId") && employeeData.get("reportingManagerId") != null) {
            employeeRepository.findById(Long.valueOf(employeeData.get("reportingManagerId").toString())).ifPresent(employee::setReportingManager);
        }
        if (employeeData.containsKey("joiningDate") && employeeData.get("joiningDate") != null) {
            employee.setJoiningDate(LocalDate.parse((String) employeeData.get("joiningDate")));
        }

        employee.setEmploymentStatus("ACTIVE");
        employee.setActive(true);

        Employee savedEmployee = employeeRepository.save(employee);

        candidate.setConvertedEmployee(savedEmployee);
        candidate.setConvertedAt(LocalDateTime.now());
        candidate.setStatus("CONVERTED");
        candidateRepository.save(candidate);

        JobRequisition requisition = candidate.getRequisition();
        if (requisition != null) {
            requisition.setFilledPositions(requisition.getFilledPositions() + 1);
            if (requisition.getFilledPositions() >= requisition.getNumberOfPositions()) {
                requisition.setStatus("FILLED");
                requisition.setClosedAt(LocalDateTime.now());
            }
            requisitionRepository.save(requisition);
        }

        return savedEmployee;
    }

    @Transactional
    public void deleteOfferLetter(Long id) {
        offerLetterRepository.deleteById(id);
    }

    public Map<String, Object> getRecruitmentDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("openRequisitions", requisitionRepository.findOpenRequisitions().size());
        dashboard.put("pendingApproval", requisitionRepository.findByStatus("PENDING_APPROVAL").size());
        dashboard.put("activePostings", jobPostingRepository.findActivePostings(LocalDate.now()).size());
        dashboard.put("totalCandidates", candidateRepository.count());
        dashboard.put("newCandidates", candidateRepository.findByStatus("NEW").size());
        dashboard.put("inInterviewProcess", candidateRepository.findByStage("INTERVIEW").size());
        dashboard.put("pendingOffers", offerLetterRepository.findByStatus("SENT").size());
        dashboard.put("acceptedOffers", offerLetterRepository.findByStatus("ACCEPTED").size());
        
        return dashboard;
    }

    private String generateRequisitionNumber() {
        String prefix = "REQ";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = requisitionRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    private String generatePostingNumber() {
        String prefix = "JOB";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = jobPostingRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    private String generateCandidateNumber() {
        String prefix = "CND";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = candidateRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }

    private String generateOfferNumber() {
        String prefix = "OFR";
        String year = String.valueOf(LocalDate.now().getYear());
        long count = offerLetterRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }
}
