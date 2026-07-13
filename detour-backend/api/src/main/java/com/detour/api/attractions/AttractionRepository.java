package com.detour.api.attractions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Integer> {

    // Spring Magic: Just by naming this method correctly,
    // Spring automatically generates: SELECT * FROM attractions WHERE region = ?
    List<Attraction> findByRegion(String region);
}
