package tn.esprit.freelancerprofileservice.clients;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class UserClient {

    private final RestTemplate restTemplate;

    private static final String BASE_URL = "http://localhost:8081/api/users/";

    public PublicUserResponse getPublicUser(Long userId) {
        try {
            String url = BASE_URL + userId + "/public";
            System.out.println(">>> USER CLIENT PUBLIC URL = " + url);

            PublicUserResponse response = restTemplate.getForObject(
                    url,
                    PublicUserResponse.class
            );

            if (response == null) {
                System.out.println(">>> USER CLIENT PUBLIC - response is null");
                return null;
            }

            System.out.println(">>> USER CLIENT PUBLIC - response email = " + response.getEmail());
            System.out.println(">>> USER CLIENT PUBLIC - firstName = " + response.getFirstName());
            System.out.println(">>> USER CLIENT PUBLIC - lastName = " + response.getLastName());

            return response;

        } catch (Exception e) {
            System.out.println(">>> USER CLIENT PUBLIC ERROR - " + e.getMessage());
            return null;
        }
    }

    public String getUserFullName(Long userId) {
        PublicUserResponse response = getPublicUser(userId);

        if (response == null) {
            return "Unknown User";
        }

        String firstName = response.getFirstName() != null ? response.getFirstName().trim() : "";
        String lastName = response.getLastName() != null ? response.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();

        System.out.println(">>> USER CLIENT FULLNAME - fullName = " + fullName);

        return fullName.isEmpty() ? "Unknown User" : fullName;
    }

    public String getUserEmail(Long userId) {
        PublicUserResponse response = getPublicUser(userId);

        if (response == null || response.getEmail() == null) {
            return null;
        }

        String email = response.getEmail().trim();
        System.out.println(">>> USER CLIENT EMAIL = " + email);

        return email.isBlank() ? null : email;
    }

    @Data
    public static class PublicUserResponse {
        private Long id;
        private Integer cin;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
        private String kycStatus;
        private int trustLevel;
        private String accountStatus;
    }
}