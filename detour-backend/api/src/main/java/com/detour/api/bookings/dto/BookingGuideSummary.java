package com.detour.api.bookings.dto;

import com.detour.api.guides.GuideProfile;
import com.detour.api.users.User;
import java.math.BigDecimal;

/**
 * Minimal, tourist-facing view of the guide assigned to a booking.
 * Deliberately excludes sensitive guide fields (license/Ghana card numbers,
 * payout details) that live on GuideProfile but should never reach the
 * tourist's device.
 */
public class BookingGuideSummary {
    public Integer id;
    public String name;
    public String phoneNumber;
    public String specialty;
    public BigDecimal avgRating;

    public static BookingGuideSummary from(GuideProfile profile, User guideUser) {
        BookingGuideSummary r = new BookingGuideSummary();
        r.id = profile.getId();
        r.name = guideUser.getName();
        r.phoneNumber = guideUser.getPhoneNumber();
        r.specialty = profile.getSpecialty();
        r.avgRating = profile.getAvgRating();
        return r;
    }
}
