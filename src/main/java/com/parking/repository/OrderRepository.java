package com.parking.repository;

import com.parking.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByShopIdOrderByCreatedAtDesc(Long shopId);
    List<Order> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);
    List<Order> findByCustomerPhoneAndShopIdOrderByCreatedAtDesc(String customerPhone, Long shopId);
    long countByShopIdAndStatus(Long shopId, String status);
}
