package com.erp.controller;

import com.erp.model.UserNotification;
import com.erp.service.UserNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class UserNotificationController {
    
    @Autowired
    private UserNotificationService notificationService;
    
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return auth.getName();
    }
    
    @GetMapping
    public ResponseEntity<List<UserNotification>> getMyNotifications() {
        String username = getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(username));
    }
    
    @GetMapping("/unread")
    public ResponseEntity<List<UserNotification>> getUnreadNotifications() {
        String username = getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(username));
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String username = getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        Map<String, Long> result = new HashMap<>();
        result.put("count", notificationService.getUnreadCount(username));
        return ResponseEntity.ok(result);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<UserNotification> markAsRead(@PathVariable Long id) {
        String username = getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            return ResponseEntity.ok(notificationService.markAsRead(id, username));
        } catch (UserNotificationService.NotificationNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UserNotificationService.NotificationForbiddenException e) {
            return ResponseEntity.status(403).build();
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        String username = getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        String username = getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            notificationService.deleteNotification(id, username);
            return ResponseEntity.ok().build();
        } catch (UserNotificationService.NotificationNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UserNotificationService.NotificationForbiddenException e) {
            return ResponseEntity.status(403).build();
        }
    }
}
