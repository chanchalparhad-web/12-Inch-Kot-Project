package com.billpro.security;

import com.billpro.user.Role;
import com.billpro.user.User;
import com.billpro.user.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new UsernameNotFoundException("Identifier (mobile or email) cannot be blank.");
        }

        String clean = identifier.trim();

        // 1. Try finding by email
        Optional<User> userOpt = userRepository.findByEmail(clean);

        // 2. Try finding by mobile directly
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByMobile(clean);
        }

        // 3. Try normalizing mobile (strip non-digits, last 10 digits)
        if (userOpt.isEmpty()) {
            String digits = clean.replaceAll("\\D", "");
            if (digits.length() >= 10) {
                String last10 = digits.substring(digits.length() - 10);
                userOpt = userRepository.findByMobile(last10);
            }
        }

        // 4. If "admin" was entered as identifier, find any OWNER user
        if (userOpt.isEmpty() && clean.equalsIgnoreCase("admin")) {
            userOpt = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.OWNER)
                    .findFirst();
        }

        User user = userOpt.orElseThrow(() ->
                new UsernameNotFoundException("User not found with email or mobile: " + clean));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    public Optional<User> findUser(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Optional.empty();
        }
        String clean = identifier.trim();
        Optional<User> userOpt = userRepository.findByEmail(clean);
        if (userOpt.isPresent()) return userOpt;

        userOpt = userRepository.findByMobile(clean);
        if (userOpt.isPresent()) return userOpt;

        String digits = clean.replaceAll("\\D", "");
        if (digits.length() >= 10) {
            String last10 = digits.substring(digits.length() - 10);
            userOpt = userRepository.findByMobile(last10);
            if (userOpt.isPresent()) return userOpt;
        }

        if (clean.equalsIgnoreCase("admin")) {
            return userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.OWNER)
                    .findFirst();
        }
        return Optional.empty();
    }
}
