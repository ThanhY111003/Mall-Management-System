package com.parking.controller;

import com.parking.entity.ChatMessage;
import com.parking.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    // Public endpoint: Get chat history (called by customer page)
    @GetMapping("/api/public/chat/history/{shopId}/{clientId}")
    public ResponseEntity<List<ChatMessage>> getPublicChatHistory(
            @PathVariable Long shopId,
            @PathVariable String clientId) {
        List<ChatMessage> messages = chatMessageRepository.findByShopIdAndClientIdOrderByTimestampAsc(shopId, clientId);
        return ResponseEntity.ok(messages);
    }

    // Authenticated endpoint: Get list of active conversations (called by tenant dashboard)
    @GetMapping("/api/chat/conversations/{shopId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    public ResponseEntity<List<String>> getConversations(@PathVariable Long shopId) {
        List<String> clientIds = chatMessageRepository.findDistinctClientIdsByShopId(shopId);
        return ResponseEntity.ok(clientIds);
    }

    // Authenticated endpoint: Get chat history (called by tenant dashboard)
    @GetMapping("/api/chat/history/{shopId}/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    public ResponseEntity<List<ChatMessage>> getTenantChatHistory(
            @PathVariable Long shopId,
            @PathVariable String clientId) {
        List<ChatMessage> messages = chatMessageRepository.findByShopIdAndClientIdOrderByTimestampAsc(shopId, clientId);
        return ResponseEntity.ok(messages);
    }
}
