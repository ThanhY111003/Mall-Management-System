package com.parking.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.entity.ChatMessage;
import com.parking.entity.Role;
import com.parking.entity.Shop;
import com.parking.entity.User;
import com.parking.repository.ChatMessageRepository;
import com.parking.repository.ShopRepository;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map: shopId -> Tenant WebSocket session
    private final Map<Long, WebSocketSession> tenantSessions = new ConcurrentHashMap<>();

    // Map: "shopId:clientId" -> Customer WebSocket session
    private final Map<String, WebSocketSession> customerSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Map<String, String> queryParams = parseQueryParams(session.getUri().getQuery());
        String shopIdStr = queryParams.get("shopId");
        if (shopIdStr == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }
        Long shopId = Long.parseLong(shopIdStr);
        
        String role = queryParams.get("role");
        if ("tenant".equalsIgnoreCase(role)) {
            String username = (String) session.getAttributes().get("authenticatedUsername");
            if (username == null) {
                session.close(CloseStatus.POLICY_VIOLATION.withReason("Chưa đăng nhập"));
                return;
            }

            var userOpt = userRepository.findByUsername(username);
            var shopOpt = shopRepository.findById(shopId);

            if (userOpt.isEmpty() || shopOpt.isEmpty()) {
                session.close(CloseStatus.POLICY_VIOLATION.withReason("Không hợp lệ"));
                return;
            }

            User user = userOpt.get();
            Shop shop = shopOpt.get();
            boolean isOwner = shop.getTenant() != null && shop.getTenant().getId().equals(user.getId());
            boolean isAdmin = user.getRole() == Role.ADMIN;

            if (!isOwner && !isAdmin) {
                session.close(CloseStatus.POLICY_VIOLATION.withReason("Bạn không sở hữu shop này"));
                return;
            }

            session.getAttributes().put("isTenant", true);
            session.getAttributes().put("shopId", shopId);
            tenantSessions.put(shopId, session);
            System.out.println(">>> WebSocket: Tenant [" + username + "] connected for Shop #" + shopId);
        } else {
            String clientId = queryParams.get("clientId");
            if (clientId != null) {
                session.getAttributes().put("isTenant", false);
                session.getAttributes().put("shopId", shopId);
                session.getAttributes().put("clientId", clientId);
                customerSessions.put(shopId + ":" + clientId, session);
                System.out.println(">>> WebSocket: Customer connected (" + clientId + ") for Shop #" + shopId);
            } else {
                session.close(CloseStatus.BAD_DATA);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Boolean isTenant = (Boolean) session.getAttributes().get("isTenant");
        Long shopId = (Long) session.getAttributes().get("shopId");
        if (isTenant == null || shopId == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }
        
        String payload = message.getPayload();
        
        @SuppressWarnings("unchecked")
        Map<String, String> messageData = objectMapper.readValue(payload, Map.class);
        
        String content = messageData.get("content");
        if (content == null || content.trim().isEmpty()) return;
        
        if (isTenant) {
            // Message sent by Tenant
            String clientId = messageData.get("clientId");
            if (clientId == null) return;
            
            ChatMessage chatMsg = ChatMessage.builder()
                    .shopId(shopId)
                    .clientId(clientId)
                    .sender("TENANT")
                    .content(content)
                    .timestamp(LocalDateTime.now())
                    .isRead(true)
                    .build();
            
            chatMsg = chatMessageRepository.save(chatMsg);
            
            // Convert to a Map to avoid LocalDateTime serialization issues in raw ObjectMapper
            Map<String, Object> msgMap = new HashMap<>();
            msgMap.put("id", chatMsg.getId());
            msgMap.put("shopId", chatMsg.getShopId());
            msgMap.put("clientId", chatMsg.getClientId());
            msgMap.put("sender", chatMsg.getSender());
            msgMap.put("content", chatMsg.getContent());
            msgMap.put("timestamp", chatMsg.getTimestamp().toString());
            
            String jsonResponse = objectMapper.writeValueAsString(msgMap);
            
            // Forward message to Customer session
            String customerKey = shopId + ":" + clientId;
            WebSocketSession customerSession = customerSessions.get(customerKey);
            if (customerSession != null && customerSession.isOpen()) {
                customerSession.sendMessage(new TextMessage(jsonResponse));
            }
            
            // Echo message back to tenant session for rendering/sync across multiple tabs
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(jsonResponse));
            }
        } else {
            // Message sent by Customer
            String clientId = (String) session.getAttributes().get("clientId");
            if (clientId == null) return;
            
            ChatMessage chatMsg = ChatMessage.builder()
                    .shopId(shopId)
                    .clientId(clientId)
                    .sender("CUSTOMER")
                    .content(content)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();
            
            chatMsg = chatMessageRepository.save(chatMsg);
            
            // Convert to a Map to avoid LocalDateTime serialization issues in raw ObjectMapper
            Map<String, Object> msgMap = new HashMap<>();
            msgMap.put("id", chatMsg.getId());
            msgMap.put("shopId", chatMsg.getShopId());
            msgMap.put("clientId", chatMsg.getClientId());
            msgMap.put("sender", chatMsg.getSender());
            msgMap.put("content", chatMsg.getContent());
            msgMap.put("timestamp", chatMsg.getTimestamp().toString());
            
            String jsonResponse = objectMapper.writeValueAsString(msgMap);
            
            // Forward message to Tenant session
            WebSocketSession tenantSession = tenantSessions.get(shopId);
            if (tenantSession != null && tenantSession.isOpen()) {
                tenantSession.sendMessage(new TextMessage(jsonResponse));
            }
            
            // Echo back to customer session
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(jsonResponse));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Boolean isTenant = (Boolean) session.getAttributes().get("isTenant");
        Long shopId = (Long) session.getAttributes().get("shopId");
        if (shopId == null) return;
        
        if (isTenant != null && isTenant) {
            tenantSessions.remove(shopId);
            System.out.println("<<< WebSocket: Tenant disconnected for Shop #" + shopId);
        } else {
            String clientId = (String) session.getAttributes().get("clientId");
            if (clientId != null) {
                customerSessions.remove(shopId + ":" + clientId);
                System.out.println("<<< WebSocket: Customer disconnected (" + clientId + ") for Shop #" + shopId);
            }
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> params = new HashMap<>();
        if (query == null) return params;
        for (String param : query.split("&")) {
            String[] entry = param.split("=");
            if (entry.length > 1) {
                params.put(entry[0], entry[1]);
            }
        }
        return params;
    }
}
