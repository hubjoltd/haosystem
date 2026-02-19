package com.erp.controller;

import com.erp.model.CalendarEvent;
import com.erp.model.Employee;
import com.erp.model.Branch;
import com.erp.repository.CalendarEventRepository;
import com.erp.repository.EmployeeRepository;
import com.erp.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "*")
public class CalendarEventController {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private BranchRepository branchRepository;

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEvent>> getEvents(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long branchId) {
        
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : start.plusMonths(1).minusDays(1);
        
        List<CalendarEvent> events;
        if (branchId != null) {
            events = calendarEventRepository.findByBranch_IdAndEventDateBetweenAndStatusOrderByStartTimeAsc(branchId, start, end, "ACTIVE");
        } else {
            events = calendarEventRepository.findByEventDateBetweenAndStatusOrderByStartTimeAsc(start, end, "ACTIVE");
        }
        return ResponseEntity.ok(events);
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<CalendarEvent> getEvent(@PathVariable Long id) {
        return calendarEventRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/events")
    public ResponseEntity<CalendarEvent> createEvent(@RequestBody Map<String, Object> data) {
        CalendarEvent event = new CalendarEvent();
        
        event.setTitle((String) data.get("title"));
        event.setDescription((String) data.get("description"));
        
        if (data.get("eventDate") != null) {
            event.setEventDate(LocalDate.parse(data.get("eventDate").toString()));
        }
        if (data.get("startTime") != null && !data.get("startTime").toString().isEmpty()) {
            event.setStartTime(LocalTime.parse(data.get("startTime").toString()));
        }
        if (data.get("endTime") != null && !data.get("endTime").toString().isEmpty()) {
            event.setEndTime(LocalTime.parse(data.get("endTime").toString()));
        }
        
        event.setEventType((String) data.getOrDefault("eventType", "EVENT"));
        event.setColor((String) data.getOrDefault("color", "#4CAF50"));
        event.setLocation((String) data.get("location"));
        event.setMeetingLink((String) data.get("meetingLink"));
        event.setAllDay(Boolean.TRUE.equals(data.get("allDay")));
        event.setAttendeeIds((String) data.get("attendeeIds"));
        
        if (data.get("createdById") != null) {
            Long createdById = Long.valueOf(data.get("createdById").toString());
            employeeRepository.findById(createdById).ifPresent(event::setCreatedBy);
        }
        
        if (data.get("branchId") != null) {
            Long branchId = Long.valueOf(data.get("branchId").toString());
            branchRepository.findById(branchId).ifPresent(event::setBranch);
        }
        
        CalendarEvent saved = calendarEventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<CalendarEvent> updateEvent(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return calendarEventRepository.findById(id)
            .map(event -> {
                if (data.containsKey("title")) event.setTitle((String) data.get("title"));
                if (data.containsKey("description")) event.setDescription((String) data.get("description"));
                if (data.get("eventDate") != null) {
                    event.setEventDate(LocalDate.parse(data.get("eventDate").toString()));
                }
                if (data.containsKey("startTime")) {
                    String st = data.get("startTime") != null ? data.get("startTime").toString() : null;
                    event.setStartTime(st != null && !st.isEmpty() ? LocalTime.parse(st) : null);
                }
                if (data.containsKey("endTime")) {
                    String et = data.get("endTime") != null ? data.get("endTime").toString() : null;
                    event.setEndTime(et != null && !et.isEmpty() ? LocalTime.parse(et) : null);
                }
                if (data.containsKey("eventType")) event.setEventType((String) data.get("eventType"));
                if (data.containsKey("color")) event.setColor((String) data.get("color"));
                if (data.containsKey("location")) event.setLocation((String) data.get("location"));
                if (data.containsKey("meetingLink")) event.setMeetingLink((String) data.get("meetingLink"));
                if (data.containsKey("allDay")) event.setAllDay(Boolean.TRUE.equals(data.get("allDay")));
                if (data.containsKey("attendeeIds")) event.setAttendeeIds((String) data.get("attendeeIds"));
                if (data.containsKey("status")) event.setStatus((String) data.get("status"));
                
                return ResponseEntity.ok(calendarEventRepository.save(event));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        return calendarEventRepository.findById(id)
            .map(event -> {
                event.setStatus("CANCELLED");
                calendarEventRepository.save(event);
                return ResponseEntity.ok(Map.of("message", "Event cancelled"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
