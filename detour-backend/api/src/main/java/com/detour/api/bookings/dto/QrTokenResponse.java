package com.detour.api.bookings.dto;

public class QrTokenResponse {
    public String token;
    public long expiresInSeconds;

    public QrTokenResponse(String token, long expiresInSeconds) {
        this.token = token;
        this.expiresInSeconds = expiresInSeconds;
    }
}
