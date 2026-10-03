package com.billpro.auth;

import com.billpro.business.Business;
import com.billpro.business.BusinessRepository;
import com.billpro.exception.InsufficientStockException;
import com.billpro.security.JwtTokenProvider;
import com.billpro.user.Role;
import com.billpro.user.User;
import com.billpro.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
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

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       BusinessRepository businessRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public JwtResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new InsufficientStockException("Email is already registered!");
        }

        // Create Business Profile first
        Business business = Business.builder()
                .name(registerRequest.getBusinessName() != null ? registerRequest.getBusinessName() : registerRequest.getName() + " Business")
                .ownerName(registerRequest.getName())
                .mobile(registerRequest.getMobile())
                .email(registerRequest.getEmail())
                .invoicePrefix("INV")
                .build();
        business = businessRepository.save(business);

        // Create User
        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .mobile(registerRequest.getMobile())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.OWNER)
                .businessId(business.getId())
                .build();
        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getEmail(), registerRequest.getPassword())
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmailOrMobile(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmailOrMobile())
                .orElseGet(() -> userRepository.findByMobile(loginRequest.getEmailOrMobile()).orElseThrow());

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
