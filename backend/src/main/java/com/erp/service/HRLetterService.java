package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class HRLetterService {

    @Autowired
    private HRLetterRepository letterRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<HRLetter> findAllLetters() {
        return letterRepository.findAll();
    }

    public Optional<HRLetter> findLetterById(Long id) {
        return letterRepository.findById(id);
    }

    public List<HRLetter> findLettersByEmployee(Long employeeId) {
        return letterRepository.findByEmployeeIdOrderByDate(employeeId);
    }

    public List<HRLetter> findLettersByType(String type) {
        return letterRepository.findByLetterType(type);
    }

    public List<HRLetter> findLettersByStatus(String status) {
        return letterRepository.findByStatus(status);
    }

    @Transactional
    public HRLetter createLetter(Map<String, Object> data) {
        HRLetter letter = new HRLetter();
        letter.setLetterNumber(generateLetterNumber((String) data.get("letterType")));
        updateLetterFromMap(letter, data);
        letter.setStatus("DRAFT");
        return letterRepository.save(letter);
    }

    @Transactional
    public HRLetter updateLetter(Long id, Map<String, Object> data) {
        HRLetter letter = letterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("HR letter not found"));
        updateLetterFromMap(letter, data);
        return letterRepository.save(letter);
    }

    private void updateLetterFromMap(HRLetter letter, Map<String, Object> data) {
        if (data.containsKey("employeeId") && data.get("employeeId") != null) {
            employeeRepository.findById(Long.valueOf(data.get("employeeId").toString())).ifPresent(letter::setEmployee);
        }
        if (data.containsKey("letterType")) letter.setLetterType((String) data.get("letterType"));
        if (data.containsKey("subject")) letter.setSubject((String) data.get("subject"));
        if (data.containsKey("content")) letter.setContent((String) data.get("content"));
        if (data.containsKey("issueDate") && data.get("issueDate") != null) {
            letter.setIssueDate(LocalDate.parse((String) data.get("issueDate")));
        }
        if (data.containsKey("effectiveDate") && data.get("effectiveDate") != null) {
            letter.setEffectiveDate(LocalDate.parse((String) data.get("effectiveDate")));
        }
        if (data.containsKey("expiryDate") && data.get("expiryDate") != null) {
            letter.setExpiryDate(LocalDate.parse((String) data.get("expiryDate")));
        }
        if (data.containsKey("notes")) letter.setNotes((String) data.get("notes"));
        if (data.containsKey("createdBy")) letter.setCreatedBy((String) data.get("createdBy"));
    }

    @Transactional
    public HRLetter generateLetter(Long id) {
        HRLetter letter = letterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("HR letter not found"));
        
        if (letter.getContent() == null || letter.getContent().isEmpty()) {
            String content = generateLetterContent(letter);
            letter.setContent(content);
        }
        
        letter.setGeneratedAt(LocalDateTime.now());
        letter.setStatus("GENERATED");
        return letterRepository.save(letter);
    }

    @Transactional
    public HRLetter signLetter(Long id, String signedBy, String designation) {
        HRLetter letter = letterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("HR letter not found"));
        letter.setSigned(true);
        letter.setSignedAt(LocalDateTime.now());
        letter.setStatus("SIGNED");
        return letterRepository.save(letter);
    }

    @Transactional
    public HRLetter issueLetter(Long id) {
        HRLetter letter = letterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("HR letter not found"));
        letter.setSentAt(LocalDateTime.now());
        letter.setSentToEmployee(true);
        letter.setStatus("ISSUED");
        return letterRepository.save(letter);
    }

    @Transactional
    public void deleteLetter(Long id) {
        letterRepository.deleteById(id);
    }

    @Transactional
    public HRLetter generateOfferLetter(Long employeeId, Map<String, Object> offerDetails) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        HRLetter letter = new HRLetter();
        letter.setLetterNumber(generateLetterNumber("OFFER"));
        letter.setEmployee(employee);
        letter.setLetterType("OFFER");
        letter.setSubject("Offer of Employment");
        letter.setIssueDate(LocalDate.now());
        
        String content = generateOfferLetterContent(employee, offerDetails);
        letter.setContent(content);
        letter.setStatus("DRAFT");
        letter.setGeneratedAt(LocalDateTime.now());
        
        return letterRepository.save(letter);
    }

    @Transactional
    public HRLetter generateAppointmentLetter(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        HRLetter letter = new HRLetter();
        letter.setLetterNumber(generateLetterNumber("APPOINTMENT"));
        letter.setEmployee(employee);
        letter.setLetterType("APPOINTMENT");
        letter.setSubject("Letter of Appointment");
        letter.setIssueDate(LocalDate.now());
        letter.setEffectiveDate(employee.getJoiningDate());
        
        String content = generateAppointmentLetterContent(employee);
        letter.setContent(content);
        letter.setStatus("DRAFT");
        letter.setGeneratedAt(LocalDateTime.now());
        
        return letterRepository.save(letter);
    }

    @Transactional
    public HRLetter generateExperienceLetter(Long employeeId, LocalDate lastWorkingDate) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        HRLetter letter = new HRLetter();
        letter.setLetterNumber(generateLetterNumber("EXPERIENCE"));
        letter.setEmployee(employee);
        letter.setLetterType("EXPERIENCE");
        letter.setSubject("Experience Certificate");
        letter.setIssueDate(LocalDate.now());
        
        String content = generateExperienceLetterContent(employee, lastWorkingDate);
        letter.setContent(content);
        letter.setStatus("DRAFT");
        letter.setGeneratedAt(LocalDateTime.now());
        
        return letterRepository.save(letter);
    }

    @Transactional
    public HRLetter generateWarningLetter(Long employeeId, String reason, String warningLevel) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        HRLetter letter = new HRLetter();
        letter.setLetterNumber(generateLetterNumber("WARNING"));
        letter.setEmployee(employee);
        letter.setLetterType("WARNING");
        letter.setSubject(warningLevel + " Warning Letter");
        letter.setIssueDate(LocalDate.now());
        
        String content = generateWarningLetterContent(employee, reason, warningLevel);
        letter.setContent(content);
        letter.setStatus("DRAFT");
        letter.setGeneratedAt(LocalDateTime.now());
        
        return letterRepository.save(letter);
    }

    @Transactional
    public HRLetter generateSalaryRevisionLetter(Long employeeId, Map<String, Object> revisionDetails) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        HRLetter letter = new HRLetter();
        letter.setLetterNumber(generateLetterNumber("SALARY_REVISION"));
        letter.setEmployee(employee);
        letter.setLetterType("SALARY_REVISION");
        letter.setSubject("Salary Revision Letter");
        letter.setIssueDate(LocalDate.now());
        if (revisionDetails.containsKey("effectiveDate")) {
            letter.setEffectiveDate(LocalDate.parse((String) revisionDetails.get("effectiveDate")));
        }
        
        String content = generateSalaryRevisionLetterContent(employee, revisionDetails);
        letter.setContent(content);
        letter.setStatus("DRAFT");
        letter.setGeneratedAt(LocalDateTime.now());
        
        return letterRepository.save(letter);
    }

    private String generateLetterContent(HRLetter letter) {
        switch (letter.getLetterType()) {
            case "OFFER":
                return generateOfferLetterContent(letter.getEmployee(), new HashMap<>());
            case "APPOINTMENT":
                return generateAppointmentLetterContent(letter.getEmployee());
            case "EXPERIENCE":
                return generateExperienceLetterContent(letter.getEmployee(), LocalDate.now());
            default:
                return "";
        }
    }

    private String generateOfferLetterContent(Employee employee, Map<String, Object> details) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        StringBuilder sb = new StringBuilder();
        
        sb.append("Date: ").append(LocalDate.now().format(formatter)).append("\n\n");
        sb.append("Dear ").append(employee.getFirstName()).append(" ").append(employee.getLastName()).append(",\n\n");
        sb.append("We are pleased to offer you the position of ");
        if (employee.getDesignation() != null) {
            sb.append(employee.getDesignation().getTitle());
        }
        sb.append(" at our organization.\n\n");
        sb.append("Your employment will begin on ");
        if (employee.getJoiningDate() != null) {
            sb.append(employee.getJoiningDate().format(formatter));
        }
        sb.append(".\n\n");
        sb.append("Please review the enclosed terms and conditions of employment. ");
        sb.append("If you accept this offer, please sign and return a copy of this letter.\n\n");
        sb.append("We look forward to welcoming you to our team.\n\n");
        sb.append("Sincerely,\n\n");
        sb.append("[Authorized Signatory]\n");
        sb.append("Human Resources Department");
        
        return sb.toString();
    }

    private String generateAppointmentLetterContent(Employee employee) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        StringBuilder sb = new StringBuilder();
        
        sb.append("Date: ").append(LocalDate.now().format(formatter)).append("\n\n");
        sb.append("Dear ").append(employee.getFirstName()).append(" ").append(employee.getLastName()).append(",\n\n");
        sb.append("This is to confirm your appointment as ");
        if (employee.getDesignation() != null) {
            sb.append(employee.getDesignation().getTitle());
        }
        sb.append(" in ");
        if (employee.getDepartment() != null) {
            sb.append(employee.getDepartment().getName()).append(" department");
        }
        sb.append(".\n\n");
        sb.append("Your date of joining is ");
        if (employee.getJoiningDate() != null) {
            sb.append(employee.getJoiningDate().format(formatter));
        }
        sb.append(".\n\n");
        sb.append("Employee Code: ").append(employee.getEmployeeCode()).append("\n\n");
        sb.append("Please find enclosed the detailed terms and conditions of your employment.\n\n");
        sb.append("We welcome you to the organization and wish you a successful career with us.\n\n");
        sb.append("Sincerely,\n\n");
        sb.append("[Authorized Signatory]\n");
        sb.append("Human Resources Department");
        
        return sb.toString();
    }

    private String generateExperienceLetterContent(Employee employee, LocalDate lastWorkingDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        StringBuilder sb = new StringBuilder();
        
        sb.append("Date: ").append(LocalDate.now().format(formatter)).append("\n\n");
        sb.append("TO WHOM IT MAY CONCERN\n\n");
        sb.append("This is to certify that ").append(employee.getFirstName()).append(" ").append(employee.getLastName());
        sb.append(" (Employee Code: ").append(employee.getEmployeeCode()).append(") ");
        sb.append("was employed with our organization from ");
        if (employee.getJoiningDate() != null) {
            sb.append(employee.getJoiningDate().format(formatter));
        }
        sb.append(" to ").append(lastWorkingDate.format(formatter)).append(".\n\n");
        sb.append("During this period, ");
        if (employee.getGender() != null && employee.getGender().equalsIgnoreCase("Male")) {
            sb.append("he ");
        } else if (employee.getGender() != null && employee.getGender().equalsIgnoreCase("Female")) {
            sb.append("she ");
        } else {
            sb.append("they ");
        }
        sb.append("held the position of ");
        if (employee.getDesignation() != null) {
            sb.append(employee.getDesignation().getTitle());
        }
        sb.append(" in the ");
        if (employee.getDepartment() != null) {
            sb.append(employee.getDepartment().getName()).append(" department");
        }
        sb.append(".\n\n");
        sb.append("We found the performance to be satisfactory and professional conduct exemplary. ");
        sb.append("We wish all the best for future endeavors.\n\n");
        sb.append("This certificate is issued upon request for official purposes only.\n\n");
        sb.append("Sincerely,\n\n");
        sb.append("[Authorized Signatory]\n");
        sb.append("Human Resources Department");
        
        return sb.toString();
    }

    private String generateWarningLetterContent(Employee employee, String reason, String warningLevel) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        StringBuilder sb = new StringBuilder();
        
        sb.append("Date: ").append(LocalDate.now().format(formatter)).append("\n\n");
        sb.append("To: ").append(employee.getFirstName()).append(" ").append(employee.getLastName()).append("\n");
        sb.append("Employee Code: ").append(employee.getEmployeeCode()).append("\n");
        if (employee.getDepartment() != null) {
            sb.append("Department: ").append(employee.getDepartment().getName()).append("\n");
        }
        sb.append("\nSubject: ").append(warningLevel).append(" Warning\n\n");
        sb.append("Dear ").append(employee.getFirstName()).append(",\n\n");
        sb.append("This letter serves as a formal ").append(warningLevel.toLowerCase()).append(" warning regarding:\n\n");
        sb.append(reason).append("\n\n");
        sb.append("This behavior/conduct is in violation of company policies and is unacceptable. ");
        sb.append("Please take immediate corrective action to address this issue.\n\n");
        sb.append("Failure to improve may result in further disciplinary action, up to and including termination of employment.\n\n");
        sb.append("Please acknowledge receipt of this warning by signing below.\n\n");
        sb.append("Sincerely,\n\n");
        sb.append("[Authorized Signatory]\n");
        sb.append("Human Resources Department\n\n");
        sb.append("Employee Acknowledgment:\n");
        sb.append("I have received and read this warning letter.\n\n");
        sb.append("Signature: _________________ Date: _________________");
        
        return sb.toString();
    }

    private String generateSalaryRevisionLetterContent(Employee employee, Map<String, Object> details) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        StringBuilder sb = new StringBuilder();
        
        sb.append("Date: ").append(LocalDate.now().format(formatter)).append("\n\n");
        sb.append("CONFIDENTIAL\n\n");
        sb.append("Dear ").append(employee.getFirstName()).append(" ").append(employee.getLastName()).append(",\n\n");
        sb.append("We are pleased to inform you about the revision in your compensation package ");
        sb.append("effective from ");
        if (details.containsKey("effectiveDate")) {
            sb.append(LocalDate.parse((String) details.get("effectiveDate")).format(formatter));
        }
        sb.append(".\n\n");
        sb.append("Your revised annual compensation will be as follows:\n\n");
        if (details.containsKey("newSalary")) {
            sb.append("New Annual Salary: ").append(details.get("newSalary")).append("\n");
        }
        if (details.containsKey("increment")) {
            sb.append("Increment: ").append(details.get("increment")).append("%\n");
        }
        sb.append("\n");
        sb.append("This revision is in recognition of your contributions to the organization. ");
        sb.append("We value your efforts and look forward to your continued excellence.\n\n");
        sb.append("Please keep this information confidential.\n\n");
        sb.append("Sincerely,\n\n");
        sb.append("[Authorized Signatory]\n");
        sb.append("Human Resources Department");
        
        return sb.toString();
    }

    private String generateLetterNumber(String type) {
        String prefix;
        switch (type) {
            case "OFFER": prefix = "OFR"; break;
            case "APPOINTMENT": prefix = "APT"; break;
            case "EXPERIENCE": prefix = "EXP"; break;
            case "WARNING": prefix = "WRN"; break;
            case "SALARY_REVISION": prefix = "SAL"; break;
            default: prefix = "LTR";
        }
        String year = String.valueOf(LocalDate.now().getYear());
        long count = letterRepository.count() + 1;
        return prefix + "-" + year + "-" + String.format("%05d", count);
    }
}
