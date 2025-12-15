package com.erp.service;

import com.erp.model.EmployeeDocument;
import com.erp.repository.EmployeeDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DocumentExpiryScheduler {

    @Autowired
    private EmployeeDocumentRepository documentRepository;
    
    @Autowired
    private UserNotificationService notificationService;

    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void checkExpiringDocuments() {
        processExpiringDocuments();
    }
    
    @Transactional
    public int[] processExpiringDocuments() {
        int processed = 0;
        int notificationsSent = 0;
        
        List<EmployeeDocument> allDocs = documentRepository.findAll();
        LocalDate today = LocalDate.now();
        
        for (EmployeeDocument doc : allDocs) {
            if (doc.getDocumentType() == null || !Boolean.TRUE.equals(doc.getDocumentType().getHasExpiry()) || !Boolean.TRUE.equals(doc.getDocumentType().getActive())) {
                continue;
            }
            
            if (doc.getExpiryDate() == null || doc.getReminderSent()) {
                continue;
            }
            
            processed++;
            
            int reminderDays = doc.getReminderDays() != null ? doc.getReminderDays() : 30;
            LocalDate reminderDate = doc.getExpiryDate().minusDays(reminderDays);
            
            if (!today.isBefore(reminderDate)) {
                long daysUntilExpiry = ChronoUnit.DAYS.between(today, doc.getExpiryDate());
                String employeeName = doc.getEmployee().getFirstName() + " " + doc.getEmployee().getLastName();
                String docTypeName = doc.getDocumentType().getName();
                
                String title;
                String message;
                String type;
                
                if (daysUntilExpiry < 0) {
                    title = "Document Expired";
                    message = String.format("%s's %s has expired %d days ago. Document #: %s", 
                        employeeName, docTypeName, Math.abs(daysUntilExpiry), 
                        doc.getDocumentNumber() != null ? doc.getDocumentNumber() : "N/A");
                    type = "DOCUMENT_EXPIRED";
                } else if (daysUntilExpiry == 0) {
                    title = "Document Expires Today";
                    message = String.format("%s's %s expires today! Document #: %s", 
                        employeeName, docTypeName,
                        doc.getDocumentNumber() != null ? doc.getDocumentNumber() : "N/A");
                    type = "DOCUMENT_EXPIRY_URGENT";
                } else {
                    title = "Document Expiring Soon";
                    message = String.format("%s's %s will expire in %d days (on %s). Document #: %s", 
                        employeeName, docTypeName, daysUntilExpiry, doc.getExpiryDate(),
                        doc.getDocumentNumber() != null ? doc.getDocumentNumber() : "N/A");
                    type = "DOCUMENT_EXPIRY_WARNING";
                }
                
                notificationService.notifyAdmins(title, message, type, "EMPLOYEE_DOCUMENT", doc.getId());
                
                doc.setReminderSent(true);
                documentRepository.save(doc);
                notificationsSent++;
            }
        }
        
        return new int[] { processed, notificationsSent };
    }
    
    @Transactional
    public void resetReminder(Long documentId) {
        documentRepository.findById(documentId).ifPresent(doc -> {
            doc.setReminderSent(false);
            documentRepository.save(doc);
        });
    }
}
