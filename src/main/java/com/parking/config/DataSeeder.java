package com.parking.config;

import com.parking.entity.Role;
import com.parking.entity.Shop;
import com.parking.entity.User;
import com.parking.entity.ShopStatus;
import com.parking.repository.ShopRepository;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users if not present
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .build();

            User reseller = User.builder()
                    .username("reseller1")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.RESELLER)
                    .build();

            User tenant = User.builder()
                    .username("tenant1")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.TENANT)
                    .build();

            userRepository.saveAll(List.of(admin, reseller, tenant));
            System.out.println(">>> Database seeded with default users: admin, reseller1, tenant1 (password: password123)");
        }

        // 2. Seed Shops if not present
        if (shopRepository.count() == 0) {
            Shop shop1 = Shop.builder()
                    .shopName("Sạp Thời Trang A1")
                    .status(ShopStatus.AVAILABLE)
                    .build();

            Shop shop2 = Shop.builder()
                    .shopName("Cửa Hàng Giày Dép B2")
                    .status(ShopStatus.AVAILABLE)
                    .build();

            Shop shop3 = Shop.builder()
                    .shopName("Sạp Bách Hóa C3")
                    .status(ShopStatus.AVAILABLE)
                    .build();

            shopRepository.saveAll(List.of(shop1, shop2, shop3));
            System.out.println(">>> Database seeded with default shops: Sạp Thời Trang A1, Cửa Hàng Giày Dép B2, Sạp Bách Hóa C3");
        }
    }
}
