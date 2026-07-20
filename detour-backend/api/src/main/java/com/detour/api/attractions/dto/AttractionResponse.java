package com.detour.api.attractions.dto;

import com.detour.api.attractions.Attraction;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AttractionResponse {
    public Integer id;
    public String title;
    public String description;
    public String region;
    public String category;
    public BigDecimal latitude;
    public BigDecimal longitude;
    public BigDecimal basePrice;
    public BigDecimal ecoScore;
    public Integer popularityCount;
    public String imageUrl;
    public BigDecimal averageRating;
    public Integer reviewCount;
    public String amenities;
    public String openingHours;
    public LocalDateTime createdAt;
    public Double distanceKm;
    public boolean isFavorited;

    public static AttractionResponse from(Attraction attraction, Double distanceKm, boolean isFavorited) {
        AttractionResponse r = new AttractionResponse();
        r.id = attraction.getId();
        r.title = attraction.getTitle();
        r.description = attraction.getDescription();
        r.region = attraction.getRegion();
        r.category = attraction.getCategory();
        r.latitude = attraction.getLatitude();
        r.longitude = attraction.getLongitude();
        r.basePrice = attraction.getBasePrice();
        r.ecoScore = attraction.getEcoScore();
        r.popularityCount = attraction.getPopularityCount();
        r.imageUrl = attraction.getImageUrl();
        r.averageRating = attraction.getAverageRating();
        r.reviewCount = attraction.getReviewCount();
        r.amenities = attraction.getAmenities();
        r.openingHours = attraction.getOpeningHours();
        r.createdAt = attraction.getCreatedAt();
        r.distanceKm = distanceKm;
        r.isFavorited = isFavorited;
        return r;
    }
}
