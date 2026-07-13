package com.detour.api.facilities;

import com.detour.api.facilities.dto.FacilityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    @Autowired
    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public List<FacilityResponse> getFacilities(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) FacilityCategory category,
            @RequestParam(required = false) Double radiusKm) {
        return facilityService.getNearbyFacilities(lat, lng, category, radiusKm);
    }
}
