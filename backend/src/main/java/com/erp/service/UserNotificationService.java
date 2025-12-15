package com.erp.service;

import com.erp.model.UserNotification;
import com.erp.model.User;
import com.erp.repository.UserNotificationRepository;
import com.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserNotificationService {
    
    @Autowired
    private UserNotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<UserNotification> getNotificationsForUser(String username) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username);
    }
    
    public List<UserNotification> getUnreadNotificationsForUser(String username) {
        return notificationRepository.findByRecipientUsernameAndReadFalseOrderByCreatedAtDesc(username);
    }
    
    public long getUnreadCount(String username) {
        return notificationRepository.countUnreadByRecipientUsername(username);
    }
    
    @Transactional
    public UserNotification createNotification(String recipientUsername, String title, String message, 
            String type, String referenceType, Long referenceId) {
        UserNotification notification = new UserNotification();
        notification.setRecipientUsername(recipientUsername);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public void notifyAdmins(String title, String message, String type, String referenceType, Long referenceId) {
        List<User> admins = userRepository.findByRoleName("admin");
        for (User admin : admins) {
            createNotification(admin.getUsername(), title, message, type, referenceType, referenceId);
        }
    }
    
    public static class NotificationNotFoundException extends RuntimeException {
        public NotificationNotFoundException(String message) { super(message); }
    }
    
    public static class NotificationForbiddenException extends RuntimeException {
        public NotificationForbiddenException(String message) { super(message); }
    }
    
    @Transactional
    public UserNotification markAsRead(Long notificationId, String username) {
        UserNotification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
        if (!notification.getRecipientUsername().equals(username)) {
            throw new NotificationForbiddenException("Not authorized to access this notification");
        }
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(String username) {
        List<UserNotification> unread = notificationRepository.findByRecipientUsernameAndReadFalseOrderByCreatedAtDesc(username);
        LocalDateTime now = LocalDateTime.now();
        for (UserNotification notification : unread) {
            notification.setRead(true);
            notification.setReadAt(now);
        }
        notificationRepository.saveAll(unread);
    }
    
    @Transactional
    public void deleteNotification(Long notificationId, String username) {
        UserNotification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
        if (!notification.getRecipientUsername().equals(username)) {
            throw new NotificationForbiddenException("Not authorized to delete this notification");
        }
        notificationRepository.deleteById(notificationId);
    }
}
