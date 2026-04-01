package tn.esprit.reviewservice.entity;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.reviewservice.entity.enums.ReviewType;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long contractId;

    private Long reviewerId;

    private Long reviewedUserId;

    @Enumerated(EnumType.STRING)
    private ReviewType reviewType;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}