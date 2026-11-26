package com.echomind.security;

/** Lightweight principal stored in the SecurityContext. */
public record AuthUser(Long id, String email) {}
