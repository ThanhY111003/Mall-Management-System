package com.parking.controller;

import com.parking.entity.Product;
import com.parking.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/products")
public class PublicProductController {

    @Autowired private ProductRepository productRepository;

    @GetMapping("/{shopId}")
    public ResponseEntity<List<Product>> getActiveProducts(@PathVariable Long shopId) {
        return ResponseEntity.ok(productRepository.findByShopIdAndActiveTrueOrderByIdDesc(shopId));
    }
}
