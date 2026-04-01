package tn.esprit.reviewservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.reviewservice.entity.Review;
import tn.esprit.reviewservice.entity.enums.ReviewType;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewerId(Long reviewerId);

    List<Review> findByReviewedUserId(Long reviewedUserId);

    List<Review> findByContractId(Long contractId);

    List<Review> findByReviewType(ReviewType reviewType);
}