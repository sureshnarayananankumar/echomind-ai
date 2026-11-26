package com.echomind.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String username,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 8, max = 100) String password) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(String token, long expiresInMinutes, UserResponse user) {}

    public record UserResponse(Long id, String username, String email) {}
}
