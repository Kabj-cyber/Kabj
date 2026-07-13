package com.detour.api.attractions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttractionFavoriteRepository extends JpaRepository<AttractionFavorite, Integer> {

    @Query("SELECT af FROM AttractionFavorite af WHERE af.user.id = :userId AND af.attraction.id = :attractionId")
    Optional<AttractionFavorite> findByUserIdAndAttractionId(
            @Param("userId") Integer userId,
            @Param("attractionId") Integer attractionId);

    @Query("SELECT af.attraction.id FROM AttractionFavorite af WHERE af.user.id = :userId")
    List<Integer> findAttractionIdsByUserId(@Param("userId") Integer userId);

    @Modifying
    @Query("DELETE FROM AttractionFavorite af WHERE af.user.id = :userId AND af.attraction.id = :attractionId")
    void deleteByUserIdAndAttractionId(
            @Param("userId") Integer userId,
            @Param("attractionId") Integer attractionId);
}
