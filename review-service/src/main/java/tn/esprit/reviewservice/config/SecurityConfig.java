package tn.esprit.reviewservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tn.esprit.reviewservice.security.JwtAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // ── OPTIONS preflight (CORS) ──────────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── Swagger ───────────────────────────────────────────────
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // ── BADGES — catalogue public (lecture) ───────────────────
                        .requestMatchers(HttpMethod.GET, "/api/badges").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/badges/**").permitAll()

                        // ── ADMIN uniquement ──────────────────────────────────────
                        // Reviews : suppression
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**")
                        .hasRole("ADMIN")

                        // Reclamations : workflow de modération
                        .requestMatchers(HttpMethod.PUT, "/api/reclamations/**/in-review")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reclamations/**/confirm")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reclamations/**/reject")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/reclamations/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reclamations/status/**")
                        .hasRole("ADMIN")

                        // Badges : création / modification / suppression
                        .requestMatchers(HttpMethod.POST, "/api/badges")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/badges/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/badges/**")
                        .hasRole("ADMIN")

                        // TrustScores : vue globale + suppression
                        .requestMatchers(HttpMethod.GET, "/api/trustscores")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/trustscores/**")
                        .hasRole("ADMIN")

                        // UserBadges : attribution manuelle + suppression
                        .requestMatchers(HttpMethod.POST, "/api/userbadges")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/userbadges/**")
                        .hasRole("ADMIN")

                        // GrowthProfiles : vue globale
                        .requestMatchers(HttpMethod.GET, "/api/growthprofiles")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/growthprofiles/**")
                        .hasRole("ADMIN")

                        // ── Tout le reste : authentifié (FREELANCER ou CLIENT) ────
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:4200",
                "http://localhost:4201",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept",
                "Origin", "X-Requested-With"
        ));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}