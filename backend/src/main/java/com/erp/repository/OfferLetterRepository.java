package com.erp.repository;

import com.erp.model.OfferLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {
    Optional<OfferLetter> findByOfferNumber(String offerNumber);
    
    List<OfferLetter> findByCandidateId(Long candidateId);
    
    List<OfferLetter> findByStatus(String status);
    
    @Query("SELECT o FROM OfferLetter o WHERE o.status = 'SENT' AND o.validUntil < :today")
    List<OfferLetter> findExpiredOffers(@Param("today") LocalDate today);
    
    @Query("SELECT o FROM OfferLetter o WHERE o.status = 'ACCEPTED' AND o.proposedJoinDate BETWEEN :start AND :end")
    List<OfferLetter> findAcceptedOffersWithJoinDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
    
    @Query("SELECT o FROM OfferLetter o WHERE o.status = 'SENT' AND o.validUntil >= :today")
    List<OfferLetter> findPendingOffers(@Param("today") LocalDate today);
}
