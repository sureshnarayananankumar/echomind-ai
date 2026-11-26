package com.echomind.service;

import com.echomind.dto.AuthDtos.*;
import com.echomind.entity.User;
import com.echomind.entity.UserSettings;
import com.echomind.repository.UserRepository;
import com.echomind.repository.UserSettingsRepository;
import com.echomind.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final UserSettingsRepository settings;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, UserSettingsRepository settings, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.settings = settings; this.encoder = encoder; this.jwt = jwt;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        User u = new User();
        u.setUsername(req.username().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);
        UserSettings s = new UserSettings();
        s.setUserId(u.getId());
        settings.save(s);
        return token(u);
    }

    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmailIgnoreCase(req.email())
                .filter(x -> encoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return token(u);
    }

    private AuthResponse token(User u) {
        return new AuthResponse(jwt.generate(u.getId(), u.getEmail()), jwt.getExpirationMinutes(),
                new UserResponse(u.getId(), u.getUsername(), u.getEmail()));
    }
}
