package com.detour.api.facilities;

import com.detour.api.facilities.dto.FacilityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private final FacilityRepository facilityRepository;

    @Autowired
    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public List<FacilityResponse> getNearbyFacilities(
            Double lat, Double lng, FacilityCategory category, Double radiusKm) {
        List<Facility> facilities = category != null
                ? facilityRepository.findByCategory(category)
                : facilityRepository.findAll();

        List<FacilityResponse> responses = facilities.stream()
                .map(facility -> toResponse(facility, lat, lng))
                .collect(Collectors.toList());

        if (lat != null && lng != null && radiusKm != null) {
            responses = responses.stream()
                    .filter(r -> r.distanceKm != null && r.distanceKm <= radiusKm)
                    .collect(Collectors.toList());
        }

        if (lat != null && lng != null) {
            responses.sort(Comparator.comparing(
                    r -> r.distanceKm != null ? r.distanceKm : Double.MAX_VALUE));
        }

        return responses;
    }

    public double calculateDistanceKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private FacilityResponse toResponse(Facility facility, Double userLat, Double userLng) {
        Double distanceKm = null;
        if (userLat != null && userLng != null
                && facility.getLatitude() != null && facility.getLongitude() != null) {
            distanceKm = calculateDistanceKm(
                    userLat,
                    userLng,
                    facility.getLatitude().doubleValue(),
                    facility.getLongitude().doubleValue());
            distanceKm = Math.round(distanceKm * 10.0) / 10.0;
        }
        return FacilityResponse.from(facility, distanceKm);
    }
}
