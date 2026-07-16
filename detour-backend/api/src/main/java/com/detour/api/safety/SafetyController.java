package com.detour.api.safety;

import com.detour.api.safety.dto.EmergencyContactRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {

    private final SafetyService safetyService;

    @Value("${detour.safety.upload-dir:uploads/safety}")
    private String uploadDir;

    @Autowired
    public SafetyController(SafetyService safetyService) {
        this.safetyService = safetyService;
    }

    @GetMapping("/guides")
    public ResponseEntity<List<VerifiedGuide>> getVerifiedGuides(
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(safetyService.getVerifiedGuides(region));
    }

    @GetMapping("/users/{userId}/emergency-contacts")
    public ResponseEntity<List<EmergencyContact>> getEmergencyContacts(@PathVariable Integer userId) {
        return ResponseEntity.ok(safetyService.getEmergencyContacts(userId));
    }

    @PostMapping("/users/{userId}/emergency-contacts")
    public ResponseEntity<?> addEmergencyContact(@PathVariable Integer userId,
                                                 @RequestBody EmergencyContactRequest request) {
        try {
            return ResponseEntity.ok(safetyService.addEmergencyContact(userId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}/emergency-contacts/{contactId}")
    public ResponseEntity<?> deleteEmergencyContact(@PathVariable Integer userId,
                                                    @PathVariable Integer contactId) {
        try {
            safetyService.deleteEmergencyContact(userId, contactId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/incidents", consumes = "multipart/form-data")
    public ResponseEntity<?> submitIncident(
            @RequestParam Integer userId,
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") Integer durationSeconds,
            @RequestParam(required = false) MultipartFile audio) {
        try {
            String audioPath = null;
            if (audio != null && !audio.isEmpty()) {
                audioPath = saveAudio(audio);
            }
            SafetyIncident incident = safetyService.createIncident(
                    userId, latitude, longitude, region, audioPath, durationSeconds);
            return ResponseEntity.ok(incident);
        } catch (RuntimeException | IOException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/incidents/user/{userId}")
    public ResponseEntity<List<SafetyIncident>> getUserIncidents(@PathVariable Integer userId) {
        return ResponseEntity.ok(safetyService.getUserIncidents(userId));
    }

    private String saveAudio(MultipartFile audio) throws IOException {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "-" + audio.getOriginalFilename();
        Path target = dir.resolve(filename);
        Files.write(target, audio.getBytes());
        return target.toString();
    }
}
