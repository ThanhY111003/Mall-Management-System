package com.parking.repository;

import com.parking.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShopRepository extends JpaRepository<Shop, Long> {
    List<Shop> findByStatus(String status);
    List<Shop> findByResellerId(Long resellerId);
    List<Shop> findByTenantId(Long tenantId);
}