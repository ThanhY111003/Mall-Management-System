package com.parking.controller;

import com.parking.entity.*;
import com.parking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tenant/products")
@PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
public class TenantProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private UserRepository userRepository;

    private boolean isOwnerOrAdmin(Long shopId, Principal principal) {
        if (principal == null) return false;
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return false;
        if (user.getRole() == Role.ADMIN) return true;
        Shop shop = shopRepository.findById(shopId).orElse(null);
        return shop != null && shop.getTenant() != null && shop.getTenant().getId().equals(user.getId());
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<?> getProducts(@PathVariable Long shopId, Principal principal) {
        if (!isOwnerOrAdmin(shopId, principal)) {
            return ResponseEntity.status(403).body("Không có quyền truy cập!");
        }
        return ResponseEntity.ok(productRepository.findByShopIdOrderByIdDesc(shopId));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product, Principal principal) {
        if (product.getShopId() == null || !isOwnerOrAdmin(product.getShopId(), principal)) {
            return ResponseEntity.status(403).body("Không có quyền tạo sản phẩm cho sạp này!");
        }
        if (product.getName() == null || product.getName().isBlank() || product.getPrice() == null) {
            return ResponseEntity.badRequest().body("Tên và giá sản phẩm là bắt buộc!");
        }
        if (product.getActive() == null) product.setActive(true);
        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product updated, Principal principal) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        if (!isOwnerOrAdmin(existing.getShopId(), principal)) {
            return ResponseEntity.status(403).body("Không có quyền chỉnh sửa sản phẩm này!");
        }
        existing.setName(updated.getName());
        existing.setPrice(updated.getPrice());
        existing.setImageUrl(updated.getImageUrl());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        existing.setStock(updated.getStock());
        existing.setActive(updated.getActive());
        return ResponseEntity.ok(productRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, Principal principal) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        if (!isOwnerOrAdmin(existing.getShopId(), principal)) {
            return ResponseEntity.status(403).body("Không có quyền xóa sản phẩm này!");
        }
        productRepository.delete(existing);
        return ResponseEntity.ok("Đã xóa sản phẩm.");
    }
}
