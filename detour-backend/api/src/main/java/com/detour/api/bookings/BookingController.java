
package com.detour.api.bookings;


import com.detour.api.bookings.dto.BookingRequest;
import com.detour.api.bookings.dto.QrTokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Endpoint: POST http://localhost:8080/api/bookings
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            Booking savedBooking = bookingService.createBooking(request);
            return ResponseEntity.ok(savedBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint: GET http://localhost:8080/api/bookings/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Integer userId) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(userId));
    }

    @GetMapping("/{id}/qr-token")
    public ResponseEntity<?> getQrToken(
            @PathVariable Integer id,
            @RequestParam Integer touristId
    ) {
        try {
            String token = bookingService.getQrToken(id, touristId);
            return ResponseEntity.ok(new QrTokenResponse(token, 900));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}