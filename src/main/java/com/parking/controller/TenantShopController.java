package com.parking.controller;

import com.parking.entity.Shop;
import com.parking.entity.User;
import com.parking.repository.ShopRepository;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tenant/shops")
@PreAuthorize("hasRole('TENANT')")
public class TenantShopController {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Shop> getMyRentedShops(Principal principal) {
        User tenant = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tenant"));
        return shopRepository.findByTenantId(tenant.getId());
    }

    @Autowired
    private com.parking.repository.OrderRepository orderRepository;

    @Autowired
    private com.parking.repository.ChatMessageRepository chatMessageRepository;

    @GetMapping("/notifications")
    public java.util.Map<Long, java.util.Map<String, Long>> getNotifications(Principal principal) {
        User tenant = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tenant"));
        List<Shop> shops = shopRepository.findByTenantId(tenant.getId());
        
        java.util.Map<Long, java.util.Map<String, Long>> notifications = new java.util.HashMap<>();
        for (Shop shop : shops) {
            long pendingOrders = orderRepository.countByShopIdAndStatus(shop.getId(), "PENDING");
            long unreadChats = chatMessageRepository.countUnreadByShopId(shop.getId());
            
            java.util.Map<String, Long> shopNotifs = new java.util.HashMap<>();
            shopNotifs.put("pendingOrders", pendingOrders);
            shopNotifs.put("unreadChats", unreadChats);
            
            notifications.put(shop.getId(), shopNotifs);
        }
        return notifications;
    }
}
