package com.parking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tạm tắt CSRF để dễ test API
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập công khai các API xác thực và xem shop
                        .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                        // Cho phép truy cập công khai các đường dẫn giao diện React
                        .requestMatchers("/", "/login", "/dashboard", "/shop/**", "/tenant/editor/**").permitAll()
                        // Cho phép truy cập công khai tài nguyên tĩnh
                        .requestMatchers("/index.html", "/assets/**", "/*.js", "/*.css", "/favicon.ico", "/*.svg").permitAll()
                        
                        // Các API yêu cầu phân quyền
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/reseller/**").hasAnyRole("ADMIN", "RESELLER")
                        .requestMatchers("/api/tenant/**").hasAnyRole("ADMIN", "RESELLER", "TENANT")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable()) // Tắt form login mặc định của Spring
                .logout(logout -> logout.permitAll());

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Mã hóa mật khẩu
    }
}