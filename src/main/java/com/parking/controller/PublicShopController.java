package com.parking.controller;

import com.parking.entity.TenantConfig;
import com.parking.repository.TenantConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/shop")
public class PublicShopController {

    @Autowired
    private TenantConfigRepository tenantConfigRepository;

    @GetMapping("/{shopId}/config")
    public ResponseEntity<TenantConfig> getPublicShopConfig(@PathVariable Long shopId) {
        return tenantConfigRepository.findByShopId(shopId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
