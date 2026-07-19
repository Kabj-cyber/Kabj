package com.detour.api.guides;

import com.detour.api.guides.dto.*;
import com.detour.api.notifications.NotificationService;
import com.detour.api.payments.provider.PaystackTransferResult;
import com.detour.api.payments.provider.PaystackTransferService;
import com.detour.api.users.User;
import com.detour.api.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class GuideService {

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.075");
    private static final BigDecimal COMMISSION_RATE_PERCENT = new BigDecimal("7.5");
    private static final BigDecimal SCAN_PAYOUT_GUIDE_SHARE = new BigDecimal("0.95");
    private static final Set<String> VALID_PAYOUT_TELCOS = Set.of("MTN", "VOD", "ATL");

    private final GuideProfileRepository guideProfileRepository;
    private final GuideAvailabilityRepository guideAvailabilityRepository;
    private final GuidePayoutRepository guidePayoutRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PaystackTransferService paystackTransferService;

    public GuideService(
            GuideProfileRepository guideProfileRepository,
            GuideAvailabilityRepository guideAvailabilityRepository,
            GuidePayoutRepository guidePayoutRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            PaystackTransferService paystackTransferService
    ) {
        this.guideProfileRepository = guideProfileRepository;
        this.guideAvailabilityRepository = guideAvailabilityRepository;
        this.guidePayoutRepository = guidePayoutRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.paystackTransferService = paystackTransferService;
    }

    @Transactional
    public GuideProfileResponse submitOnboarding(
            Integer userId,
            String bio,
            String specialty,
            String languages,
            String gtaLicenseNo,
            String ghanaCardNumber,
            String companyName,
            String region
    ) {
        if (userId == null) {
            throw new RuntimeException("userId is required");
        }
        if (gtaLicenseNo == null || gtaLicenseNo.isBlank()) {
            throw new RuntimeException("GTA license number is required");
        }
        if (ghanaCardNumber == null || ghanaCardNumber.isBlank()) {
            throw new RuntimeException("Ghana card number is required");
        }
        if (companyName == null || companyName.isBlank()) {
            throw new RuntimeException("Company name is required — we must verify which tour operator you work for before approval");
        }
        if (region == null || region.isBlank()) {
            throw new RuntimeException("Region is required");
        }

        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (guideProfileRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("This user already has a guide profile");
        }

        GuideProfile profile = new GuideProfile();
        profile.setUserId(userId);
        profile.setBio(bio);
        profile.setSpecialty(specialty);
        profile.setLanguages(languages);
        profile.setGtaLicenseNo(gtaLicenseNo.trim());
        profile.setGhanaCardNumber(ghanaCardNumber.trim());
        profile.setCompanyName(companyName.trim());
        profile.setRegion(region.trim());
        profile.setVerificationStatus(VerificationStatus.PENDING);

        return GuideProfileResponse.from(guideProfileRepository.save(profile));
    }

    @Transactional
    public GuideProfileResponse approveGuide(Integer guideId) {
        GuideProfile profile = findGuide(guideId);

        if (profile.getGtaLicenseNo() == null || profile.getGtaLicenseNo().isBlank()
                || profile.getGhanaCardNumber() == null || profile.getGhanaCardNumber().isBlank()
                || profile.getCompanyName() == null || profile.getCompanyName().isBlank()) {
            throw new RuntimeException("Guide cannot be approved without GTA license, Ghana card number, and company name");
        }

        profile.setVerificationStatus(VerificationStatus.APPROVED);
        GuideProfile saved = guideProfileRepository.save(profile);

        notificationService.create(
                saved.getUserId(),
                "GUIDE_APPROVED",
                "Guide application approved",
                "Congratulations! Your guide application has been approved. You can now set availability and accept bookings."
        );

        return GuideProfileResponse.from(saved);
    }

    @Transactional
    public GuideProfileResponse rejectGuide(Integer guideId) {
        GuideProfile profile = findGuide(guideId);
        profile.setVerificationStatus(VerificationStatus.REJECTED);
        GuideProfile saved = guideProfileRepository.save(profile);

        notificationService.create(
                saved.getUserId(),
                "GUIDE_REJECTED",
                "Guide application rejected",
                "Your guide application was not approved. Please contact support for more information."
        );

        return GuideProfileResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<GuideProfileResponse> getPendingGuides() {
        return guideProfileRepository.findByVerificationStatus(VerificationStatus.PENDING).stream()
                .map(GuideProfileResponse::from)
                .toList();
    }

    @Transactional
    public AvailabilityResponse setAvailability(
            Integer guideId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {
        GuideProfile profile = findGuide(guideId);

        // Verification gate temporarily disabled — re-enable before shipping.
        // if (profile.getVerificationStatus() != VerificationStatus.APPROVED) {
        //     throw new RuntimeException("Only approved guides can set availability");
        // }
        if (date == null) {
            throw new RuntimeException("date is required");
        }
        if (startTime == null || endTime == null) {
            throw new RuntimeException("startTime and endTime are required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException("endTime must be after startTime");
        }

        GuideAvailability availability = new GuideAvailability();
        availability.setGuideId(guideId);
        availability.setAvailableDate(date);
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setBooked(false);

        return AvailabilityResponse.from(guideAvailabilityRepository.save(availability));
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailability(Integer guideId, LocalDate fromDate, LocalDate toDate) {
        findGuide(guideId);

        if (fromDate == null || toDate == null) {
            throw new RuntimeException("fromDate and toDate are required");
        }
        if (toDate.isBefore(fromDate)) {
            throw new RuntimeException("toDate must be on or after fromDate");
        }

        return guideAvailabilityRepository
                .findByGuideIdAndAvailableDateBetween(guideId, fromDate, toDate)
                .stream()
                .map(AvailabilityResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public EarningsSummaryResponse getEarningsSummary(Integer guideId) {
        GuideProfile profile = findGuide(guideId);

        BigDecimal totalRevenue = calculateCompletedBookingRevenue(guideId, profile.getBaseRatePerHour());
        BigDecimal commissionAmount = totalRevenue.multiply(COMMISSION_RATE)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal netGuideEarnings = totalRevenue.subtract(commissionAmount);

        BigDecimal totalPaidOut = guidePayoutRepository.findByGuideIdAndPayoutStatus(guideId, PayoutStatus.COMPLETED)
                .stream()
                .map(GuidePayout::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal inFlightPayouts = guidePayoutRepository.findByGuideId(guideId).stream()
                .filter(p -> p.getPayoutStatus() == PayoutStatus.PENDING
                        || p.getPayoutStatus() == PayoutStatus.PROCESSING)
                .map(GuidePayout::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingPayoutBalance = netGuideEarnings.subtract(totalPaidOut).subtract(inFlightPayouts);
        if (pendingPayoutBalance.compareTo(BigDecimal.ZERO) < 0) {
            pendingPayoutBalance = BigDecimal.ZERO;
        }

        return EarningsSummaryResponse.of(
                totalRevenue,
                commissionAmount,
                COMMISSION_RATE_PERCENT,
                netGuideEarnings,
                pendingPayoutBalance
        );
    }

    @Transactional
    public PayoutResponse requestPayout(Integer guideId, BigDecimal amount, String momoNumber) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payout amount must be greater than zero");
        }
        if (momoNumber == null || momoNumber.isBlank()) {
            throw new RuntimeException("Mobile money number is required");
        }

        GuideProfile profile = findGuide(guideId);
        // Verification gate temporarily disabled — re-enable before shipping.
        // if (profile.getVerificationStatus() != VerificationStatus.APPROVED) {
        //     throw new RuntimeException("Only approved guides can request payouts");
        // }

        EarningsSummaryResponse earnings = getEarningsSummary(guideId);
        if (amount.compareTo(earnings.pendingPayoutBalance) > 0) {
            throw new RuntimeException("Payout amount exceeds pending balance");
        }

        GuidePayout payout = new GuidePayout();
        payout.setGuideId(guideId);
        payout.setAmount(amount);
        payout.setMomoNumber(momoNumber.trim());
        payout.setPayoutStatus(PayoutStatus.PENDING);
        payout.setTransactionReference("GUIDE-PAYOUT-" + UUID.randomUUID());

        payout = guidePayoutRepository.save(payout);

        return PayoutResponse.from(
                payout,
                "Payout request submitted. Funds will be sent to "
                        + payout.getMomoNumber()
                        + " once processed (sandbox — no real MoMo API call)."
        );
    }

    @Transactional
    public GuideProfileResponse updatePayoutDetails(Integer guideId, String payoutMomoNumber, String payoutTelco) {
        if (payoutMomoNumber == null || payoutMomoNumber.isBlank()) {
            throw new RuntimeException("Mobile money number is required");
        }
        if (payoutTelco == null || payoutTelco.isBlank()) {
            throw new RuntimeException("Telco is required (MTN, VOD, or ATL)");
        }

        String normalizedTelco = payoutTelco.trim().toUpperCase();
        if (!VALID_PAYOUT_TELCOS.contains(normalizedTelco)) {
            throw new RuntimeException("Invalid telco. Use MTN, VOD, or ATL.");
        }

        GuideProfile profile = findGuide(guideId);
        profile.setPayoutMomoNumber(payoutMomoNumber.trim());
        profile.setPayoutTelco(normalizedTelco);
        return GuideProfileResponse.from(guideProfileRepository.save(profile));
    }

    @Transactional
    public GuidePayout triggerScanPayout(Integer guideProfileId, BigDecimal bookingTotalAmount, Integer bookingId) {
        GuideProfile guideProfile = findGuide(guideProfileId);

        if (guideProfile.getPayoutMomoNumber() == null || guideProfile.getPayoutMomoNumber().isBlank()
                || guideProfile.getPayoutTelco() == null || guideProfile.getPayoutTelco().isBlank()) {
            throw new RuntimeException("Guide has no payout MoMo details on file");
        }

        BigDecimal guideAmount = bookingTotalAmount.multiply(SCAN_PAYOUT_GUIDE_SHARE)
                .setScale(2, RoundingMode.HALF_UP);

        String reference = "SCAN-PAYOUT-" + bookingId + "-" + UUID.randomUUID();

        GuidePayout payout = new GuidePayout();
        payout.setGuideId(guideProfileId);
        payout.setAmount(guideAmount);
        payout.setMomoNumber(guideProfile.getPayoutMomoNumber());
        payout.setPayoutStatus(PayoutStatus.PROCESSING);
        payout.setTransactionReference(reference);
        payout = guidePayoutRepository.save(payout);

        User guideUser = userRepository.findById(guideProfile.getUserId())
                .orElseThrow(() -> new RuntimeException("Guide user not found"));
        String recipientName = guideUser.getName() != null && !guideUser.getName().isBlank()
                ? guideUser.getName()
                : "DeTour Guide";

        PaystackTransferResult recipientResult = paystackTransferService.resolveRecipientCode(
                guideProfile.getPayoutMomoNumber(),
                guideProfile.getPayoutTelco(),
                recipientName
        );
        if (!recipientResult.success()) {
            markPayoutFailed(payout, guideProfile.getUserId(), recipientResult.message());
            return guidePayoutRepository.save(payout);
        }

        PaystackTransferResult transferResult = paystackTransferService.initiateTransfer(
                recipientResult.transferCode(),
                guideAmount,
                "DeTour tour payout for booking #" + bookingId,
                reference
        );
        if (!transferResult.success()) {
            markPayoutFailed(payout, guideProfile.getUserId(), transferResult.message());
            return guidePayoutRepository.save(payout);
        }

        payout.setTransactionReference(transferResult.transferCode());
        if ("success".equalsIgnoreCase(transferResult.status())) {
            payout.setPayoutStatus(PayoutStatus.COMPLETED);
            payout.setProcessedAt(LocalDateTime.now());
        }

        return guidePayoutRepository.save(payout);
    }

    @Transactional
    public void applyTransferWebhookStatus(String reference, String transferStatus) {
        if (reference == null || reference.isBlank()) {
            return;
        }

        guidePayoutRepository.findByTransactionReference(reference).ifPresent(payout -> {
            if (PayoutStatus.COMPLETED.equals(payout.getPayoutStatus())
                    || PayoutStatus.FAILED.equals(payout.getPayoutStatus())) {
                return;
            }

            if ("success".equalsIgnoreCase(transferStatus)) {
                payout.setPayoutStatus(PayoutStatus.COMPLETED);
                payout.setProcessedAt(LocalDateTime.now());
            } else if ("failed".equalsIgnoreCase(transferStatus) || "reversed".equalsIgnoreCase(transferStatus)) {
                GuideProfile profile = guideProfileRepository.findById(payout.getGuideId()).orElse(null);
                if (profile != null) {
                    markPayoutFailed(payout, profile.getUserId(), "Transfer " + transferStatus);
                } else {
                    payout.setPayoutStatus(PayoutStatus.FAILED);
                }
            } else {
                return;
            }

            guidePayoutRepository.save(payout);
        });
    }

    private void markPayoutFailed(GuidePayout payout, Integer guideUserId, String reason) {
        payout.setPayoutStatus(PayoutStatus.FAILED);
        notificationService.create(
                guideUserId,
                "PAYOUT_FAILED",
                "Payout could not be sent",
                "We could not send your tour payout automatically. Our support team will follow up shortly."
                        + (reason != null && !reason.isBlank() ? " (" + reason + ")" : "")
        );
    }

    private GuideProfile findGuide(Integer guideId) {
        return guideProfileRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
    }

    private BigDecimal calculateCompletedBookingRevenue(Integer guideId, BigDecimal baseRatePerHour) {
        if (baseRatePerHour == null || baseRatePerHour.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return guideAvailabilityRepository.findByGuideId(guideId).stream()
                .filter(GuideAvailability::isBooked)
                .map(slot -> {
                    long minutes = Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
                    BigDecimal hours = BigDecimal.valueOf(minutes)
                            .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
                    return baseRatePerHour.multiply(hours);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
