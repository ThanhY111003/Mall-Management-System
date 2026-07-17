package com.parking.controller;

import com.parking.entity.Order;
import com.parking.entity.Role;
import com.parking.entity.Shop;
import com.parking.entity.User;
import com.parking.repository.OrderRepository;
import com.parking.repository.ShopRepository;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tenant/orders")
@PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
public class TenantOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    private boolean isOwnerOrAdmin(Long shopId, Principal principal) {
        if (principal == null) return false;
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return false;
        if (user.getRole() == Role.ADMIN) return true;
        Shop shop = shopRepository.findById(shopId).orElse(null);
        if (shop == null) return false;
        return shop.getTenant() != null && shop.getTenant().getId().equals(user.getId());
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<?> getOrders(@PathVariable Long shopId, Principal principal) {
        if (!isOwnerOrAdmin(shopId, principal)) {
            return ResponseEntity.status(403).body("Không có quyền truy cập đơn hàng của sạp này!");
        }
        List<Order> orders = orderRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/update-status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            Principal principal) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwnerOrAdmin(order.getShopId(), principal)) {
            return ResponseEntity.status(403).body("Không có quyền chỉnh sửa đơn hàng của sạp này!");
        }

        if (!"PENDING".equalsIgnoreCase(status) &&
            !"CONFIRMED".equalsIgnoreCase(status) &&
            !"CANCELLED".equalsIgnoreCase(status)) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ!");
        }

        order.setStatus(status.toUpperCase());
        Order updated = orderRepository.save(order);
        return ResponseEntity.ok(updated);
    }
}
