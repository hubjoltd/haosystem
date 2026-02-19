package com.erp.repository;

import com.erp.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT m FROM ChatMessage m WHERE m.receiverId = :userId AND m.read = false")
    List<ChatMessage> findUnreadMessages(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiverId = :userId AND m.read = false")
    Long countUnreadMessages(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.senderId = :senderId AND m.receiverId = :receiverId AND m.read = false")
    Long countUnreadFromUser(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.read = true WHERE m.senderId = :senderId AND m.receiverId = :receiverId AND m.read = false")
    void markAsRead(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
