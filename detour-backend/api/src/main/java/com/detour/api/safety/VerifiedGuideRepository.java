package com.detour.api.safety;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerifiedGuideRepository extends JpaRepository<VerifiedGuide, Integer> {

    List<VerifiedGuide> findByRegionAndVerifiedTrue(String region);

    List<VerifiedGuide> findByVerifiedTrue();
}
