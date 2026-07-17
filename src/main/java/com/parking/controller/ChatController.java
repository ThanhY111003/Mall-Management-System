package com.parking.controller;

import com.parking.entity.ChatMessage;
import com.parking.entity.Role;
import com.parking.entity.Shop;
import com.parking.entity.User;
import com.parking.repository.ChatMessageRepository;
import com.parking.repository.ShopRepository;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    private boolean isOwnerOrAdmin(Long shopId, Principal principal) {
        if (principal == null) return false;
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return false;
        if (user.getRole() == Role.ADMIN) return true;
        Shop shop = shopRepository.findById(shopId).orElse(null);
        if (shop == null) return false;
        return shop.getTenant() != null && shop.getTenant().getId().equals(user.getId());
    }

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
    public ResponseEntity<?> getConversations(@PathVariable Long shopId, Principal principal) {
        if (!isOwnerOrAdmin(shopId, principal)) {
            return ResponseEntity.status(403).body("Không có quyền truy cập!");
        }
        List<String> clientIds = chatMessageRepository.findDistinctClientIdsByShopId(shopId);
        return ResponseEntity.ok(clientIds);
    }

    // Authenticated endpoint: Get chat history (called by tenant dashboard)
    @GetMapping("/api/chat/history/{shopId}/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    public ResponseEntity<?> getTenantChatHistory(
            @PathVariable Long shopId,
            @PathVariable String clientId,
            Principal principal) {
        if (!isOwnerOrAdmin(shopId, principal)) {
            return ResponseEntity.status(403).body("Không có quyền truy cập!");
        }
        List<ChatMessage> messages = chatMessageRepository.findByShopIdAndClientIdOrderByTimestampAsc(shopId, clientId);
        return ResponseEntity.ok(messages);
    }

    // Authenticated endpoint: Mark conversation as read (called by tenant)
    @PostMapping("/api/chat/mark-read/{shopId}/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    public ResponseEntity<?> markConversationAsRead(
            @PathVariable Long shopId,
            @PathVariable String clientId,
            Principal principal) {
        if (!isOwnerOrAdmin(shopId, principal)) {
            return ResponseEntity.status(403).body("Không có quyền truy cập!");
        }
        chatMessageRepository.markAsReadByShopIdAndClientId(shopId, clientId);
        return ResponseEntity.ok().build();
    }
}
