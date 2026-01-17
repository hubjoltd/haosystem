package com.erp.repository;

import com.erp.model.FiscalPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FiscalPeriodRepository extends JpaRepository<FiscalPeriod, Long> {
    List<FiscalPeriod> findByFiscalYearOrderByPeriodNumber(Integer fiscalYear);
    Optional<FiscalPeriod> findByIsCurrent(Boolean isCurrent);
    Optional<FiscalPeriod> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date1, LocalDate date2);
    List<FiscalPeriod> findByIsClosedOrderByFiscalYearDescPeriodNumberDesc(Boolean isClosed);
}
