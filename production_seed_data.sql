-- Production Database Seed Script for Hao System
-- Run this in your Neon PostgreSQL console

-- =====================================================
-- DEPARTMENTS
-- =====================================================
INSERT INTO departments (name, code, description, is_active, created_at, updated_at)
VALUES 
  ('Information Technology', 'IT', 'IT and Software Development', true, NOW(), NOW()),
  ('Human Resources', 'HR', 'HR and People Operations', true, NOW(), NOW()),
  ('Finance', 'FIN', 'Finance and Accounting', true, NOW(), NOW()),
  ('Sales', 'SALES', 'Sales and Business Development', true, NOW(), NOW()),
  ('Operations', 'OPS', 'Operations and Logistics', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- GRADES
-- =====================================================
INSERT INTO grades (name, code, description, min_salary, max_salary, is_active, created_at, updated_at)
VALUES 
  ('Junior', 'JR', 'Entry level position', 30000, 50000, true, NOW(), NOW()),
  ('Mid-Level', 'MID', 'Mid-level position', 50000, 80000, true, NOW(), NOW()),
  ('Senior', 'SR', 'Senior level position', 80000, 120000, true, NOW(), NOW()),
  ('Lead', 'LEAD', 'Team lead position', 100000, 150000, true, NOW(), NOW()),
  ('Executive', 'EXEC', 'Executive level position', 150000, 250000, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- LOCATIONS
-- =====================================================
INSERT INTO locations (name, code, address, city, state, country, zip_code, is_active, created_at, updated_at)
VALUES 
  ('Headquarters', 'HQ', '123 Main Street', 'New York', 'NY', 'USA', '10001', true, NOW(), NOW()),
  ('West Coast Office', 'WEST', '456 Tech Blvd', 'San Francisco', 'CA', 'USA', '94102', true, NOW(), NOW()),
  ('South Office', 'SOUTH', '789 Business Park', 'Austin', 'TX', 'USA', '73301', true, NOW(), NOW()),
  ('Midwest Office', 'MIDWEST', '321 Corporate Dr', 'Chicago', 'IL', 'USA', '60601', true, NOW(), NOW()),
  ('Remote', 'REMOTE', 'Work From Home', 'Various', 'Various', 'USA', '00000', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DESIGNATIONS
-- =====================================================
INSERT INTO designations (name, code, description, is_active, created_at, updated_at)
VALUES 
  ('Software Engineer', 'SWE', 'Software development and engineering', true, NOW(), NOW()),
  ('HR Executive', 'HRE', 'Human resources management', true, NOW(), NOW()),
  ('Financial Analyst', 'FA', 'Financial analysis and reporting', true, NOW(), NOW()),
  ('Sales Representative', 'SR', 'Sales and customer relations', true, NOW(), NOW()),
  ('Operations Manager', 'OM', 'Operations and process management', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PAY FREQUENCIES
-- =====================================================
INSERT INTO pay_frequencies (name, code, periods_per_year, description, is_active, created_at, updated_at)
VALUES 
  ('Monthly', 'MONTHLY', 12, 'Paid once per month', true, NOW(), NOW()),
  ('Bi-Weekly', 'BIWEEKLY', 26, 'Paid every two weeks', true, NOW(), NOW()),
  ('Weekly', 'WEEKLY', 52, 'Paid every week', true, NOW(), NOW()),
  ('Semi-Monthly', 'SEMIMONTHLY', 24, 'Paid twice per month', true, NOW(), NOW()),
  ('Annual', 'ANNUAL', 1, 'Paid once per year', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- EMPLOYEES
-- =====================================================
INSERT INTO employees (
  employee_code, first_name, last_name, email, phone, 
  department_id, designation_id, grade_id, location_id,
  date_of_joining, employment_type, employment_status, 
  annual_salary, hourly_rate, pay_frequency_id,
  is_active, created_at, updated_at
)
SELECT 
  'EMP001', 'John', 'Smith', 'john.smith@company.com', '555-0101',
  (SELECT id FROM departments WHERE code = 'IT'),
  (SELECT id FROM designations WHERE code = 'SWE'),
  (SELECT id FROM grades WHERE code = 'SR'),
  (SELECT id FROM locations WHERE code = 'HQ'),
  '2023-01-15', 'FULL_TIME', 'ACTIVE',
  95000, 45.67, (SELECT id FROM pay_frequencies WHERE code = 'MONTHLY'),
  true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP001');

INSERT INTO employees (
  employee_code, first_name, last_name, email, phone, 
  department_id, designation_id, grade_id, location_id,
  date_of_joining, employment_type, employment_status, 
  annual_salary, hourly_rate, pay_frequency_id,
  is_active, created_at, updated_at
)
SELECT 
  'EMP002', 'Sarah', 'Johnson', 'sarah.johnson@company.com', '555-0102',
  (SELECT id FROM departments WHERE code = 'HR'),
  (SELECT id FROM designations WHERE code = 'HRE'),
  (SELECT id FROM grades WHERE code = 'MID'),
  (SELECT id FROM locations WHERE code = 'HQ'),
  '2023-03-20', 'FULL_TIME', 'ACTIVE',
  65000, 31.25, (SELECT id FROM pay_frequencies WHERE code = 'BIWEEKLY'),
  true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP002');

INSERT INTO employees (
  employee_code, first_name, last_name, email, phone, 
  department_id, designation_id, grade_id, location_id,
  date_of_joining, employment_type, employment_status, 
  annual_salary, hourly_rate, pay_frequency_id,
  is_active, created_at, updated_at
)
SELECT 
  'EMP003', 'Michael', 'Williams', 'michael.williams@company.com', '555-0103',
  (SELECT id FROM departments WHERE code = 'FIN'),
  (SELECT id FROM designations WHERE code = 'FA'),
  (SELECT id FROM grades WHERE code = 'SR'),
  (SELECT id FROM locations WHERE code = 'WEST'),
  '2022-11-01', 'FULL_TIME', 'ACTIVE',
  85000, 40.87, (SELECT id FROM pay_frequencies WHERE code = 'SEMIMONTHLY'),
  true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP003');

INSERT INTO employees (
  employee_code, first_name, last_name, email, phone, 
  department_id, designation_id, grade_id, location_id,
  date_of_joining, employment_type, employment_status, 
  annual_salary, hourly_rate, pay_frequency_id,
  is_active, created_at, updated_at
)
SELECT 
  'EMP004', 'Emily', 'Brown', 'emily.brown@company.com', '555-0104',
  (SELECT id FROM departments WHERE code = 'SALES'),
  (SELECT id FROM designations WHERE code = 'SR'),
  (SELECT id FROM grades WHERE code = 'MID'),
  (SELECT id FROM locations WHERE code = 'SOUTH'),
  '2023-06-10', 'FULL_TIME', 'ACTIVE',
  70000, 33.65, (SELECT id FROM pay_frequencies WHERE code = 'BIWEEKLY'),
  true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP004');

INSERT INTO employees (
  employee_code, first_name, last_name, email, phone, 
  department_id, designation_id, grade_id, location_id,
  date_of_joining, employment_type, employment_status, 
  annual_salary, hourly_rate, pay_frequency_id,
  is_active, created_at, updated_at
)
SELECT 
  'EMP005', 'David', 'Davis', 'david.davis@company.com', '555-0105',
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM designations WHERE code = 'OM'),
  (SELECT id FROM grades WHERE code = 'LEAD'),
  (SELECT id FROM locations WHERE code = 'MIDWEST'),
  '2022-08-15', 'FULL_TIME', 'ACTIVE',
  110000, 52.88, (SELECT id FROM pay_frequencies WHERE code = 'MONTHLY'),
  true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP005');

-- =====================================================
-- PROJECTS
-- =====================================================
INSERT INTO projects (name, code, description, status, start_date, end_date, budget, is_active, created_at, updated_at)
VALUES 
  ('Website Redesign', 'PROJ001', 'Company website redesign project', 'IN_PROGRESS', '2024-01-01', '2024-06-30', 150000, true, NOW(), NOW()),
  ('Mobile App Development', 'PROJ002', 'Mobile application development', 'IN_PROGRESS', '2024-02-01', '2024-08-31', 250000, true, NOW(), NOW()),
  ('ERP Implementation', 'PROJ003', 'Enterprise resource planning system', 'PLANNING', '2024-04-01', '2024-12-31', 500000, true, NOW(), NOW()),
  ('Marketing Campaign', 'PROJ004', 'Q2 Marketing campaign', 'COMPLETED', '2024-01-15', '2024-03-31', 75000, true, NOW(), NOW()),
  ('Infrastructure Upgrade', 'PROJ005', 'IT infrastructure modernization', 'IN_PROGRESS', '2024-03-01', '2024-09-30', 300000, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PAYROLL RUNS
-- =====================================================
INSERT INTO payroll_runs (
  payroll_run_number, period_start_date, period_end_date, pay_date,
  pay_period_type, status, total_employees, total_gross_pay, total_net_pay,
  total_taxes, total_deductions, created_at, updated_at
)
VALUES 
  ('PR-2024-001', '2024-12-01', '2024-12-31', '2024-12-31', 'MONTHLY', 'PROCESSED', 5, 35416.67, 26812.50, 6245.41, 2358.76, NOW(), NOW()),
  ('PR-2024-002', '2024-12-16', '2024-12-31', '2025-01-05', 'SEMIMONTHLY', 'CALCULATED', 5, 17708.33, 13406.25, 3122.71, 1179.37, NOW(), NOW())
ON CONFLICT (payroll_run_number) DO NOTHING;

-- =====================================================
-- PAYROLL RECORDS
-- =====================================================
INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ001',
  160, 8, 7916.67, 547.50, 8464.17,
  1269.63, 423.21, 524.78, 122.73, 2340.35,
  500.00, 5623.82, 'PROCESSED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-001' AND e.employee_code = 'EMP001'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ003',
  160, 4, 5416.67, 187.50, 5604.17,
  840.63, 280.21, 347.46, 81.26, 1549.56,
  350.00, 3704.61, 'PROCESSED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-001' AND e.employee_code = 'EMP002'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ002',
  160, 0, 7083.33, 0, 7083.33,
  1062.50, 354.17, 439.17, 102.71, 1958.55,
  450.00, 4674.78, 'PROCESSED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-001' AND e.employee_code = 'EMP003'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ004',
  160, 12, 5833.33, 303.47, 6136.80,
  920.52, 306.84, 380.48, 88.98, 1696.82,
  400.00, 4039.98, 'PROCESSED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-001' AND e.employee_code = 'EMP004'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ005',
  160, 6, 9166.67, 476.10, 9642.77,
  1446.42, 482.14, 597.85, 139.82, 2666.23,
  600.00, 6376.54, 'PROCESSED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-001' AND e.employee_code = 'EMP005'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

-- Second payroll run records
INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ001',
  80, 4, 3958.33, 273.75, 4232.08,
  634.81, 211.60, 262.39, 61.37, 1170.17,
  250.00, 2811.91, 'CALCULATED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-002' AND e.employee_code = 'EMP001'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ003',
  80, 2, 2708.33, 93.75, 2802.08,
  420.31, 140.10, 173.73, 40.63, 774.77,
  175.00, 1852.31, 'CALCULATED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-002' AND e.employee_code = 'EMP002'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ002',
  80, 0, 3541.67, 0, 3541.67,
  531.25, 177.08, 219.58, 51.35, 979.26,
  225.00, 2337.41, 'CALCULATED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-002' AND e.employee_code = 'EMP003'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ004',
  80, 6, 2916.67, 151.73, 3068.40,
  460.26, 153.42, 190.24, 44.49, 848.41,
  200.00, 2019.99, 'CALCULATED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-002' AND e.employee_code = 'EMP004'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

INSERT INTO payroll_records (
  payroll_run_id, employee_id, employee_type, project_code,
  regular_hours, overtime_hours, base_pay, overtime_pay, gross_pay,
  federal_tax, state_tax, social_security_tax, medicare_tax, total_taxes,
  total_deductions, net_pay, status, created_at, updated_at
)
SELECT 
  pr.id, e.id, 'SALARIED', 'PROJ005',
  80, 3, 4583.33, 238.05, 4821.38,
  723.21, 241.07, 298.92, 69.91, 1333.11,
  300.00, 3188.27, 'CALCULATED', NOW(), NOW()
FROM payroll_runs pr, employees e
WHERE pr.payroll_run_number = 'PR-2024-002' AND e.employee_code = 'EMP005'
AND NOT EXISTS (
  SELECT 1 FROM payroll_records pr2 
  WHERE pr2.payroll_run_id = pr.id AND pr2.employee_id = e.id
);

-- =====================================================
-- ATTENDANCE RECORDS (Today and Yesterday)
-- =====================================================
INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE, '09:00:00', '17:30:00', 8.0, 0.5, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP001'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE, '08:30:00', '17:00:00', 8.0, 0.5, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP002'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE, '09:15:00', '18:00:00', 8.0, 0.75, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP003'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE, '08:45:00', '17:15:00', 8.0, 0.5, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP004'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE, '09:00:00', '18:30:00', 8.0, 1.5, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP005'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE
);

-- Yesterday's attendance
INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE - 1, '09:00:00', '17:00:00', 8.0, 0, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP001'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE - 1
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE - 1, '08:30:00', '17:30:00', 8.0, 1.0, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP002'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE - 1
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE - 1, '09:00:00', '17:00:00', 8.0, 0, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP003'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE - 1
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE - 1, '08:45:00', '18:00:00', 8.0, 1.25, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP004'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE - 1
);

INSERT INTO attendances (
  employee_id, attendance_date, clock_in, clock_out, 
  regular_hours, overtime_hours, status, created_at, updated_at
)
SELECT 
  e.id, CURRENT_DATE - 1, '09:00:00', '17:00:00', 8.0, 0, 'APPROVED', NOW(), NOW()
FROM employees e WHERE e.employee_code = 'EMP005'
AND NOT EXISTS (
  SELECT 1 FROM attendances a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE - 1
);

-- =====================================================
-- LEAVE TYPES (if not already present)
-- =====================================================
INSERT INTO leave_types (name, code, description, annual_entitlement, accrual_type, carry_forward_allowed, max_carry_forward, is_paid, is_active, applicable_gender, requires_approval, created_at, updated_at)
VALUES ('Annual Leave', 'ANNUAL', 'Yearly vacation leave entitlement', 20, 'ANNUALLY', true, 5, true, true, 'ALL', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO leave_types (name, code, description, annual_entitlement, accrual_type, carry_forward_allowed, max_carry_forward, is_paid, is_active, applicable_gender, requires_approval, created_at, updated_at)
VALUES ('Sick Leave', 'SICK', 'Medical and health-related leave', 15, 'ANNUALLY', false, 0, true, true, 'ALL', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO leave_types (name, code, description, annual_entitlement, accrual_type, carry_forward_allowed, max_carry_forward, is_paid, is_active, applicable_gender, requires_approval, created_at, updated_at)
VALUES ('Casual Leave', 'CASUAL', 'Short-term personal leave', 10, 'ANNUALLY', false, 0, true, true, 'ALL', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO leave_types (name, code, description, annual_entitlement, accrual_type, carry_forward_allowed, max_carry_forward, is_paid, is_active, applicable_gender, requires_approval, created_at, updated_at)
VALUES ('Maternity Leave', 'MATERNITY', 'Leave for expecting mothers', 90, 'ANNUALLY', false, 0, true, true, 'FEMALE', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO leave_types (name, code, description, annual_entitlement, accrual_type, carry_forward_allowed, max_carry_forward, is_paid, is_active, applicable_gender, requires_approval, created_at, updated_at)
VALUES ('Paternity Leave', 'PATERNITY', 'Leave for new fathers', 14, 'ANNUALLY', false, 0, true, true, 'MALE', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO leave_types (name, code, description, annual_entitlement, accrual_type, carry_forward_allowed, max_carry_forward, is_paid, is_active, applicable_gender, requires_approval, created_at, updated_at)
VALUES ('Unpaid Leave', 'UNPAID', 'Leave without pay', 30, 'ANNUALLY', false, 0, false, true, 'ALL', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

SELECT 'Sample data inserted successfully!' AS result;
