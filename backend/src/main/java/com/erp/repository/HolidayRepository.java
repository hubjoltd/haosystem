package com.erp.repository;

import com.erp.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    
    List<Holiday> findByYear(Integer year);
    
    List<Holiday> findByYearAndIsActiveTrue(Integer year);
    
    List<Holiday> findByHolidayType(String holidayType);
    
    List<Holiday> findByYearAndHolidayType(Integer year, String holidayType);
    
    Optional<Holiday> findByHolidayDate(LocalDate date);
    
    List<Holiday> findByHolidayDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT h FROM Holiday h WHERE h.year = :year AND h.isOptional = true AND h.isActive = true")
    List<Holiday> findOptionalHolidaysByYear(@Param("year") Integer year);
    
    @Query("SELECT h FROM Holiday h WHERE h.year = :year AND h.holidayType IN ('FEDERAL', 'COMPANY') AND h.isActive = true ORDER BY h.holidayDate")
    List<Holiday> findMandatoryHolidaysByYear(@Param("year") Integer year);
    
    @Query("SELECT COUNT(h) FROM Holiday h WHERE h.holidayDate BETWEEN :startDate AND :endDate AND h.isActive = true AND h.isOptional = false")
    long countHolidaysBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
