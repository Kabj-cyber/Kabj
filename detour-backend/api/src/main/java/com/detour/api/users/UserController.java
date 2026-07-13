package com.detour.api.users;


import com.detour.api.users.dto.LoginRequest;
import com.detour.api.users.dto.RegistrationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping("/api/users")
    public class UserController {

        private final UserService userService;

        @Autowired
        public UserController(UserService userService) {
            this.userService = userService;
        }

        // Endpoint: POST http://localhost:8080/api/users/register
        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
            try {
                User savedUser = userService.registerUser(request);
                return ResponseEntity.ok(savedUser);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }

        // Endpoint: POST http://localhost:8080/api/users/login
        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest request) {
            try {
                User loggedInUser = userService.loginUser(request);
                return ResponseEntity.ok(loggedInUser);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
    }
