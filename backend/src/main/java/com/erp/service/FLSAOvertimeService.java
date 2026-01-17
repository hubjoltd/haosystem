package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FLSAOvertimeService {

    private static final BigDecimal FLSA_WEEKLY_THRESHOLD = new BigDecimal("40");
    private static final BigDecimal FLSA_OVERTIME_MULTIPLIER = new BigDecimal("1.5");
    private static final BigDecimal CALIFORNIA_DAILY_THRESHOLD = new BigDecimal("8");
    private static final BigDecimal CALIFORNIA_DOUBLE_TIME_THRESHOLD = new BigDecimal("12");
    private static final BigDecimal DOUBLE_TIME_MULTIPLIER = new BigDecimal("2.0");

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private OvertimeRuleRepository overtimeRuleRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public static class WeeklyOvertimeResult {
        private BigDecimal totalHoursWorked;
        private BigDecimal regularHours;
        private BigDecimal overtimeHours;
        private BigDecimal doubleTimeHours;
        private BigDecimal overtimeMultiplier;
        private String calculationMethod;
        private Map<LocalDate, DailyBreakdown> dailyBreakdown;

        public WeeklyOvertimeResult() {
            this.totalHoursWorked = BigDecimal.ZERO;
            this.regularHours = BigDecimal.ZERO;
            this.overtimeHours = BigDecimal.ZERO;
            this.doubleTimeHours = BigDecimal.ZERO;
            this.overtimeMultiplier = FLSA_OVERTIME_MULTIPLIER;
            this.calculationMethod = "FLSA_FEDERAL";
            this.dailyBreakdown = new LinkedHashMap<>();
        }

        public BigDecimal getTotalHoursWorked() { return totalHoursWorked; }
        public void setTotalHoursWorked(BigDecimal totalHoursWorked) { this.totalHoursWorked = totalHoursWorked; }

        public BigDecimal getRegularHours() { return regularHours; }
        public void setRegularHours(BigDecimal regularHours) { this.regularHours = regularHours; }

        public BigDecimal getOvertimeHours() { return overtimeHours; }
        public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

        public BigDecimal getDoubleTimeHours() { return doubleTimeHours; }
        public void setDoubleTimeHours(BigDecimal doubleTimeHours) { this.doubleTimeHours = doubleTimeHours; }

        public BigDecimal getOvertimeMultiplier() { return overtimeMultiplier; }
        public void setOvertimeMultiplier(BigDecimal overtimeMultiplier) { this.overtimeMultiplier = overtimeMultiplier; }

        public String getCalculationMethod() { return calculationMethod; }
        public void setCalculationMethod(String calculationMethod) { this.calculationMethod = calculationMethod; }

        public Map<LocalDate, DailyBreakdown> getDailyBreakdown() { return dailyBreakdown; }
        public void setDailyBreakdown(Map<LocalDate, DailyBreakdown> dailyBreakdown) { this.dailyBreakdown = dailyBreakdown; }
    }

    public static class DailyBreakdown {
        private BigDecimal hoursWorked;
        private BigDecimal regularHours;
        private BigDecimal overtimeHours;
        private BigDecimal doubleTimeHours;

        public DailyBreakdown() {
            this.hoursWorked = BigDecimal.ZERO;
            this.regularHours = BigDecimal.ZERO;
            this.overtimeHours = BigDecimal.ZERO;
            this.doubleTimeHours = BigDecimal.ZERO;
        }

        public BigDecimal getHoursWorked() { return hoursWorked; }
        public void setHoursWorked(BigDecimal hoursWorked) { this.hoursWorked = hoursWorked; }

        public BigDecimal getRegularHours() { return regularHours; }
        public void setRegularHours(BigDecimal regularHours) { this.regularHours = regularHours; }

        public BigDecimal getOvertimeHours() { return overtimeHours; }
        public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

        public BigDecimal getDoubleTimeHours() { return doubleTimeHours; }
        public void setDoubleTimeHours(BigDecimal doubleTimeHours) { this.doubleTimeHours = doubleTimeHours; }
    }

    public WeeklyOvertimeResult calculateWeeklyOvertime(Long employeeId, LocalDate weekStartDate, LocalDate weekEndDate) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            return new WeeklyOvertimeResult();
        }

        String stateCode = getEmployeeStateCode(employee);
        OvertimeCalculationType calcType = determineCalculationType(stateCode);

        List<AttendanceRecord> weeklyRecords = attendanceRecordRepository
            .findByEmployeeIdAndAttendanceDateBetween(employeeId, weekStartDate, weekEndDate);

        if (calcType == OvertimeCalculationType.CALIFORNIA) {
            return calculateCaliforniaOvertime(weeklyRecords, weekStartDate, weekEndDate);
        } else {
            return calculateFLSAFederalOvertime(weeklyRecords, weekStartDate, weekEndDate);
        }
    }

    public WeeklyOvertimeResult calculateFLSAFederalOvertime(List<AttendanceRecord> records, 
            LocalDate weekStart, LocalDate weekEnd) {
        WeeklyOvertimeResult result = new WeeklyOvertimeResult();
        result.setCalculationMethod("FLSA_FEDERAL");
        result.setOvertimeMultiplier(FLSA_OVERTIME_MULTIPLIER);

        BigDecimal totalWeeklyHours = BigDecimal.ZERO;

        for (AttendanceRecord record : records) {
            BigDecimal dailyHours = calculateDailyHours(record);
            totalWeeklyHours = totalWeeklyHours.add(dailyHours);

            DailyBreakdown daily = new DailyBreakdown();
            daily.setHoursWorked(dailyHours);
            daily.setRegularHours(dailyHours);
            result.getDailyBreakdown().put(record.getAttendanceDate(), daily);
        }

        result.setTotalHoursWorked(totalWeeklyHours);

        if (totalWeeklyHours.compareTo(FLSA_WEEKLY_THRESHOLD) > 0) {
            result.setRegularHours(FLSA_WEEKLY_THRESHOLD);
            result.setOvertimeHours(totalWeeklyHours.subtract(FLSA_WEEKLY_THRESHOLD));
        } else {
            result.setRegularHours(totalWeeklyHours);
            result.setOvertimeHours(BigDecimal.ZERO);
        }

        return result;
    }

    public WeeklyOvertimeResult calculateCaliforniaOvertime(List<AttendanceRecord> records,
            LocalDate weekStart, LocalDate weekEnd) {
        WeeklyOvertimeResult result = new WeeklyOvertimeResult();
        result.setCalculationMethod("CALIFORNIA_DAILY_WEEKLY");
        result.setOvertimeMultiplier(FLSA_OVERTIME_MULTIPLIER);

        BigDecimal totalWeeklyHours = BigDecimal.ZERO;
        BigDecimal totalDailyRegular = BigDecimal.ZERO;
        BigDecimal totalDailyOT = BigDecimal.ZERO;
        BigDecimal totalDoubleTime = BigDecimal.ZERO;
        int consecutiveDays = 0;

        Map<LocalDate, AttendanceRecord> recordsByDate = records.stream()
            .collect(Collectors.toMap(AttendanceRecord::getAttendanceDate, r -> r, (a, b) -> a));

        LocalDate current = weekStart;
        while (!current.isAfter(weekEnd)) {
            AttendanceRecord record = recordsByDate.get(current);
            DailyBreakdown daily = new DailyBreakdown();

            if (record != null) {
                BigDecimal dailyHours = calculateDailyHours(record);
                totalWeeklyHours = totalWeeklyHours.add(dailyHours);
                daily.setHoursWorked(dailyHours);

                consecutiveDays++;

                if (consecutiveDays == 7) {
                    BigDecimal regularPortion = dailyHours.min(CALIFORNIA_DAILY_THRESHOLD);
                    BigDecimal overtimePortion = BigDecimal.ZERO;
                    BigDecimal doubleTimePortion = BigDecimal.ZERO;

                    if (dailyHours.compareTo(CALIFORNIA_DAILY_THRESHOLD) > 0) {
                        if (dailyHours.compareTo(CALIFORNIA_DOUBLE_TIME_THRESHOLD) > 0) {
                            overtimePortion = CALIFORNIA_DOUBLE_TIME_THRESHOLD.subtract(CALIFORNIA_DAILY_THRESHOLD);
                            doubleTimePortion = dailyHours.subtract(CALIFORNIA_DOUBLE_TIME_THRESHOLD);
                        } else {
                            overtimePortion = dailyHours.subtract(CALIFORNIA_DAILY_THRESHOLD);
                        }
                    }
                    doubleTimePortion = doubleTimePortion.add(regularPortion);
                    regularPortion = BigDecimal.ZERO;

                    daily.setRegularHours(regularPortion);
                    daily.setOvertimeHours(overtimePortion);
                    daily.setDoubleTimeHours(doubleTimePortion);
                } else {
                    if (dailyHours.compareTo(CALIFORNIA_DAILY_THRESHOLD) <= 0) {
                        daily.setRegularHours(dailyHours);
                    } else if (dailyHours.compareTo(CALIFORNIA_DOUBLE_TIME_THRESHOLD) <= 0) {
                        daily.setRegularHours(CALIFORNIA_DAILY_THRESHOLD);
                        daily.setOvertimeHours(dailyHours.subtract(CALIFORNIA_DAILY_THRESHOLD));
                    } else {
                        daily.setRegularHours(CALIFORNIA_DAILY_THRESHOLD);
                        daily.setOvertimeHours(CALIFORNIA_DOUBLE_TIME_THRESHOLD.subtract(CALIFORNIA_DAILY_THRESHOLD));
                        daily.setDoubleTimeHours(dailyHours.subtract(CALIFORNIA_DOUBLE_TIME_THRESHOLD));
                    }
                }

                totalDailyRegular = totalDailyRegular.add(daily.getRegularHours());
                totalDailyOT = totalDailyOT.add(daily.getOvertimeHours());
                totalDoubleTime = totalDoubleTime.add(daily.getDoubleTimeHours());
            } else {
                consecutiveDays = 0;
            }

            result.getDailyBreakdown().put(current, daily);
            current = current.plusDays(1);
        }

        result.setTotalHoursWorked(totalWeeklyHours);

        BigDecimal weeklyOTThresholdRemaining = FLSA_WEEKLY_THRESHOLD.subtract(totalDailyRegular);
        if (weeklyOTThresholdRemaining.compareTo(BigDecimal.ZERO) < 0) {
            BigDecimal additionalOT = weeklyOTThresholdRemaining.abs();
            totalDailyOT = totalDailyOT.add(additionalOT);
            totalDailyRegular = FLSA_WEEKLY_THRESHOLD;
        }

        result.setRegularHours(totalDailyRegular);
        result.setOvertimeHours(totalDailyOT);
        result.setDoubleTimeHours(totalDoubleTime);

        return result;
    }

    public Map<Integer, WeeklyOvertimeResult> calculatePeriodOvertime(Long employeeId, 
            LocalDate periodStart, LocalDate periodEnd) {
        Map<Integer, WeeklyOvertimeResult> weeklyResults = new LinkedHashMap<>();
        
        LocalDate current = periodStart;
        WeekFields weekFields = WeekFields.of(DayOfWeek.SUNDAY, 1);
        
        while (!current.isAfter(periodEnd)) {
            int weekNumber = current.get(weekFields.weekOfWeekBasedYear());
            
            LocalDate weekStart = current.with(DayOfWeek.SUNDAY);
            if (weekStart.isBefore(periodStart)) {
                weekStart = periodStart;
            }
            
            LocalDate weekEnd = current.with(DayOfWeek.SATURDAY);
            if (weekEnd.isAfter(periodEnd)) {
                weekEnd = periodEnd;
            }
            
            WeeklyOvertimeResult weekResult = calculateWeeklyOvertime(employeeId, weekStart, weekEnd);
            weeklyResults.put(weekNumber, weekResult);
            
            current = weekEnd.plusDays(1);
        }
        
        return weeklyResults;
    }

    public WeeklyOvertimeResult aggregatePeriodOvertime(Long employeeId, 
            LocalDate periodStart, LocalDate periodEnd) {
        Map<Integer, WeeklyOvertimeResult> weeklyResults = calculatePeriodOvertime(employeeId, periodStart, periodEnd);
        
        WeeklyOvertimeResult aggregated = new WeeklyOvertimeResult();
        aggregated.setCalculationMethod("AGGREGATED_WEEKLY_FLSA");
        
        BigDecimal totalRegular = BigDecimal.ZERO;
        BigDecimal totalOT = BigDecimal.ZERO;
        BigDecimal totalDouble = BigDecimal.ZERO;
        BigDecimal totalHours = BigDecimal.ZERO;
        
        for (WeeklyOvertimeResult weekResult : weeklyResults.values()) {
            totalRegular = totalRegular.add(weekResult.getRegularHours());
            totalOT = totalOT.add(weekResult.getOvertimeHours());
            totalDouble = totalDouble.add(weekResult.getDoubleTimeHours());
            totalHours = totalHours.add(weekResult.getTotalHoursWorked());
            
            aggregated.getDailyBreakdown().putAll(weekResult.getDailyBreakdown());
        }
        
        aggregated.setRegularHours(totalRegular.setScale(2, RoundingMode.HALF_UP));
        aggregated.setOvertimeHours(totalOT.setScale(2, RoundingMode.HALF_UP));
        aggregated.setDoubleTimeHours(totalDouble.setScale(2, RoundingMode.HALF_UP));
        aggregated.setTotalHoursWorked(totalHours.setScale(2, RoundingMode.HALF_UP));
        
        return aggregated;
    }

    private BigDecimal calculateDailyHours(AttendanceRecord record) {
        if (record.getRegularHours() != null && record.getOvertimeHours() != null) {
            return record.getRegularHours().add(record.getOvertimeHours());
        } else if (record.getRegularHours() != null) {
            return record.getRegularHours();
        }
        return BigDecimal.ZERO;
    }

    private String getEmployeeStateCode(Employee employee) {
        if (employee.getLocation() != null && employee.getLocation().getState() != null) {
            String state = employee.getLocation().getState().toUpperCase();
            if (state.contains("CA") || state.contains("CALIFORNIA")) {
                return "CA";
            }
            if (state.contains("AK") || state.contains("ALASKA")) {
                return "AK";
            }
            if (state.contains("NV") || state.contains("NEVADA")) {
                return "NV";
            }
            if (state.contains("CO") || state.contains("COLORADO")) {
                return "CO";
            }
        }
        return "FEDERAL";
    }

    private OvertimeCalculationType determineCalculationType(String stateCode) {
        if ("CA".equals(stateCode)) {
            return OvertimeCalculationType.CALIFORNIA;
        }
        return OvertimeCalculationType.FLSA_FEDERAL;
    }

    public BigDecimal getOvertimeMultiplier() {
        List<OvertimeRule> rules = overtimeRuleRepository.findByIsActiveTrueOrderByPriorityAsc();
        if (!rules.isEmpty() && rules.get(0).getMultiplier() != null) {
            return rules.get(0).getMultiplier();
        }
        return FLSA_OVERTIME_MULTIPLIER;
    }

    private enum OvertimeCalculationType {
        FLSA_FEDERAL,
        CALIFORNIA
    }
}
