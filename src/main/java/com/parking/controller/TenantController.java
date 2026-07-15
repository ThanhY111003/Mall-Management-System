package com.parking.controller;

import com.parking.entity.TenantConfig;
import com.parking.repository.TenantConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/tenant/config")
public class TenantController {

    @Autowired
    private TenantConfigRepository tenantConfigRepository;

    @GetMapping("/{shopId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    public ResponseEntity<TenantConfig> getConfig(@PathVariable Long shopId) {
        return tenantConfigRepository.findByShopId(shopId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('TENANT')") // Lưu ý: đảm bảo Role trong DB là ROLE_TENANT
    public String updateConfig(@RequestBody TenantConfig newConfig) {
        // Kiểm tra xem cấu hình của shop này đã tồn tại chưa
        // Giả sử newConfig nhận được có chứa object Shop và shop đó có ID
        if (newConfig.getShop() == null || newConfig.getShop().getId() == null) {
            return "Lỗi: Dữ liệu shop không hợp lệ!";
        }

        Optional<TenantConfig> existingConfigOpt = tenantConfigRepository.findByShopId(newConfig.getShop().getId());

        if (existingConfigOpt.isPresent()) {
            // Nếu đã tồn tại, cập nhật bản ghi cũ
            TenantConfig existingConfig = existingConfigOpt.get();
            existingConfig.setBrandName(newConfig.getBrandName());
            existingConfig.setEmailContact(newConfig.getEmailContact());
            existingConfig.setWebsiteConfig(newConfig.getWebsiteConfig());

            tenantConfigRepository.save(existingConfig);
            return "Cấu hình website đã được cập nhật thành công!";
        } else {
            // Nếu chưa tồn tại, lưu mới
            tenantConfigRepository.save(newConfig);
            return "Cấu hình website mới đã được lưu!";
        }
    }
}