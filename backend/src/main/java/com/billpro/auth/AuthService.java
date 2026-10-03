package com.billpro.auth;

import com.billpro.business.Business;
import com.billpro.business.BusinessRepository;
import com.billpro.exception.InsufficientStockException;
import com.billpro.security.CustomUserDetailsService;
import com.billpro.security.JwtTokenProvider;
import com.billpro.user.Role;
import com.billpro.user.User;
import com.billpro.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       BusinessRepository businessRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       CustomUserDetailsService customUserDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Transactional
    public JwtResponse registerUser(RegisterRequest registerRequest) {
        String cleanEmail = registerRequest.getEmail() != null ? registerRequest.getEmail().trim() : "";
        String cleanMobile = registerRequest.getMobile() != null ? registerRequest.getMobile().trim() : "";

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new InsufficientStockException("Email is already registered!");
        }

        // Create Business Profile first
        Business business = Business.builder()
                .name(registerRequest.getBusinessName() != null ? registerRequest.getBusinessName() : registerRequest.getName() + " Business")
                .ownerName(registerRequest.getName())
                .mobile(cleanMobile)
                .email(cleanEmail)
                .invoicePrefix("INF")
                .build();
        business = businessRepository.save(business);

        // Create User with hashed password
        User user = User.builder()
                .name(registerRequest.getName())
                .email(cleanEmail)
                .mobile(cleanMobile)
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.OWNER)
                .businessId(business.getId())
                .build();
        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), registerRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return JwtResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .businessId(business.getId())
                .build();
    }

    public JwtResponse loginUser(LoginRequest loginRequest) {
        String input = loginRequest.getEmailOrMobile() != null ? loginRequest.getEmailOrMobile().trim() : "";
        String password = loginRequest.getPassword() != null ? loginRequest.getPassword() : "";

        User user = customUserDetailsService.findUser(input)
                .orElseThrow(() -> new BadCredentialsException("Invalid phone number or email"));

        // Authenticate using the found user's canonical email
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return JwtResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .businessId(user.getBusinessId())
                .build();
    }
}
