package com.detour.api.attractions;

import com.detour.api.attractions.dto.AttractionResponse;
import com.detour.api.users.User;
import com.detour.api.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttractionService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private final AttractionRepository attractionRepository;
    private final AttractionFavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Autowired
    public AttractionService(
            AttractionRepository attractionRepository,
            AttractionFavoriteRepository favoriteRepository,
            UserRepository userRepository) {
        this.attractionRepository = attractionRepository;
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
    }

    public List<Attraction> getAllAttractions() {
        return attractionRepository.findAll();
    }

    public List<AttractionResponse> getAllAttractions(Double userLat, Double userLng, Integer userId) {
        List<Attraction> attractions = attractionRepository.findAll();
        Set<Integer> favoritedIds = getFavoritedIdSet(userId);

        List<AttractionResponse> responses = attractions.stream()
                .map(attraction -> toResponse(attraction, userLat, userLng, favoritedIds.contains(attraction.getId())))
                .collect(Collectors.toList());

        if (userLat != null && userLng != null) {
            responses.sort(Comparator.comparing(
                    r -> r.distanceKm != null ? r.distanceKm : Double.MAX_VALUE));
        }

        return responses;
    }

    public List<Attraction> getAttractionsByRegion(String region) {
        return attractionRepository.findByRegion(region);
    }

    @Transactional
    public boolean toggleFavorite(Integer userId, Integer attractionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Attraction attraction = attractionRepository.findById(attractionId)
                .orElseThrow(() -> new RuntimeException("Attraction not found with id: " + attractionId));

        if (favoriteRepository.findByUserIdAndAttractionId(userId, attractionId).isPresent()) {
            favoriteRepository.deleteByUserIdAndAttractionId(userId, attractionId);
            return false;
        }

        AttractionFavorite favorite = new AttractionFavorite();
        favorite.setUser(user);
        favorite.setAttraction(attraction);
        favoriteRepository.save(favorite);
        return true;
    }

    public List<Integer> getFavoritedAttractionIds(Integer userId) {
        return favoriteRepository.findAttractionIdsByUserId(userId);
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

    private AttractionResponse toResponse(
            Attraction attraction, Double userLat, Double userLng, boolean isFavorited) {
        Double distanceKm = null;
        if (userLat != null && userLng != null
                && attraction.getLatitude() != null && attraction.getLongitude() != null) {
            distanceKm = calculateDistanceKm(
                    userLat,
                    userLng,
                    attraction.getLatitude().doubleValue(),
                    attraction.getLongitude().doubleValue());
            distanceKm = Math.round(distanceKm * 10.0) / 10.0;
        }
        return AttractionResponse.from(attraction, distanceKm, isFavorited);
    }

    private Set<Integer> getFavoritedIdSet(Integer userId) {
        if (userId == null) {
            return Set.of();
        }
        return new HashSet<>(favoriteRepository.findAttractionIdsByUserId(userId));
    }
}
