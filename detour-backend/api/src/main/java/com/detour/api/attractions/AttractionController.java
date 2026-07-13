package com.detour.api.attractions;

import com.detour.api.attractions.dto.AttractionResponse;
import com.detour.api.attractions.dto.FavoriteToggleResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attractions")
public class AttractionController {

    private final AttractionService attractionService;

    @Autowired
    public AttractionController(AttractionService attractionService) {
        this.attractionService = attractionService;
    }

    @GetMapping
    public List<AttractionResponse> getAll(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Integer userId) {
        return attractionService.getAllAttractions(lat, lng, userId);
    }

    @GetMapping("/region/{region}")
    public List<Attraction> getByRegion(@PathVariable String region) {
        return attractionService.getAttractionsByRegion(region);
    }

    @PostMapping("/{id}/favorite")
    public FavoriteToggleResponse toggleFavorite(
            @PathVariable Integer id,
            @RequestParam Integer userId) {
        boolean favorited = attractionService.toggleFavorite(userId, id);
        return FavoriteToggleResponse.of(favorited);
    }

    @GetMapping("/favorites")
    public List<Integer> getFavorites(@RequestParam Integer userId) {
        return attractionService.getFavoritedAttractionIds(userId);
    }
}
