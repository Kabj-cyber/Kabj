package com.detour.api.users;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

    @Repository
    public interface UserRepository extends JpaRepository<User, Integer> {

        // Spring writes the SQL: SELECT * FROM users WHERE email = ?
        Optional<User> findByEmail(String email);
    }
