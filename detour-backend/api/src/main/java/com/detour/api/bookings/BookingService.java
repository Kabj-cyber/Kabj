package com.detour.api.bookings;


import com.detour.api.attractions.Attraction;
import com.detour.api.attractions.AttractionRepository;
import com.detour.api.bookings.dto.BookingRequest;
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

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          AttractionRepository attractionRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.attractionRepository = attractionRepository;
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
        return bookingRepository.save(newBooking);
    }

    public List<Booking> getBookingsForUser(Integer userId) {
        return bookingRepository.findByTouristId(userId);
    }
}
