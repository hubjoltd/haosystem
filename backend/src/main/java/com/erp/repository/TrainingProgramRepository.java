package com.erp.repository;

import com.erp.model.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {
    Optional<TrainingProgram> findByProgramCode(String programCode);
    
    List<TrainingProgram> findByIsActive(Boolean isActive);
    
    List<TrainingProgram> findByCategory(String category);
    
    List<TrainingProgram> findByTrainingType(String trainingType);
    
    List<TrainingProgram> findByIsMandatoryTrue();
    
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.isActive = true AND " +
           "(LOWER(tp.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(tp.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<TrainingProgram> searchPrograms(@Param("search") String search);
    
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.isActive = true AND tp.isMandatory = true")
    List<TrainingProgram> findActiveMandatoryPrograms();
}
