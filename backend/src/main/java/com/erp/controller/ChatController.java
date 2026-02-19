package com.erp.controller;

import com.erp.model.ChatMessage;
import com.erp.repository.ChatMessageRepository;
import com.erp.repository.UserRepository;
import com.erp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.erp.service.UserNotificationService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNotificationService userNotificationService;

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        String username = auth.getName();
        Optional<User> user = userRepository.findByUsername(username);
        return user.map(User::getId).orElse(null);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getChatUsers(Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> result = allUsers.stream()
                .filter(u -> u.getActive() != null && u.getActive() && !u.getId().equals(currentUserId))
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("firstName", u.getFirstName());
                    map.put("lastName", u.getLastName());
                    map.put("email", u.getEmail());
                    map.put("username", u.getUsername());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/messages/{userId}")
    public List<ChatMessage> getConversation(
            @PathVariable Long userId,
            Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return List.of();
        }
        return chatMessageRepository.findConversation(currentUserId, userId);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, Object> payload, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }

        ChatMessage msg = new ChatMessage();
        msg.setSenderId(currentUserId);
        msg.setSenderName((String) payload.get("senderName"));
        msg.setReceiverId(toLong(payload.get("receiverId")));
        msg.setMessage((String) payload.get("message"));
        msg.setTimestamp(LocalDateTime.now());
        msg.setRead(false);

        if (payload.containsKey("attachmentType")) {
            msg.setAttachmentType((String) payload.get("attachmentType"));
        }
        if (payload.containsKey("attachmentName")) {
            msg.setAttachmentName((String) payload.get("attachmentName"));
        }
        if (payload.containsKey("attachmentData")) {
            msg.setAttachmentUrl((String) payload.get("attachmentData"));
        }

        ChatMessage saved = chatMessageRepository.save(msg);

        try {
            Long receiverId = saved.getReceiverId();
            if (receiverId != null) {
                Optional<User> receiver = userRepository.findById(receiverId);
                receiver.ifPresent(r -> {
                    String senderName = saved.getSenderName() != null ? saved.getSenderName() : "Someone";
                    String preview = saved.getMessage() != null ? saved.getMessage() : "";
                    if (saved.getAttachmentName() != null) {
                        preview = "📎 " + saved.getAttachmentName();
                    }
                    if (preview.length() > 100) preview = preview.substring(0, 100) + "...";
                    userNotificationService.createNotification(
                        r.getUsername(),
                        "New message from " + senderName,
                        preview,
                        "CHAT",
                        "ChatMessage",
                        saved.getId()
                    );
                });
            }
        } catch (Exception e) {
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ResponseEntity.ok(Map.of("count", 0L));
        }
        Long count = chatMessageRepository.countUnreadMessages(currentUserId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/unread/{senderId}")
    public ResponseEntity<Map<String, Long>> getUnreadFromUser(
            @PathVariable Long senderId,
            Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ResponseEntity.ok(Map.of("count", 0L));
        }
        Long count = chatMessageRepository.countUnreadFromUser(senderId, currentUserId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/read")
    @Transactional
    public ResponseEntity<Void> markAsRead(@RequestBody Map<String, Long> payload, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        Long senderId = payload.get("senderId");
        if (senderId != null) {
            chatMessageRepository.markAsRead(senderId, currentUserId);
        }
        return ResponseEntity.ok().build();
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }
}
