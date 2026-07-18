package com.parking.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.entity.Order;
import com.parking.entity.Product;
import com.parking.repository.OrderRepository;
import com.parking.repository.ProductRepository;
import com.parking.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/orders")
public class PublicOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        if (order.getShopId() == null || !shopRepository.existsById(order.getShopId())) {
            return ResponseEntity.badRequest().body("Lỗi: Sạp hàng không tồn tại!");
        }
        if (order.getCustomerName() == null || order.getCustomerName().isBlank()
                || order.getCustomerPhone() == null || order.getCustomerPhone().isBlank()) {
            return ResponseEntity.badRequest().body("Vui lòng điền đầy đủ thông tin liên hệ!");
        }

        if (!"BOOKING".equals(order.getPaymentMethod())) {
            try {
                List<Map<String, Object>> items = objectMapper.readValue(order.getItemsJson(), new TypeReference<List<Map<String, Object>>>() {});
                int recalculated = 0;
                for (Map<String, Object> item : items) {
                    Object rawId = item.get("id");
                    Object rawQty = item.get("quantity");
                    if (rawId == null || rawQty == null) continue; // bỏ qua item lỗi thay vì crash

                    Integer quantity = (Integer) rawQty;
                    String idStr = rawId.toString();
                    try {
                        Long productId = Long.valueOf(idStr);
                        Product product = productRepository.findById(productId).orElse(null);
                        if (product != null) {
                            recalculated += product.getPrice() * quantity;
                            continue;
                        }
                    } catch (NumberFormatException e) {
                        // fall back
                    }
                    Object rawPrice = item.get("price");
                    if (rawPrice != null) {
                        recalculated += ((Integer) rawPrice) * quantity;
                    }
                }
                order.setTotalAmount(recalculated);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Giỏ hàng không hợp lệ!");
            }
        } else {
            order.setTotalAmount(0);
        }

        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/lookup")
    public ResponseEntity<?> lookupOrders(
            @RequestParam String phone,
            @RequestParam(required = false) Long shopId) {
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập số điện thoại!");
        }
        if (shopId == null) {
            return ResponseEntity.badRequest().body("Mã sạp hàng (shopId) là bắt buộc!");
        }
        List<Order> orders = orderRepository.findByCustomerPhoneAndShopIdOrderByCreatedAtDesc(phone.trim(), shopId);
        return ResponseEntity.ok(orders);
    }
}
