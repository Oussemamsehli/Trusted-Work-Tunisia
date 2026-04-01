package tn.esprit.reviewservice.service.impl;

import org.springframework.stereotype.Service;
import tn.esprit.reviewservice.dto.request.ReclamationRequest;
import tn.esprit.reviewservice.dto.response.ReclamationResponse;
import tn.esprit.reviewservice.entity.Reclamation;
import tn.esprit.reviewservice.entity.Review;
import tn.esprit.reviewservice.entity.enums.StatusReclamation;
import tn.esprit.reviewservice.exception.ResourceNotFoundException;
import tn.esprit.reviewservice.mapper.ReclamationMapper;
import tn.esprit.reviewservice.repository.ReclamationRepository;
import tn.esprit.reviewservice.repository.ReviewRepository;
import tn.esprit.reviewservice.service.interfaces.IReclamationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReclamationServiceImpl implements IReclamationService {

    private final ReclamationRepository reclamationRepository;
    private final ReviewRepository reviewRepository;
    private final ReclamationMapper reclamationMapper;

    public ReclamationServiceImpl(ReclamationRepository reclamationRepository,
                                  ReviewRepository reviewRepository,
                                  ReclamationMapper reclamationMapper) {
        this.reclamationRepository = reclamationRepository;
        this.reviewRepository = reviewRepository;
        this.reclamationMapper = reclamationMapper;
    }

    @Override
    public ReclamationResponse createReclamation(ReclamationRequest request) {
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Review introuvable avec id : " + request.getReviewId()));

        Reclamation reclamation = reclamationMapper.toEntity(request);
        reclamation.setReview(review);

        Reclamation savedReclamation = reclamationRepository.save(reclamation);
        return reclamationMapper.toResponse(savedReclamation);
    }

    @Override
    public List<ReclamationResponse> getAllReclamations() {
        return reclamationRepository.findAll()
                .stream()
                .map(reclamationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReclamationResponse getReclamationById(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamation introuvable avec id : " + id));
        return reclamationMapper.toResponse(reclamation);
    }

    @Override
    public ReclamationResponse resolveReclamation(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamation introuvable avec id : " + id));

        reclamation.setStatus(StatusReclamation.CONFIRMED);
        reclamation.setResolvedAt(LocalDateTime.now());

        Reclamation updatedReclamation = reclamationRepository.save(reclamation);
        return reclamationMapper.toResponse(updatedReclamation);
    }

    @Override
    public void deleteReclamation(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamation introuvable avec id : " + id));

        reclamationRepository.delete(reclamation);
    }
}