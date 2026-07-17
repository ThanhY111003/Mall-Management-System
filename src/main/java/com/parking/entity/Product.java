package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shopId;

    private String name;
    private Integer price;
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;   // ví dụ: "Giày", "Áo", "Món chính", "Đồ uống"...
    private Integer stock;     // số lượng tồn kho, null = không giới hạn
    private Boolean active;    // true = đang hiển thị trên website, false = ẩn
}
