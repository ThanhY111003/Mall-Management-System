package com.parking.repository;

import com.parking.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByShopIdOrderByIdDesc(Long shopId);
    List<Product> findByShopIdAndActiveTrueOrderByIdDesc(Long shopId); // dùng cho trang public
}
