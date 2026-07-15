package com.parking.controller;

import com.parking.entity.Shop;
import com.parking.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shops")
public class ShopController {

    @Autowired
    private ShopRepository shopRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Shop createShop(@RequestBody Shop shop) {
        shop.setStatus("AVAILABLE");
        return shopRepository.save(shop);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }
}