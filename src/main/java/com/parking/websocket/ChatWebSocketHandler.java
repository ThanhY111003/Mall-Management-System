package com.parking.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.entity.ChatMessage;
import com.parking.repository.ChatMessageRepository;
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
            tenantSessions.put(shopId, session);
            System.out.println(">>> WebSocket: Tenant connected for Shop #" + shopId);
        } else {
            String clientId = queryParams.get("clientId");
            if (clientId != null) {
                customerSessions.put(shopId + ":" + clientId, session);
                System.out.println(">>> WebSocket: Customer connected (" + clientId + ") for Shop #" + shopId);
            } else {
                session.close(CloseStatus.BAD_DATA);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, String> queryParams = parseQueryParams(session.getUri().getQuery());
        String shopIdStr = queryParams.get("shopId");
        if (shopIdStr == null) return;
        Long shopId = Long.parseLong(shopIdStr);
        
        String role = queryParams.get("role");
        String payload = message.getPayload();
        
        @SuppressWarnings("unchecked")
        Map<String, String> messageData = objectMapper.readValue(payload, Map.class);
        
        String content = messageData.get("content");
        if (content == null || content.trim().isEmpty()) return;
        
        if ("tenant".equalsIgnoreCase(role)) {
            // Message sent by Tenant
            String clientId = messageData.get("clientId");
            if (clientId == null) return;
            
            ChatMessage chatMsg = ChatMessage.builder()
                    .shopId(shopId)
                    .clientId(clientId)
                    .sender("TENANT")
                    .content(content)
                    .timestamp(LocalDateTime.now())
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
            String clientId = queryParams.get("clientId");
            if (clientId == null) return;
            
            ChatMessage chatMsg = ChatMessage.builder()
                    .shopId(shopId)
                    .clientId(clientId)
                    .sender("CUSTOMER")
                    .content(content)
                    .timestamp(LocalDateTime.now())
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
        Map<String, String> queryParams = parseQueryParams(session.getUri().getQuery());
        String shopIdStr = queryParams.get("shopId");
        if (shopIdStr == null) return;
        Long shopId = Long.parseLong(shopIdStr);
        
        String role = queryParams.get("role");
        if ("tenant".equalsIgnoreCase(role)) {
            tenantSessions.remove(shopId);
            System.out.println("<<< WebSocket: Tenant disconnected for Shop #" + shopId);
        } else {
            String clientId = queryParams.get("clientId");
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
