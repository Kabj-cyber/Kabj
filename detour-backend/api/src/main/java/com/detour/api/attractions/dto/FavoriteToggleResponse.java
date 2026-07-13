package com.detour.api.attractions.dto;

public class FavoriteToggleResponse {
    public boolean favorited;

    public static FavoriteToggleResponse of(boolean favorited) {
        FavoriteToggleResponse r = new FavoriteToggleResponse();
        r.favorited = favorited;
        return r;
    }
}
