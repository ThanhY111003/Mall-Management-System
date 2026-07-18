package com.parking.controller;

import com.parking.entity.Shop;
import com.parking.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import com.parking.entity.ShopStatus;

@RestController
@RequestMapping("/api/admin/shops")
public class ShopController {

    @Autowired
    private ShopRepository shopRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Shop createShop(@RequestBody Shop shop) {
        shop.setStatus(ShopStatus.AVAILABLE);
        return shopRepository.save(shop);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateShop(@PathVariable Long id, @RequestBody Shop updatedShop) {
        Shop existing = shopRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (updatedShop.getShopName() == null || updatedShop.getShopName().isBlank()) {
            return ResponseEntity.badRequest().body("Tên sạp hàng không được trống!");
        }
        existing.setShopName(updatedShop.getShopName());
        return ResponseEntity.ok(shopRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteShop(@PathVariable Long id) {
        Shop existing = shopRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (existing.getReseller() != null || existing.getTenant() != null) {
            return ResponseEntity.badRequest().body("Không thể xóa sạp hàng đã có người quản lý hoặc người thuê!");
        }

        // Delete TenantConfig associated with the shop (if any exists)
        entityManager.createQuery("DELETE FROM TenantConfig t WHERE t.shop = :shop")
                .setParameter("shop", existing)
                .executeUpdate();

        shopRepository.delete(existing);
        return ResponseEntity.ok("Xóa sạp hàng thành công!");
    }
}