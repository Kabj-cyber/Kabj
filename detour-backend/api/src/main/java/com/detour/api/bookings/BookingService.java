package com.detour.api.bookings;


import com.detour.api.attractions.Attraction;
import com.detour.api.attractions.AttractionRepository;
import com.detour.api.bookings.dto.BookingRequest;
import com.detour.api.bookings.qr.QrTokenService;
import com.detour.api.guides.GuideProfile;
import com.detour.api.guides.GuideProfileRepository;
import com.detour.api.guides.VerificationStatus;
import com.detour.api.notifications.NotificationService;
import com.detour.api.users.User;
import com.detour.api.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingService {

    private static final String PENDING_EXECUTION = "PENDING_EXECUTION";
    private static final DateTimeFormatter BOOKING_DATE_FORMAT =
            DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a");

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final AttractionRepository attractionRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final NotificationService notificationService;
    private final QrTokenService qrTokenService;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          AttractionRepository attractionRepository,
                          GuideProfileRepository guideProfileRepository,
                          NotificationService notificationService,
                          QrTokenService qrTokenService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.attractionRepository = attractionRepository;
        this.guideProfileRepository = guideProfileRepository;
        this.notificationService = notificationService;
        this.qrTokenService = qrTokenService;
    }

    public Booking createBooking(BookingRequest request) {
        User tourist = userRepository.findById(request.touristId)
                .orElseThrow(() -> new RuntimeException("Tourist not found!"));

        Attraction attraction = attractionRepository.findById(request.attractionId)
                .orElseThrow(() -> new RuntimeException("Attraction not found!"));

        Booking newBooking = new Booking();
        newBooking.setTourist(tourist);
        newBooking.setAttraction(attraction);
        newBooking.setTotalAmount(request.totalAmount);
        newBooking.setBookingDate(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(newBooking);

        List<GuideProfile> candidates = guideProfileRepository.findByRegionAndVerificationStatus(
                attraction.getRegion(), VerificationStatus.APPROVED);

        if (candidates.isEmpty()) {
            notificationService.create(
                    tourist.getId(),
                    "GUIDE_PENDING",
                    "We're finding you a guide",
                    "We're matching you with a licensed guide for this region — you'll be notified once confirmed."
            );
            return savedBooking;
        }

        GuideProfile assignedGuide = candidates.get(0);
        long minActive = bookingRepository.countByGuideProfileIdAndExecutionStatus(
                assignedGuide.getId(), PENDING_EXECUTION);

        for (int i = 1; i < candidates.size(); i++) {
            GuideProfile candidate = candidates.get(i);
            long activeCount = bookingRepository.countByGuideProfileIdAndExecutionStatus(
                    candidate.getId(), PENDING_EXECUTION);
            if (activeCount < minActive) {
                minActive = activeCount;
                assignedGuide = candidate;
            }
        }

        savedBooking.setGuideProfileId(assignedGuide.getId());
        savedBooking = bookingRepository.save(savedBooking);

        String bookingDateStr = savedBooking.getBookingDate().format(BOOKING_DATE_FORMAT);
        notificationService.create(
                assignedGuide.getUserId(),
                "NEW_BOOKING_ASSIGNED",
                "New tour assigned",
                "You've been assigned a tour: " + attraction.getTitle() + " on " + bookingDateStr
        );

        User guideUser = userRepository.findById(assignedGuide.getUserId())
                .orElseThrow(() -> new RuntimeException("Guide user not found"));
        notificationService.create(
                tourist.getId(),
                "GUIDE_ASSIGNED",
                "Guide confirmed",
                guideUser.getName() + " will be your guide for " + attraction.getTitle() + "."
        );

        return savedBooking;
    }

    public List<Booking> getBookingsForUser(Integer userId) {
        return bookingRepository.findByTouristId(userId);
    }

    public String getQrToken(Integer bookingId, Integer requestingTouristId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getTourist().getId().equals(requestingTouristId)) {
            throw new RuntimeException("You are not authorized to request a QR token for this booking");
        }
        if (!"PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Booking payment status must be PAID (current: " + booking.getPaymentStatus() + ")");
        }
        if (!PENDING_EXECUTION.equals(booking.getExecutionStatus())) {
            throw new RuntimeException("Booking execution status must be PENDING_EXECUTION (current: "
                    + booking.getExecutionStatus() + ")");
        }

        String token = qrTokenService.generateToken(bookingId);
        booking.setQrTokenIssuedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return token;
    }
}
