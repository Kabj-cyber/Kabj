package com.detour.api.safety;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SafetyAlertRepository extends JpaRepository<SafetyAlert, Integer> {

    @Query("SELECT a FROM SafetyAlert a WHERE a.activeFrom <= :now AND (a.activeUntil IS NULL OR a.activeUntil >= :now)")
    List<SafetyAlert> findActiveAlerts(@Param("now") LocalDateTime now);

    @Query("SELECT a FROM SafetyAlert a WHERE a.region = :region AND a.activeFrom <= :now AND (a.activeUntil IS NULL OR a.activeUntil >= :now)")
    List<SafetyAlert> findActiveAlertsByRegion(@Param("region") String region, @Param("now") LocalDateTime now);
}
