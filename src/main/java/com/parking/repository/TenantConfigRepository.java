package com.parking.repository;

import com.parking.entity.TenantConfig;
import com.parking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantConfigRepository extends JpaRepository<TenantConfig, Long> {
    Optional<TenantConfig> findByShopId(Long shopId);
}