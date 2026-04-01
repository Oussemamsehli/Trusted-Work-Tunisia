package tn.esprit.reviewservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.reviewservice.entity.Badge;
import tn.esprit.reviewservice.entity.enums.CategorieBadge;
import tn.esprit.reviewservice.entity.enums.Rarete;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findByCategorie(CategorieBadge categorie);

    List<Badge> findByRarete(Rarete rarete);
}