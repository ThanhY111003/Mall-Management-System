package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shopId;
    private String clientId;       // liên kết với chat clientId (không cần login)
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String paymentMethod;  // COD, ...
    private String status;         // PENDING, CONFIRMED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String itemsJson;      // snapshot giỏ hàng lúc đặt

    private Integer totalAmount;
    private LocalDateTime createdAt;
}
