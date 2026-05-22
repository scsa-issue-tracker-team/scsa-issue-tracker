package com.scsa.issuetracker.auth.controller;

import com.scsa.issuetracker.auth.dto.CurrentUserResponse;
import com.scsa.issuetracker.auth.dto.LoginRequest;
import com.scsa.issuetracker.auth.dto.LoginResponse;
import com.scsa.issuetracker.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        return authService.getCurrentUser();
    }

}
