package com.erp.repository;

import com.erp.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByEventDateBetweenAndStatusOrderByStartTimeAsc(LocalDate start, LocalDate end, String status);
    List<CalendarEvent> findByEventDateAndStatusOrderByStartTimeAsc(LocalDate date, String status);
    List<CalendarEvent> findByBranch_IdAndEventDateBetweenAndStatusOrderByStartTimeAsc(Long branchId, LocalDate start, LocalDate end, String status);
    List<CalendarEvent> findByEventDateBetweenOrderByStartTimeAsc(LocalDate start, LocalDate end);
}
