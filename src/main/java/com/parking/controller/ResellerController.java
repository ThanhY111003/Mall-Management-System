package com.parking.controller;

import com.parking.entity.Shop;
import com.parking.entity.User;
import com.parking.entity.ShopStatus;
import com.parking.repository.ShopRepository;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reseller/shops")
public class ResellerController {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Xem tất cả các shop đang trống
    @GetMapping("/available")
    @PreAuthorize("hasRole('RESELLER')")
    public List<Shop> getAvailableShops() {
        return shopRepository.findByStatus(ShopStatus.AVAILABLE);
    }

    // 2. Reseller chọn shop để quản lý
    @PostMapping("/assign/{shopId}")
    @PreAuthorize("hasRole('RESELLER')")
    public String assignShop(@PathVariable Long shopId, Principal principal) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop không tồn tại"));

        if (shop.getStatus() != ShopStatus.AVAILABLE) {
            return "Shop này đã có người quản lý!";
        }

        // Lấy thông tin Reseller từ User đang đăng nhập
        User reseller = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Reseller"));

        shop.setReseller(reseller);
        shop.setStatus(ShopStatus.MANAGED);
        shopRepository.save(shop);

        return "Chúc mừng! Bạn đã nhận quản lý shop: " + shop.getShopName();
    }

    // 3. Xem danh sách các Tenant
    @GetMapping("/tenants")
    @PreAuthorize("hasRole('RESELLER')")
    public List<User> getTenants() {
        return userRepository.findByRole(com.parking.entity.Role.TENANT);
    }

    // 4. Cho thuê shop
    @PostMapping("/rent/{shopId}")
    @PreAuthorize("hasRole('RESELLER')")
    public String rentShop(@PathVariable Long shopId, @RequestParam Long tenantId, Principal principal) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop không tồn tại"));

        // Xác thực người quản lý sạp
        User currentReseller = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Reseller"));

        if (shop.getReseller() == null || !shop.getReseller().getId().equals(currentReseller.getId())) {
            return "Lỗi: Bạn không quản lý shop này!";
        }

        User tenant = userRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách thuê (Tenant)"));

        if (!com.parking.entity.Role.TENANT.equals(tenant.getRole())) {
            return "Lỗi: Người dùng được chọn không có vai trò TENANT!";
        }

        shop.setTenant(tenant);
        shop.setStatus(ShopStatus.RENTED);
        shopRepository.save(shop);

        return "Đã cho thuê sạp hàng thành công cho: " + tenant.getUsername();
    }

    // 5. Xem danh sách sạp hàng tôi quản lý
    @GetMapping("/managed")
    @PreAuthorize("hasRole('RESELLER')")
    public List<Shop> getMyManagedShops(Principal principal) {
        User reseller = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Reseller"));
        return shopRepository.findByResellerId(reseller.getId());
    }
}