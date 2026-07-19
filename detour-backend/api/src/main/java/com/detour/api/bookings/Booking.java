package com.detour.api.bookings;

import com.detour.api.attractions.Attraction;
import com.detour.api.users.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // This links the Booking directly to the User table
    @ManyToOne
    @JoinColumn(name = "tourist_id", nullable = false)
    private User tourist;

    // This links the Booking directly to the Attraction table
    @ManyToOne
    @JoinColumn(name = "attraction_id", nullable = false)
    private Attraction attraction;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "PENDING"; // Default value

    @Column(name = "sync_status", length = 20)
    private String syncStatus = "SYNCED";

    @Column(name = "guide_profile_id")
    private Integer guideProfileId;

    @Column(name = "execution_status", length = 20, nullable = false)
    private String executionStatus = "PENDING_EXECUTION";

    @Column(name = "qr_token_issued_at")
    private LocalDateTime qrTokenIssuedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // --- GETTERS AND SETTERS ---

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public User getTourist() { return tourist; }
    public void setTourist(User tourist) { this.tourist = tourist; }

    public Attraction getAttraction() { return attraction; }
    public void setAttraction(Attraction attraction) { this.attraction = attraction; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getSyncStatus() { return syncStatus; }
    public void setSyncStatus(String syncStatus) { this.syncStatus = syncStatus; }

    public Integer getGuideProfileId() { return guideProfileId; }
    public void setGuideProfileId(Integer guideProfileId) { this.guideProfileId = guideProfileId; }

    public String getExecutionStatus() { return executionStatus; }
    public void setExecutionStatus(String executionStatus) { this.executionStatus = executionStatus; }

    public LocalDateTime getQrTokenIssuedAt() { return qrTokenIssuedAt; }
    public void setQrTokenIssuedAt(LocalDateTime qrTokenIssuedAt) { this.qrTokenIssuedAt = qrTokenIssuedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
