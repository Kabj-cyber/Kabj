package com.detour.api.users;


import com.detour.api.users.dto.LoginRequest;
import com.detour.api.users.dto.RegistrationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

    @Service
    public class UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        @Autowired
        public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
            this.userRepository = userRepository;
            this.passwordEncoder = passwordEncoder;
        }

        public User registerUser(RegistrationRequest request) {
            // 1. Check if email already exists
            if (userRepository.findByEmail(request.email).isPresent()) {
                throw new RuntimeException("Email is already in use!");
            }

            // 2. Create new user and hash the password
            User newUser = new User();
            newUser.setName(request.name);
            newUser.setEmail(request.email);
            newUser.setPasswordHash(passwordEncoder.encode(request.password)); // Security!
            newUser.setRole(request.role != null ? request.role : "TOURIST");
            newUser.setPhoneNumber(request.phoneNumber);

            // 3. Save to Neon database
            return userRepository.save(newUser);
        }

        public User loginUser(LoginRequest request) {
            // 1. Find user by email
            User user = userRepository.findByEmail(request.email)
                    .orElseThrow(() -> new RuntimeException("User not found!"));

            // 2. Check if the provided password matches the hashed password in DB
            if (!passwordEncoder.matches(request.password, user.getPasswordHash())) {
                throw new RuntimeException("Invalid password!");
            }

            return user; // Login successful!
        }


    }
