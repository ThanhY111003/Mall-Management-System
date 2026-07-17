package com.parking.repository;

import com.parking.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Get full chat history between a tenant (shopId) and a customer (clientId)
    List<ChatMessage> findByShopIdAndClientIdOrderByTimestampAsc(Long shopId, String clientId);

    // Get list of unique clientIds who have conversed with this shop
    @Query("SELECT DISTINCT m.clientId FROM ChatMessage m WHERE m.shopId = :shopId")
    List<String> findDistinctClientIdsByShopId(Long shopId);
}
