package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shopId;
    private String clientId; // Unique ID for each customer session
    private String sender;   // "CUSTOMER" or "TENANT"
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private LocalDateTime timestamp;
}
