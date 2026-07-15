package com.parking.repository;

import com.parking.entity.Role;
import com.parking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm user theo username để Spring Security xác thực
    Optional<User> findByUsername(String username);

    // Tìm danh sách user theo vai trò
    List<User> findByRole(Role role);
}