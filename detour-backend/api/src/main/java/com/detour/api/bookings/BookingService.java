package com.detour.api.bookings;


import com.detour.api.attractions.Attraction;
import com.detour.api.attractions.AttractionRepository;
import com.detour.api.bookings.dto.BookingRequest;
import com.detour.api.notifications.NotificationService;
import com.detour.api.users.User;
import com.detour.api.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final AttractionRepository attractionRepository;
    private final NotificationService notificationService;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          AttractionRepository attractionRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.attractionRepository = attractionRepository;
        this.notificationService = notificationService;
    }

    public Booking createBooking(BookingRequest request) {
        // 1. Verify the User exists
        User tourist = userRepository.findById(request.touristId)
                .orElseThrow(() -> new RuntimeException("Tourist not found!"));

        // 2. Verify the Attraction exists
        Attraction attraction = attractionRepository.findById(request.attractionId)
                .orElseThrow(() -> new RuntimeException("Attraction not found!"));

        // 3. Assemble the Booking
        Booking newBooking = new Booking();
        newBooking.setTourist(tourist);
        newBooking.setAttraction(attraction);
        newBooking.setTotalAmount(request.totalAmount);
        newBooking.setBookingDate(LocalDateTime.now()); // Setting the trip for right now

        // 4. Save to Neon
        Booking savedBooking = bookingRepository.save(newBooking);

        // 5. Let the tourist know their booking went through
        notificationService.create(
                tourist.getId(),
                "BOOKING_CREATED",
                "Booking confirmed",
                "Your booking for " + attraction.getTitle() + " has been submitted."
        );

        return savedBooking;
    }

    public List<Booking> getBookingsForUser(Integer userId) {
        return bookingRepository.findByTouristId(userId);
    }
}
