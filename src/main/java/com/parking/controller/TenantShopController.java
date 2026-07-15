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
}
