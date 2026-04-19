package tn.esprit.userservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Uploads a profile photo to Cloudinary under the "profiles/" folder.
     *
     * @param file the multipart image file from the HTTP request
     * @return the HTTPS CDN URL of the uploaded image
     */
    public String uploadProfilePhoto(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "profiles",
                            "resource_type", "image",
                            "overwrite", true
                    )
            );
            String url = (String) result.get("secure_url");
            log.info("Profile photo uploaded to Cloudinary: {}", url);
            return url;
        } catch (Exception e) {
            log.error("Failed to upload profile photo to Cloudinary: {}", e.getMessage());
            // Return null so the caller can decide to skip the photo update gracefully
            return null;
        }
    }

    /**
     * Deletes an image from Cloudinary by its public ID.
     *
     * @param publicId the Cloudinary public_id (e.g. "profiles/abc123")
     */
    public void deletePhoto(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Deleted photo from Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.error("Failed to delete photo from Cloudinary: {}", publicId, e);
        }
    }
}
