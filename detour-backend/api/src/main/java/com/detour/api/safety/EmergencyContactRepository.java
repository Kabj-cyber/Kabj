package com.detour.api.safety;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Integer> {

    List<EmergencyContact> findByUserId(Integer userId);
}
