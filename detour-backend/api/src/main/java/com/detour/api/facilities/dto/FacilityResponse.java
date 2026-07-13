package com.detour.api.facilities.dto;

import com.detour.api.facilities.Facility;
import com.detour.api.facilities.FacilityCategory;
import java.math.BigDecimal;

public class FacilityResponse {
    public Integer id;
    public String name;
    public FacilityCategory category;
    public BigDecimal latitude;
    public BigDecimal longitude;
    public String address;
    public String phoneNumber;
    public String region;
    public Double distanceKm;

    public static FacilityResponse from(Facility facility, Double distanceKm) {
        FacilityResponse r = new FacilityResponse();
        r.id = facility.getId();
        r.name = facility.getName();
        r.category = facility.getCategory();
        r.latitude = facility.getLatitude();
        r.longitude = facility.getLongitude();
        r.address = facility.getAddress();
        r.phoneNumber = facility.getPhoneNumber();
        r.region = facility.getRegion();
        r.distanceKm = distanceKm;
        return r;
    }
}
