package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shopName; // Ví dụ: Sạp A1, Sạp A2
    private String status;   // AVAILABLE, RENTED

    @ManyToOne
    @JoinColumn(name = "reseller_id")
    private User reseller; // Người quản lý sạp

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private User tenant;   // Công ty thuê sạp
}