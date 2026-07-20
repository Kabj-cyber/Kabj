package com.detour.api.bookings.dto;

import com.detour.api.attractions.Attraction;
import com.detour.api.bookings.Booking;
import com.detour.api.users.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Tourist-facing booking payload. Wraps the Booking entity so we can attach
 * the assigned guide's contact details (name/phone) without exposing the
 * full GuideProfile or requiring the frontend to make a second request.
 */
public class BookingResponse {
    public Integer id;
    public User tourist;
    public Attraction attraction;
    public LocalDateTime bookingDate;
    public BigDecimal totalAmount;
    public String paymentStatus;
    public String syncStatus;
    public String executionStatus;
    public LocalDateTime createdAt;
    public BookingGuideSummary guide;

    public static BookingResponse from(Booking booking, BookingGuideSummary guide) {
        BookingResponse r = new BookingResponse();
        r.id = booking.getId();
        r.tourist = booking.getTourist();
        r.attraction = booking.getAttraction();
        r.bookingDate = booking.getBookingDate();
        r.totalAmount = booking.getTotalAmount();
        r.paymentStatus = booking.getPaymentStatus();
        r.syncStatus = booking.getSyncStatus();
        r.executionStatus = booking.getExecutionStatus();
        r.createdAt = booking.getCreatedAt();
        r.guide = guide;
        return r;
    }
}
