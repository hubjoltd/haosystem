package com.erp.websocket;

import com.erp.model.ChatMessage;
import com.erp.model.User;
import com.erp.repository.ChatMessageRepository;
import com.erp.repository.UserRepository;
import com.erp.security.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final ConcurrentHashMap<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    public ChatWebSocketHandler() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = authenticateAndExtractUserId(session);
        if (userId == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }
        session.getAttributes().put("userId", userId);
        userSessions.put(userId, session);
        broadcastUserStatus(userId, true);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            userSessions.remove(userId);
            broadcastUserStatus(userId, false);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        Long authenticatedUserId = (Long) session.getAttributes().get("userId");
        if (authenticatedUserId == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(textMessage.getPayload());
            String type = root.has("type") ? root.get("type").asText() : "";
            JsonNode payload = root.get("payload");

            switch (type) {
                case "message":
                    handleChatMessage(payload, authenticatedUserId);
                    break;
                case "typing":
                    handleTyping(payload, authenticatedUserId);
                    break;
                case "read":
                    handleReadReceipt(payload);
                    break;
            }
        } catch (Exception e) {
            System.err.println("Error handling WebSocket message: " + e.getMessage());
        }
    }

    private void handleChatMessage(JsonNode payload, Long authenticatedUserId) throws IOException {
        Long receiverId = payload.get("receiverId").asLong();
        String message = payload.has("message") ? payload.get("message").asText() : "";
        String senderName = payload.has("senderName") ? payload.get("senderName").asText() : "";

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSenderId(authenticatedUserId);
        chatMessage.setSenderName(senderName);
        chatMessage.setReceiverId(receiverId);
        chatMessage.setMessage(message);
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setRead(false);

        ChatMessage saved = chatMessageRepository.save(chatMessage);

        String responseJson = objectMapper.writeValueAsString(Map.of(
            "type", "message",
            "payload", Map.of(
                "id", saved.getId(),
                "senderId", saved.getSenderId(),
                "senderName", saved.getSenderName() != null ? saved.getSenderName() : "",
                "receiverId", saved.getReceiverId(),
                "message", saved.getMessage() != null ? saved.getMessage() : "",
                "timestamp", saved.getTimestamp().toString()
            ),
            "timestamp", LocalDateTime.now().toString()
        ));

        WebSocketSession receiverSession = userSessions.get(receiverId);
        if (receiverSession != null && receiverSession.isOpen()) {
            receiverSession.sendMessage(new TextMessage(responseJson));
        }

        WebSocketSession senderSession = userSessions.get(authenticatedUserId);
        if (senderSession != null && senderSession.isOpen()) {
            senderSession.sendMessage(new TextMessage(responseJson));
        }
    }

    private void handleTyping(JsonNode payload, Long authenticatedUserId) throws IOException {
        Long receiverId = payload.has("receiverId") ? payload.get("receiverId").asLong() : null;
        if (receiverId == null) return;

        String typingJson = objectMapper.writeValueAsString(Map.of(
            "type", "typing",
            "payload", Map.of(
                "userId", authenticatedUserId,
                "userName", payload.has("userName") ? payload.get("userName").asText() : "",
                "isTyping", payload.has("isTyping") ? payload.get("isTyping").asBoolean() : false
            ),
            "timestamp", LocalDateTime.now().toString()
        ));

        WebSocketSession receiverSession = userSessions.get(receiverId);
        if (receiverSession != null && receiverSession.isOpen()) {
            receiverSession.sendMessage(new TextMessage(typingJson));
        }
    }

    private void handleReadReceipt(JsonNode payload) throws IOException {
        Long messageId = payload.has("messageId") ? payload.get("messageId").asLong() : null;
        if (messageId != null) {
            chatMessageRepository.findById(messageId).ifPresent(msg -> {
                msg.setRead(true);
                chatMessageRepository.save(msg);
            });
        }
    }

    private void broadcastUserStatus(Long userId, boolean online) {
        try {
            String statusJson = objectMapper.writeValueAsString(Map.of(
                "type", "status",
                "payload", Map.of(
                    "userId", userId,
                    "online", online
                ),
                "timestamp", LocalDateTime.now().toString()
            ));

            TextMessage statusMessage = new TextMessage(statusJson);
            for (Map.Entry<Long, WebSocketSession> entry : userSessions.entrySet()) {
                if (!entry.getKey().equals(userId) && entry.getValue().isOpen()) {
                    try {
                        entry.getValue().sendMessage(statusMessage);
                    } catch (IOException e) {
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error broadcasting user status: " + e.getMessage());
        }
    }

    private Long authenticateAndExtractUserId(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : null;
        if (query == null) return null;

        String token = null;
        if (query.contains("token=")) {
            try {
                token = query.split("token=")[1].split("&")[0];
            } catch (Exception e) {
                return null;
            }
        }

        if (token != null && !token.isEmpty() && jwtUtil.validateToken(token)) {
            Long userId = jwtUtil.extractUserId(token);
            if (userId != null) return userId;
            String username = jwtUtil.extractUsername(token);
            if (username != null) {
                return userRepository.findByUsername(username)
                    .map(User::getId)
                    .orElse(null);
            }
        }

        return null;
    }

    public boolean isUserOnline(Long userId) {
        WebSocketSession session = userSessions.get(userId);
        return session != null && session.isOpen();
    }
}
