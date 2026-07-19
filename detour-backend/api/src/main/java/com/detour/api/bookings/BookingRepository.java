
package com.detour.api.bookings;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Spring generates: SELECT * FROM bookings WHERE tourist_id = ?
    List<Booking> findByTouristId(Integer touristId);

    long countByGuideProfileIdAndExecutionStatus(Integer guideProfileId, String executionStatus);
}