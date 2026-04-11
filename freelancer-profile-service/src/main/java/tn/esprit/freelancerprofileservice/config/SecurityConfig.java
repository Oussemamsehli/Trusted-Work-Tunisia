package tn.esprit.freelancerprofileservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import tn.esprit.freelancerprofileservice.security.JwtAuthFilter;

/**
 * Configuration Spring Security — stateless JWT
 * Endpoints publics : swagger, profils publics, reviews, rankings
 * Endpoints protégés : création/modification profil, skills, portfolio, etc.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Swagger — accès libre
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api-docs/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // Profils publics — accès libre
                        .requestMatchers("GET", "/api/profiles").permitAll()
                        .requestMatchers("GET", "/api/profiles/{profileId}").permitAll()
                        .requestMatchers("GET", "/api/profiles/ranking/**").permitAll()
                        // Reviews publiques — accès libre
                        .requestMatchers("GET", "/api/reviews/profile/**").permitAll()
                        // Tout le reste — authentification requise
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}