package com.billpro.auth;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    private String emailOrMobile;

    @NotBlank
    private String password;

    public LoginRequest() {}

    public String getEmailOrMobile() { return emailOrMobile; }
    public void setEmailOrMobile(String emailOrMobile) { this.emailOrMobile = emailOrMobile; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
