package com.erp.repository;

import com.erp.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    
    List<UserNotification> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername);
    
    List<UserNotification> findByRecipientUsernameAndReadFalseOrderByCreatedAtDesc(String recipientUsername);
    
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.recipientUsername = ?1 AND n.read = false")
    long countUnreadByRecipientUsername(String recipientUsername);
    
    List<UserNotification> findByRecipientUsernameAndTypeOrderByCreatedAtDesc(String recipientUsername, String type);
}
