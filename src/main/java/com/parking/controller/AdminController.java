package com.parking.controller;

import com.parking.entity.User;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.parking.repository.ShopRepository;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public record UserDTO(Long id, String username, String role) {
        public static UserDTO from(User u) {
            return new UserDTO(u.getId(), u.getUsername(), u.getRole().name());
        }
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(UserDTO::from).toList();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        if (userRepository.findByUsername(newUser.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại!");
        }

        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        User savedUser = userRepository.save(newUser);
        return ResponseEntity.ok(UserDTO.from(savedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User existing = userRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        
        // If username is changing, check uniqueness
        if (!existing.getUsername().equals(updatedUser.getUsername())) {
            if (userRepository.findByUsername(updatedUser.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại!");
            }
            existing.setUsername(updatedUser.getUsername());
        }
        
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        
        if (updatedUser.getRole() != null) {
            existing.setRole(updatedUser.getRole());
        }
        
        User saved = userRepository.save(existing);
        return ResponseEntity.ok(UserDTO.from(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User existing = userRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // Restrict self-deletion
        org.springframework.security.core.context.SecurityContext context = org.springframework.security.core.context.SecurityContextHolder.getContext();
        String currentUsername = context.getAuthentication().getName();
        if (existing.getUsername().equals(currentUsername)) {
            return ResponseEntity.badRequest().body("Không thể tự xóa tài khoản của chính mình!");
        }

        // 1. Find all shops rented by this tenant and clean up their associated data
        List<com.parking.entity.Shop> shopsRented = shopRepository.findAll().stream()
                .filter(s -> s.getTenant() != null && s.getTenant().getId().equals(id))
                .toList();

        for (com.parking.entity.Shop shop : shopsRented) {
            entityManager.createQuery("DELETE FROM TenantConfig t WHERE t.shop = :shop")
                    .setParameter("shop", shop)
                    .executeUpdate();
            entityManager.createQuery("DELETE FROM Product p WHERE p.shopId = :shopId")
                    .setParameter("shopId", shop.getId())
                    .executeUpdate();
            entityManager.createQuery("DELETE FROM Order o WHERE o.shopId = :shopId")
                    .setParameter("shopId", shop.getId())
                    .executeUpdate();
            entityManager.createQuery("DELETE FROM ChatMessage m WHERE m.shopId = :shopId")
                    .setParameter("shopId", shop.getId())
                    .executeUpdate();
        }

        // 2. Reset reseller/tenant references in shops table
        for (com.parking.entity.Shop shop : shopRepository.findAll()) {
            boolean changed = false;
            if (shop.getReseller() != null && shop.getReseller().getId().equals(id)) {
                shop.setReseller(null);
                shop.setStatus(com.parking.entity.ShopStatus.AVAILABLE);
                changed = true;
            }
            if (shop.getTenant() != null && shop.getTenant().getId().equals(id)) {
                shop.setTenant(null);
                if (shop.getReseller() != null) {
                    shop.setStatus(com.parking.entity.ShopStatus.MANAGED);
                } else {
                    shop.setStatus(com.parking.entity.ShopStatus.AVAILABLE);
                }
                changed = true;
            }
            if (changed) {
                shopRepository.save(shop);
            }
        }

        userRepository.delete(existing);
        return ResponseEntity.ok("Xóa tài khoản thành công!");
    }
}
