package com.detour.api.safety;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafetyIncidentRepository extends JpaRepository<SafetyIncident, Integer> {

    List<SafetyIncident> findByUserIdOrderBySubmittedAtDesc(Integer userId);
}
