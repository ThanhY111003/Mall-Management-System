package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tenant_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "shop_id")
    private Shop shop;

    private String brandName;
    private String emailContact;

    // Trong TenantConfig.java
    @Column(columnDefinition = "TEXT")
    private String websiteConfig; // Lưu JSON của GrapesJS (cấu trúc layout)

    @Column(columnDefinition = "TEXT")
    private String productList; // Lưu danh sách sản phẩm dạng JSON
    // Ví dụ: [{"name": "Sầu riêng Ri6", "price": "100k"}, ...]
}