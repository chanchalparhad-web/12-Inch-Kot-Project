package com.billpro.auth;

public class JwtResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String role;
    private Long businessId;

    public JwtResponse() {}

    public JwtResponse(String token, String tokenType, Long id, String name, String email, String mobile, String role, Long businessId) {
        this.token = token;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.id = id;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.role = role;
        this.businessId = businessId;
    }

    public static JwtResponseBuilder builder() {
        return new JwtResponseBuilder();
    }

    public static class JwtResponseBuilder {
        private String token;
        private String tokenType = "Bearer";
        private Long id;
        private String name;
        private String email;
        private String mobile;
        private String role;
        private Long businessId;

        public JwtResponseBuilder token(String token) { this.token = token; return this; }
        public JwtResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public JwtResponseBuilder id(Long id) { this.id = id; return this; }
        public JwtResponseBuilder name(String name) { this.name = name; return this; }
        public JwtResponseBuilder email(String email) { this.email = email; return this; }
        public JwtResponseBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public JwtResponseBuilder role(String role) { this.role = role; return this; }
        public JwtResponseBuilder businessId(Long businessId) { this.businessId = businessId; return this; }

        public JwtResponse build() {
            return new JwtResponse(token, tokenType, id, name, email, mobile, role, businessId);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
}
