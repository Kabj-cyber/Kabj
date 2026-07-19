package com.detour.api.bookings.qr;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

@Service
public class QrTokenService {

    private static final long TOKEN_TTL_MILLIS = 15 * 60 * 1000L;
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();

    private final QrTokenProperties properties;

    public QrTokenService(QrTokenProperties properties) {
        this.properties = properties;
    }

    public String generateToken(Integer bookingId) {
        long expiryEpochMillis = Instant.now().toEpochMilli() + TOKEN_TTL_MILLIS;
        String payload = bookingId + "." + expiryEpochMillis;
        byte[] signature = sign(payload);
        return URL_ENCODER.encodeToString(payload.getBytes(StandardCharsets.UTF_8))
                + "."
                + URL_ENCODER.encodeToString(signature);
    }

    public Integer verifyToken(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Invalid QR signature");
        }

        String[] parts = token.split("\\.", 2);
        if (parts.length != 2) {
            throw new RuntimeException("Invalid QR signature");
        }

        String payload;
        byte[] providedSignature;
        try {
            payload = new String(URL_DECODER.decode(parts[0]), StandardCharsets.UTF_8);
            providedSignature = URL_DECODER.decode(parts[1]);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid QR signature");
        }

        byte[] expectedSignature = sign(payload);
        if (!MessageDigest.isEqual(expectedSignature, providedSignature)) {
            throw new RuntimeException("Invalid QR signature");
        }

        String[] payloadParts = payload.split("\\.", 2);
        if (payloadParts.length != 2) {
            throw new RuntimeException("Invalid QR signature");
        }

        long expiryEpochMillis;
        try {
            expiryEpochMillis = Long.parseLong(payloadParts[1]);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid QR signature");
        }

        if (Instant.now().toEpochMilli() > expiryEpochMillis) {
            throw new RuntimeException("QR code expired");
        }

        try {
            return Integer.parseInt(payloadParts[0]);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid QR signature");
        }
    }

    private byte[] sign(String payload) {
        String secret = properties.getQrSecret();
        if (secret == null || secret.isBlank()) {
            throw new RuntimeException("QR token secret is not configured");
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign QR token", e);
        }
    }
}
