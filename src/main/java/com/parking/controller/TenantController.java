package com.parking.controller;

import com.parking.entity.Role;
import com.parking.entity.Shop;
import com.parking.entity.User;
import com.parking.entity.TenantConfig;
import com.parking.repository.ShopRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.TenantConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenant/config")
public class TenantController {

    @Autowired
    private TenantConfigRepository tenantConfigRepository;

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
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    public ResponseEntity<?> getConfig(@PathVariable Long shopId, Principal principal) {
        if (!isOwnerOrAdmin(shopId, principal)) {
            return ResponseEntity.status(403).body("Bạn không có quyền xem cấu hình sạp này!");
        }
        return tenantConfigRepository.findByShopId(shopId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<String> updateConfig(@RequestBody TenantConfig newConfig, Principal principal) {
        if (newConfig.getShop() == null || newConfig.getShop().getId() == null) {
            return ResponseEntity.badRequest().body("Lỗi: Dữ liệu shop không hợp lệ!");
        }

        Long shopId = newConfig.getShop().getId();
        if (!isOwnerOrAdmin(shopId, principal)) {
            return ResponseEntity.status(403).body("Bạn không sở hữu sạp hàng này!");
        }

        Optional<TenantConfig> existingConfigOpt = tenantConfigRepository.findByShopId(shopId);

        if (existingConfigOpt.isPresent()) {
            TenantConfig existingConfig = existingConfigOpt.get();
            existingConfig.setBrandName(newConfig.getBrandName());
            existingConfig.setEmailContact(newConfig.getEmailContact());
            existingConfig.setWebsiteConfig(newConfig.getWebsiteConfig());

            tenantConfigRepository.save(existingConfig);
            return ResponseEntity.ok("Cấu hình website đã được cập nhật thành công!");
        } else {
            tenantConfigRepository.save(newConfig);
            return ResponseEntity.ok("Cấu hình website mới đã được lưu!");
        }
    }
}