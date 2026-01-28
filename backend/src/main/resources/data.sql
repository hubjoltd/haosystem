-- =====================================================
-- CLEANUP DUPLICATES BEFORE SEEDING
-- =====================================================

-- Remove duplicate employees (keep lowest ID)
DELETE FROM employees WHERE id NOT IN (
    SELECT MIN(id) FROM employees GROUP BY employee_code
);

-- Remove duplicate departments (keep lowest ID)
DELETE FROM departments WHERE id NOT IN (
    SELECT MIN(id) FROM departments GROUP BY code
);

-- Remove duplicate designations (keep lowest ID)
DELETE FROM designations WHERE id NOT IN (
    SELECT MIN(id) FROM designations GROUP BY code
);

-- Remove duplicate locations (keep lowest ID)
DELETE FROM locations WHERE id NOT IN (
    SELECT MIN(id) FROM locations GROUP BY code
);

-- Remove duplicate grades (keep lowest ID)
DELETE FROM grades WHERE id NOT IN (
    SELECT MIN(id) FROM grades GROUP BY code
);

-- Remove duplicate job_roles (keep lowest ID)
DELETE FROM job_roles WHERE id NOT IN (
    SELECT MIN(id) FROM job_roles GROUP BY code
);

-- Remove duplicate branches (keep lowest ID)
DELETE FROM branches WHERE id NOT IN (
    SELECT MIN(id) FROM branches GROUP BY code
);

-- Remove duplicate roles (keep lowest ID)
DELETE FROM roles WHERE id NOT IN (
    SELECT MIN(id) FROM roles GROUP BY name
);

-- Remove duplicate users (keep lowest ID)
DELETE FROM users WHERE id NOT IN (
    SELECT MIN(id) FROM users GROUP BY username
);

-- Remove duplicate leave_types (keep lowest ID)
DELETE FROM leave_types WHERE id NOT IN (
    SELECT MIN(id) FROM leave_types GROUP BY code
);

-- Remove duplicate document_categories (keep lowest ID)
DELETE FROM document_categories WHERE id NOT IN (
    SELECT MIN(id) FROM document_categories GROUP BY code
);

-- Remove duplicate document_types (keep lowest ID)
DELETE FROM document_types WHERE id NOT IN (
    SELECT MIN(id) FROM document_types GROUP BY code
);

-- Remove duplicate training_programs (keep lowest ID)
DELETE FROM training_programs WHERE id NOT IN (
    SELECT MIN(id) FROM training_programs GROUP BY program_code
);

-- Remove duplicate job_requisitions (keep lowest ID)
DELETE FROM job_requisitions WHERE id NOT IN (
    SELECT MIN(id) FROM job_requisitions GROUP BY requisition_number
);

-- Remove duplicate onboarding_plans (keep lowest ID)
DELETE FROM onboarding_plans WHERE id NOT IN (
    SELECT MIN(id) FROM onboarding_plans GROUP BY plan_number
);

-- Remove duplicate candidates (keep lowest ID based on email)
DELETE FROM candidates WHERE id NOT IN (
    SELECT MIN(id) FROM candidates GROUP BY email
);

-- Remove duplicate employee_salaries (keep one current per employee)
DELETE FROM employee_salaries WHERE id NOT IN (
    SELECT MIN(id) FROM employee_salaries GROUP BY employee_id, is_current
);

-- =====================================================
-- END CLEANUP
-- =====================================================

-- Seed default leave types using ON CONFLICT to be idempotent
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

-- Seed Document Categories
INSERT INTO document_categories (code, name, description, sort_order, active, created_at, updated_at)
VALUES ('ID_WORK_AUTH', 'Identification & Work Authorization', 'Documents for identity verification and work authorization', 1, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_categories (code, name, description, sort_order, active, created_at, updated_at)
VALUES ('TAX_PAYROLL', 'Tax & Payroll Documents', 'Tax forms and payroll setup documents', 2, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_categories (code, name, description, sort_order, active, created_at, updated_at)
VALUES ('EMPLOYMENT_HR', 'Employment & HR Documents', 'Employment contracts and HR documentation', 3, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_categories (code, name, description, sort_order, active, created_at, updated_at)
VALUES ('FEDERAL_COMPLIANCE', 'Federal Compliance Forms', 'Federal employment compliance documents', 4, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_categories (code, name, description, sort_order, active, created_at, updated_at)
VALUES ('CERTIFICATIONS', 'Certifications & Licenses', 'Professional certifications and licenses', 5, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_categories (code, name, description, sort_order, active, created_at, updated_at)
VALUES ('OTHER_DOCS', 'Other Optional Documents', 'Additional optional documents', 6, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed Document Types for Identification & Work Authorization
INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'DRIVERS_LICENSE', 'Driver''s License or State ID (front & back)', 'Government-issued photo identification', id, true, true, 60, 1, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'PASSPORT', 'Passport (valid, photo page)', 'Valid passport with photo page', id, false, true, 90, 2, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'SOCIAL_SECURITY', 'Social Security Card', 'Social Security Administration card', id, true, false, 30, 3, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'WORK_VISA', 'Work Visa (H1B, F1 OPT, EAD, Green Card)', 'Work authorization visa documentation', id, false, true, 90, 4, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'I94_RECORD', 'I-94 Arrival/Departure Record', 'I-94 arrival and departure record if applicable', id, false, true, 60, 5, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'I20_DS2019', 'I-20 or DS-2019 (for F1/J1 visa holders)', 'I-20 for F1 or DS-2019 for J1 visa holders', id, false, true, 90, 6, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'EAD_CARD', 'Employment Authorization Document (EAD)', 'USCIS Employment Authorization Document', id, false, true, 90, 7, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'GREEN_CARD', 'Permanent Resident Card (Green Card)', 'USCIS Permanent Resident Card', id, false, true, 365, 8, true, NOW(), NOW()
FROM document_categories WHERE code = 'ID_WORK_AUTH'
ON CONFLICT (code) DO NOTHING;

-- Seed Document Types for Tax & Payroll Documents
INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'W4_FORM', 'W-4 (Employee''s Withholding Certificate)', 'IRS Form W-4 for W-2 employees', id, true, false, 30, 1, true, NOW(), NOW()
FROM document_categories WHERE code = 'TAX_PAYROLL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'W9_FORM', 'W-9 (Request for Taxpayer Identification)', 'IRS Form W-9 for 1099 contractors', id, false, false, 30, 2, true, NOW(), NOW()
FROM document_categories WHERE code = 'TAX_PAYROLL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'STATE_TAX_FORM', 'State Tax Forms', 'State-specific tax withholding forms (e.g., GA G-4)', id, false, false, 30, 3, true, NOW(), NOW()
FROM document_categories WHERE code = 'TAX_PAYROLL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'VOIDED_CHECK', 'Voided Check or Bank Letter', 'Bank account verification for payroll setup', id, true, false, 30, 4, true, NOW(), NOW()
FROM document_categories WHERE code = 'TAX_PAYROLL'
ON CONFLICT (code) DO NOTHING;

-- Seed Document Types for Employment & HR Documents
INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'OFFER_LETTER', 'Signed Offer Letter', 'Company offer letter signed by employee', id, true, false, 30, 1, true, NOW(), NOW()
FROM document_categories WHERE code = 'EMPLOYMENT_HR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'EMPLOYMENT_CONTRACT', 'Employment Contract or Agreement', 'Formal employment contract or agreement', id, true, false, 30, 2, true, NOW(), NOW()
FROM document_categories WHERE code = 'EMPLOYMENT_HR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'NDA', 'Non-Disclosure Agreement (NDA)', 'Signed confidentiality agreement', id, true, false, 30, 3, true, NOW(), NOW()
FROM document_categories WHERE code = 'EMPLOYMENT_HR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'JOB_DESCRIPTION', 'Job Description (signed acknowledgement)', 'Signed job description acknowledgement', id, false, false, 30, 4, true, NOW(), NOW()
FROM document_categories WHERE code = 'EMPLOYMENT_HR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'HANDBOOK_ACK', 'Employee Handbook Acknowledgement Form', 'Signed employee handbook acknowledgement', id, true, false, 30, 5, true, NOW(), NOW()
FROM document_categories WHERE code = 'EMPLOYMENT_HR'
ON CONFLICT (code) DO NOTHING;

-- Seed Document Types for Federal Compliance Forms
INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'I9_FORM', 'I-9 Employment Eligibility Verification', 'USCIS Form I-9 for employment eligibility', id, true, false, 30, 1, true, NOW(), NOW()
FROM document_categories WHERE code = 'FEDERAL_COMPLIANCE'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'E_VERIFY', 'E-Verify Confirmation', 'E-Verify employment authorization confirmation', id, true, false, 30, 2, true, NOW(), NOW()
FROM document_categories WHERE code = 'FEDERAL_COMPLIANCE'
ON CONFLICT (code) DO NOTHING;

-- Seed Document Types for Certifications & Licenses
INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'PROFESSIONAL_LICENSE', 'Professional Licenses', 'Professional licenses (e.g., electrician, cosmetologist)', id, false, true, 90, 1, true, NOW(), NOW()
FROM document_categories WHERE code = 'CERTIFICATIONS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'SAFETY_CERT', 'Safety Certifications', 'Safety certifications (e.g., OSHA, CPR)', id, false, true, 90, 2, true, NOW(), NOW()
FROM document_categories WHERE code = 'CERTIFICATIONS'
ON CONFLICT (code) DO NOTHING;

-- Seed Document Types for Other Optional Documents
INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'RESUME', 'Resume', 'Employee resume or CV', id, false, false, 30, 1, true, NOW(), NOW()
FROM document_categories WHERE code = 'OTHER_DOCS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'REFERENCE_LETTERS', 'Reference Letters', 'Professional reference letters', id, false, false, 30, 2, true, NOW(), NOW()
FROM document_categories WHERE code = 'OTHER_DOCS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name, description, category_id, is_mandatory, has_expiry, default_reminder_days, sort_order, active, created_at, updated_at)
SELECT 'TRAINING_RECORDS', 'Training Records / Certificates', 'Training completion records and certificates', id, false, true, 365, 3, true, NOW(), NOW()
FROM document_categories WHERE code = 'OTHER_DOCS'
ON CONFLICT (code) DO NOTHING;

-- Seed Cost Centers with hierarchy (parent-child relationships)
INSERT INTO cost_centers (code, name, description, active, parent_id)
VALUES ('CC001', 'Corporate', 'Corporate headquarters and shared services', true, NULL)
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC001-IT', 'Information Technology', 'IT department and infrastructure', true, id
FROM cost_centers WHERE code = 'CC001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC001-HR', 'Human Resources', 'HR and talent management', true, id
FROM cost_centers WHERE code = 'CC001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC001-FIN', 'Finance', 'Finance and accounting', true, id
FROM cost_centers WHERE code = 'CC001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
VALUES ('CC002', 'Operations', 'Operations and production', true, NULL)
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC002-MFG', 'Manufacturing', 'Manufacturing and production', true, id
FROM cost_centers WHERE code = 'CC002'
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC002-WH', 'Warehouse', 'Warehouse and logistics', true, id
FROM cost_centers WHERE code = 'CC002'
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC002-QA', 'Quality Assurance', 'Quality control and assurance', true, id
FROM cost_centers WHERE code = 'CC002'
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
VALUES ('CC003', 'Sales & Marketing', 'Revenue generation and marketing', true, NULL)
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC003-SALES', 'Sales', 'Direct and indirect sales', true, id
FROM cost_centers WHERE code = 'CC003'
ON CONFLICT (code) DO NOTHING;

INSERT INTO cost_centers (code, name, description, active, parent_id)
SELECT 'CC003-MKT', 'Marketing', 'Marketing and advertising', true, id
FROM cost_centers WHERE code = 'CC003'
ON CONFLICT (code) DO NOTHING;

-- Seed Expense Centers linked to Cost Centers
INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-IT-SW', 'Software Licenses', 'Software licenses and subscriptions', true, id
FROM cost_centers WHERE code = 'CC001-IT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-IT-HW', 'Hardware & Equipment', 'Computer hardware and IT equipment', true, id
FROM cost_centers WHERE code = 'CC001-IT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-IT-CLOUD', 'Cloud Services', 'Cloud infrastructure and hosting', true, id
FROM cost_centers WHERE code = 'CC001-IT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-HR-REC', 'Recruitment', 'Recruitment and hiring expenses', true, id
FROM cost_centers WHERE code = 'CC001-HR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-HR-TRN', 'Training & Development', 'Employee training and development', true, id
FROM cost_centers WHERE code = 'CC001-HR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-FIN-AUDIT', 'Audit & Compliance', 'Audit and compliance expenses', true, id
FROM cost_centers WHERE code = 'CC001-FIN'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-MFG-MAT', 'Raw Materials', 'Manufacturing raw materials', true, id
FROM cost_centers WHERE code = 'CC002-MFG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-WH-LOG', 'Logistics', 'Shipping and logistics expenses', true, id
FROM cost_centers WHERE code = 'CC002-WH'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-SALES-TRV', 'Sales Travel', 'Sales team travel expenses', true, id
FROM cost_centers WHERE code = 'CC003-SALES'
ON CONFLICT (code) DO NOTHING;

INSERT INTO expense_centers (code, name, description, active, cost_center_id)
SELECT 'EXP-MKT-ADV', 'Advertising', 'Advertising and promotional expenses', true, id
FROM cost_centers WHERE code = 'CC003-MKT'
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- HR Management Sample Data (5 records per module)
-- =====================================================

-- Seed Locations
INSERT INTO locations (code, name, address, city, state, country, zip_code, phone, email, location_type, active)
VALUES ('LOC001', 'Headquarters', '123 Corporate Drive', 'Atlanta', 'Georgia', 'United States', '30301', '404-555-1000', 'hq@haoerp.com', 'OFFICE', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, address, city, state, country, zip_code, phone, email, location_type, active)
VALUES ('LOC002', 'West Coast Office', '456 Pacific Blvd', 'San Francisco', 'California', 'United States', '94102', '415-555-2000', 'westcoast@haoerp.com', 'OFFICE', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, address, city, state, country, zip_code, phone, email, location_type, active)
VALUES ('LOC003', 'Manufacturing Plant', '789 Industrial Way', 'Houston', 'Texas', 'United States', '77001', '713-555-3000', 'plant@haoerp.com', 'PLANT', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, address, city, state, country, zip_code, phone, email, location_type, active)
VALUES ('LOC004', 'Distribution Center', '321 Logistics Ave', 'Chicago', 'Illinois', 'United States', '60601', '312-555-4000', 'dc@haoerp.com', 'WAREHOUSE', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name, address, city, state, country, zip_code, phone, email, location_type, active)
VALUES ('LOC005', 'Regional Office', '555 Business Park', 'New York', 'New York', 'United States', '10001', '212-555-5000', 'nyoffice@haoerp.com', 'OFFICE', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Grades
INSERT INTO grades (code, name, description, level, min_salary, max_salary, active)
VALUES ('G1', 'Entry Level', 'Entry level positions for fresh graduates', 1, 35000, 50000, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO grades (code, name, description, level, min_salary, max_salary, active)
VALUES ('G2', 'Associate', 'Associate level with 1-3 years experience', 2, 45000, 70000, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO grades (code, name, description, level, min_salary, max_salary, active)
VALUES ('G3', 'Senior', 'Senior level with 3-6 years experience', 3, 65000, 95000, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO grades (code, name, description, level, min_salary, max_salary, active)
VALUES ('G4', 'Manager', 'Management level positions', 4, 85000, 130000, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO grades (code, name, description, level, min_salary, max_salary, active)
VALUES ('G5', 'Director', 'Director and senior leadership', 5, 120000, 200000, true)
ON CONFLICT (code) DO NOTHING;

-- Seed Departments
INSERT INTO departments (code, name, description, active, location_id, cost_center_id)
SELECT 'DEPT-IT', 'Information Technology', 'IT and software development department', true, 
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       (SELECT id FROM cost_centers WHERE code = 'CC001-IT' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'DEPT-IT');

INSERT INTO departments (code, name, description, active, location_id, cost_center_id)
SELECT 'DEPT-HR', 'Human Resources', 'Human resources and talent management', true, 
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       (SELECT id FROM cost_centers WHERE code = 'CC001-HR' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'DEPT-HR');

INSERT INTO departments (code, name, description, active, location_id, cost_center_id)
SELECT 'DEPT-FIN', 'Finance', 'Finance and accounting department', true, 
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       (SELECT id FROM cost_centers WHERE code = 'CC001-FIN' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'DEPT-FIN');

INSERT INTO departments (code, name, description, active, location_id, cost_center_id)
SELECT 'DEPT-SALES', 'Sales', 'Sales and business development', true, 
       (SELECT id FROM locations WHERE code = 'LOC002' LIMIT 1),
       (SELECT id FROM cost_centers WHERE code = 'CC003-SALES' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'DEPT-SALES');

INSERT INTO departments (code, name, description, active, location_id, cost_center_id)
SELECT 'DEPT-OPS', 'Operations', 'Operations and manufacturing', true, 
       (SELECT id FROM locations WHERE code = 'LOC003' LIMIT 1),
       (SELECT id FROM cost_centers WHERE code = 'CC002' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'DEPT-OPS');

-- Seed Designations
INSERT INTO designations (code, title, description, active, grade_id)
SELECT 'DES-SE', 'Software Engineer', 'Entry level software engineer', true, id
FROM grades WHERE code = 'G1'
ON CONFLICT (code) DO NOTHING;

INSERT INTO designations (code, title, description, active, grade_id)
SELECT 'DES-SSE', 'Senior Software Engineer', 'Senior software engineer with 3+ years experience', true, id
FROM grades WHERE code = 'G3'
ON CONFLICT (code) DO NOTHING;

INSERT INTO designations (code, title, description, active, grade_id)
SELECT 'DES-HRM', 'HR Manager', 'Human resources manager', true, id
FROM grades WHERE code = 'G4'
ON CONFLICT (code) DO NOTHING;

INSERT INTO designations (code, title, description, active, grade_id)
SELECT 'DES-ACCT', 'Accountant', 'Finance and accounting professional', true, id
FROM grades WHERE code = 'G2'
ON CONFLICT (code) DO NOTHING;

INSERT INTO designations (code, title, description, active, grade_id)
SELECT 'DES-SM', 'Sales Manager', 'Sales team manager', true, id
FROM grades WHERE code = 'G4'
ON CONFLICT (code) DO NOTHING;

-- Seed Job Roles
INSERT INTO job_roles (code, title, description, active, department_id, grade_id)
SELECT 'JR-DEV', 'Software Developer', 'Develops and maintains software applications', true, 
       (SELECT id FROM departments WHERE code = 'DEPT-IT' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G2' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM job_roles WHERE code = 'JR-DEV');

INSERT INTO job_roles (code, title, description, active, department_id, grade_id)
SELECT 'JR-HRG', 'HR Generalist', 'General HR responsibilities including recruitment and employee relations', true, 
       (SELECT id FROM departments WHERE code = 'DEPT-HR' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G2' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM job_roles WHERE code = 'JR-HRG');

INSERT INTO job_roles (code, title, description, active, department_id, grade_id)
SELECT 'JR-FA', 'Financial Analyst', 'Analyzes financial data and prepares reports', true, 
       (SELECT id FROM departments WHERE code = 'DEPT-FIN' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G3' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM job_roles WHERE code = 'JR-FA');

INSERT INTO job_roles (code, title, description, active, department_id, grade_id)
SELECT 'JR-SR', 'Sales Representative', 'Handles sales and client relationships', true, 
       (SELECT id FROM departments WHERE code = 'DEPT-SALES' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G2' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM job_roles WHERE code = 'JR-SR');

INSERT INTO job_roles (code, title, description, active, department_id, grade_id)
SELECT 'JR-OM', 'Operations Manager', 'Manages daily operations and production', true, 
       (SELECT id FROM departments WHERE code = 'DEPT-OPS' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G4' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM job_roles WHERE code = 'JR-OM');

-- Seed Employees
INSERT INTO employees (employee_code, first_name, last_name, email, phone, date_of_birth, gender, joining_date, employment_type, employment_status, department_id, designation_id, location_id, grade_id, created_at, updated_at)
SELECT 'EMP001', 'John', 'Smith', 'john.smith@haoerp.com', '404-555-1001', '1985-03-15', 'Male', '2020-01-15', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-IT' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-SSE' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G3' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP001');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, date_of_birth, gender, joining_date, employment_type, employment_status, department_id, designation_id, location_id, grade_id, created_at, updated_at)
SELECT 'EMP002', 'Sarah', 'Johnson', 'sarah.johnson@haoerp.com', '404-555-1002', '1988-07-22', 'Female', '2019-06-01', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-HR' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-HRM' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G4' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP002');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, date_of_birth, gender, joining_date, employment_type, employment_status, department_id, designation_id, location_id, grade_id, created_at, updated_at)
SELECT 'EMP003', 'Michael', 'Brown', 'michael.brown@haoerp.com', '415-555-1003', '1990-11-08', 'Male', '2021-03-10', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-SALES' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-SM' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC002' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G4' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP003');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, date_of_birth, gender, joining_date, employment_type, employment_status, department_id, designation_id, location_id, grade_id, created_at, updated_at)
SELECT 'EMP004', 'Emily', 'Davis', 'emily.davis@haoerp.com', '404-555-1004', '1992-04-18', 'Female', '2022-08-20', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-FIN' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-ACCT' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G2' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP004');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, date_of_birth, gender, joining_date, employment_type, employment_status, department_id, designation_id, location_id, grade_id, created_at, updated_at)
SELECT 'EMP005', 'David', 'Wilson', 'david.wilson@haoerp.com', '713-555-1005', '1987-09-30', 'Male', '2018-11-05', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-OPS' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-SM' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC003' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G4' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP005');

-- Seed Employee Salaries
INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, pay_frequency, effective_from, is_current, created_at, updated_at)
SELECT id, 85000, 40.87, 'MONTHLY', '2020-01-15', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP001'
AND NOT EXISTS (SELECT 1 FROM employee_salaries WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP001') AND is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, pay_frequency, effective_from, is_current, created_at, updated_at)
SELECT id, 95000, 45.67, 'MONTHLY', '2019-06-01', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP002'
AND NOT EXISTS (SELECT 1 FROM employee_salaries WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP002') AND is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, pay_frequency, effective_from, is_current, created_at, updated_at)
SELECT id, 110000, 52.88, 'MONTHLY', '2021-03-10', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP003'
AND NOT EXISTS (SELECT 1 FROM employee_salaries WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP003') AND is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, pay_frequency, effective_from, is_current, created_at, updated_at)
SELECT id, 55000, 26.44, 'MONTHLY', '2022-08-20', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP004'
AND NOT EXISTS (SELECT 1 FROM employee_salaries WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP004') AND is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, pay_frequency, effective_from, is_current, created_at, updated_at)
SELECT id, 105000, 50.48, 'MONTHLY', '2018-11-05', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP005'
AND NOT EXISTS (SELECT 1 FROM employee_salaries WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP005') AND is_current = true);

-- Seed Candidates
INSERT INTO candidates (candidate_number, first_name, last_name, email, phone, gender, city, state, country, current_employer, current_designation, current_salary, expected_salary, total_experience, skills, source, status, created_at, updated_at)
VALUES ('CND-2026-00001', 'Alex', 'Thompson', 'alex.thompson@email.com', '555-100-1001', 'Male', 'Atlanta', 'Georgia', 'United States', 'TechCorp Inc', 'Software Developer', 75000, 90000, 4, 'Java, Spring Boot, Angular, SQL', 'LinkedIn', 'NEW', NOW(), NOW())
ON CONFLICT (candidate_number) DO NOTHING;

INSERT INTO candidates (candidate_number, first_name, last_name, email, phone, gender, city, state, country, current_employer, current_designation, current_salary, expected_salary, total_experience, skills, source, status, created_at, updated_at)
VALUES ('CND-2026-00002', 'Jennifer', 'Martinez', 'jennifer.martinez@email.com', '555-100-1002', 'Female', 'San Francisco', 'California', 'United States', 'DataSystems LLC', 'Data Analyst', 68000, 80000, 3, 'Python, SQL, Tableau, Power BI', 'Indeed', 'SCREENING', NOW(), NOW())
ON CONFLICT (candidate_number) DO NOTHING;

INSERT INTO candidates (candidate_number, first_name, last_name, email, phone, gender, city, state, country, current_employer, current_designation, current_salary, expected_salary, total_experience, skills, source, status, created_at, updated_at)
VALUES ('CND-2026-00003', 'Robert', 'Lee', 'robert.lee@email.com', '555-100-1003', 'Male', 'Houston', 'Texas', 'United States', 'Manufacturing Co', 'Operations Supervisor', 65000, 75000, 6, 'Operations Management, Lean Six Sigma, ERP Systems', 'Referral', 'INTERVIEW', NOW(), NOW())
ON CONFLICT (candidate_number) DO NOTHING;

INSERT INTO candidates (candidate_number, first_name, last_name, email, phone, gender, city, state, country, current_employer, current_designation, current_salary, expected_salary, total_experience, skills, source, status, created_at, updated_at)
VALUES ('CND-2026-00004', 'Amanda', 'Garcia', 'amanda.garcia@email.com', '555-100-1004', 'Female', 'Chicago', 'Illinois', 'United States', 'HR Solutions', 'HR Coordinator', 52000, 62000, 2, 'Recruiting, Onboarding, HRIS, Employee Relations', 'Company Website', 'NEW', NOW(), NOW())
ON CONFLICT (candidate_number) DO NOTHING;

INSERT INTO candidates (candidate_number, first_name, last_name, email, phone, gender, city, state, country, current_employer, current_designation, current_salary, expected_salary, total_experience, skills, source, status, created_at, updated_at)
VALUES ('CND-2026-00005', 'Chris', 'Anderson', 'chris.anderson@email.com', '555-100-1005', 'Male', 'New York', 'New York', 'United States', 'Sales Force Pro', 'Account Executive', 85000, 100000, 5, 'B2B Sales, CRM, Negotiation, Client Relations', 'LinkedIn', 'OFFER', NOW(), NOW())
ON CONFLICT (candidate_number) DO NOTHING;

-- Seed Job Requisitions
INSERT INTO job_requisitions (requisition_number, position_title, number_of_positions, employment_type, requisition_type, justification, job_description, requirements, skills, min_experience, max_experience, priority, status, department_id, job_role_id, grade_id, location_id, created_at, updated_at)
SELECT 'MRF-2026-00001', 'Senior Software Engineer', 2, 'FULL_TIME', 'NEW', 'Expanding IT team for new project', 'Develop and maintain enterprise applications', 'BS in Computer Science or related field', 'Java, Spring Boot, Angular, PostgreSQL', 3, 6, 'HIGH', 'APPROVED',
       (SELECT id FROM departments WHERE code = 'DEPT-IT' LIMIT 1),
       (SELECT id FROM job_roles WHERE code = 'JR-DEV' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G3' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM job_requisitions WHERE requisition_number = 'MRF-2026-00001');

INSERT INTO job_requisitions (requisition_number, position_title, number_of_positions, employment_type, requisition_type, justification, job_description, requirements, skills, min_experience, max_experience, priority, status, department_id, job_role_id, grade_id, location_id, created_at, updated_at)
SELECT 'MRF-2026-00002', 'HR Coordinator', 1, 'FULL_TIME', 'REPLACEMENT', 'Replacing departing employee', 'Support HR operations and employee services', 'BS in Human Resources or Business', 'HRIS, Recruiting, Employee Relations', 1, 3, 'MEDIUM', 'OPEN',
       (SELECT id FROM departments WHERE code = 'DEPT-HR' LIMIT 1),
       (SELECT id FROM job_roles WHERE code = 'JR-HRG' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G2' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM job_requisitions WHERE requisition_number = 'MRF-2026-00002');

INSERT INTO job_requisitions (requisition_number, position_title, number_of_positions, employment_type, requisition_type, justification, job_description, requirements, skills, min_experience, max_experience, priority, status, department_id, job_role_id, grade_id, location_id, created_at, updated_at)
SELECT 'MRF-2026-00003', 'Financial Analyst', 1, 'FULL_TIME', 'NEW', 'Budget analysis support for Q2', 'Analyze financial data and prepare reports', 'BS in Finance or Accounting, CPA preferred', 'Financial Modeling, Excel, SAP', 2, 5, 'HIGH', 'PENDING',
       (SELECT id FROM departments WHERE code = 'DEPT-FIN' LIMIT 1),
       (SELECT id FROM job_roles WHERE code = 'JR-FA' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G3' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM job_requisitions WHERE requisition_number = 'MRF-2026-00003');

INSERT INTO job_requisitions (requisition_number, position_title, number_of_positions, employment_type, requisition_type, justification, job_description, requirements, skills, min_experience, max_experience, priority, status, department_id, job_role_id, grade_id, location_id, created_at, updated_at)
SELECT 'MRF-2026-00004', 'Sales Representative', 3, 'FULL_TIME', 'NEW', 'Expanding West Coast sales team', 'Drive sales growth in assigned territory', 'BS in Business or related field', 'B2B Sales, CRM, Negotiation', 1, 4, 'HIGH', 'APPROVED',
       (SELECT id FROM departments WHERE code = 'DEPT-SALES' LIMIT 1),
       (SELECT id FROM job_roles WHERE code = 'JR-SR' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G2' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC002' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM job_requisitions WHERE requisition_number = 'MRF-2026-00004');

INSERT INTO job_requisitions (requisition_number, position_title, number_of_positions, employment_type, requisition_type, justification, job_description, requirements, skills, min_experience, max_experience, priority, status, department_id, job_role_id, grade_id, location_id, created_at, updated_at)
SELECT 'MRF-2026-00005', 'Operations Supervisor', 1, 'FULL_TIME', 'REPLACEMENT', 'Retirement replacement', 'Oversee daily manufacturing operations', 'BS in Operations or Engineering', 'Operations Management, Lean, ERP', 5, 10, 'MEDIUM', 'OPEN',
       (SELECT id FROM departments WHERE code = 'DEPT-OPS' LIMIT 1),
       (SELECT id FROM job_roles WHERE code = 'JR-OM' LIMIT 1),
       (SELECT id FROM grades WHERE code = 'G4' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC003' LIMIT 1),
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM job_requisitions WHERE requisition_number = 'MRF-2026-00005');

-- Seed Training Programs
INSERT INTO training_programs (program_code, name, description, category, training_type, delivery_mode, duration_hours, duration_days, objectives, max_participants, min_participants, is_mandatory, is_active, has_certification, created_at, updated_at)
VALUES ('TRN-001', 'New Employee Orientation', 'Introduction to company culture, policies, and procedures', 'ONBOARDING', 'INTERNAL', 'IN_PERSON', 8, 1, 'Familiarize new hires with company culture and expectations', 30, 5, true, true, false, NOW(), NOW())
ON CONFLICT (program_code) DO NOTHING;

INSERT INTO training_programs (program_code, name, description, category, training_type, delivery_mode, duration_hours, duration_days, objectives, max_participants, min_participants, is_mandatory, is_active, has_certification, certification_name, validity_months, created_at, updated_at)
VALUES ('TRN-002', 'Leadership Development Program', 'Comprehensive leadership skills training for managers', 'LEADERSHIP', 'INTERNAL', 'HYBRID', 40, 5, 'Develop leadership competencies and management skills', 20, 8, false, true, true, 'Leadership Excellence Certificate', 24, NOW(), NOW())
ON CONFLICT (program_code) DO NOTHING;

INSERT INTO training_programs (program_code, name, description, category, training_type, delivery_mode, duration_hours, duration_days, objectives, max_participants, min_participants, is_mandatory, is_active, has_certification, certification_name, validity_months, created_at, updated_at)
VALUES ('TRN-003', 'Workplace Safety Training', 'OSHA compliance and workplace safety protocols', 'COMPLIANCE', 'EXTERNAL', 'ONLINE', 4, 1, 'Ensure all employees understand safety protocols', 50, 10, true, true, true, 'OSHA Safety Certification', 12, NOW(), NOW())
ON CONFLICT (program_code) DO NOTHING;

INSERT INTO training_programs (program_code, name, description, category, training_type, delivery_mode, duration_hours, duration_days, objectives, max_participants, min_participants, is_mandatory, is_active, has_certification, created_at, updated_at)
VALUES ('TRN-004', 'Advanced Excel for Business', 'Advanced Excel techniques for business analysis', 'TECHNICAL', 'INTERNAL', 'ONLINE', 16, 2, 'Master advanced Excel functions and data analysis', 25, 5, false, true, false, NOW(), NOW())
ON CONFLICT (program_code) DO NOTHING;

INSERT INTO training_programs (program_code, name, description, category, training_type, delivery_mode, duration_hours, duration_days, objectives, max_participants, min_participants, is_mandatory, is_active, has_certification, certification_name, validity_months, created_at, updated_at)
VALUES ('TRN-005', 'Customer Service Excellence', 'Best practices in customer service and communication', 'SOFT_SKILLS', 'INTERNAL', 'IN_PERSON', 8, 1, 'Improve customer interaction and satisfaction skills', 30, 10, false, true, true, 'Customer Service Professional', 18, NOW(), NOW())
ON CONFLICT (program_code) DO NOTHING;

-- Seed Onboarding Plans (linked to employees)
INSERT INTO onboarding_plans (plan_number, employee_id, start_date, target_completion_date, status, total_tasks, completed_tasks, progress_percentage, welcome_message, welcome_email_sent, created_at, updated_at)
SELECT 'ONB-2026-00001', id, '2020-01-15', '2020-02-15', 'COMPLETED', 10, 10, 100, 'Welcome to the IT team!', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP001'
AND NOT EXISTS (SELECT 1 FROM onboarding_plans WHERE plan_number = 'ONB-2026-00001');

INSERT INTO onboarding_plans (plan_number, employee_id, start_date, target_completion_date, status, total_tasks, completed_tasks, progress_percentage, welcome_message, welcome_email_sent, created_at, updated_at)
SELECT 'ONB-2026-00002', id, '2019-06-01', '2019-07-01', 'COMPLETED', 12, 12, 100, 'Welcome to the HR family!', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP002'
AND NOT EXISTS (SELECT 1 FROM onboarding_plans WHERE plan_number = 'ONB-2026-00002');

INSERT INTO onboarding_plans (plan_number, employee_id, start_date, target_completion_date, status, total_tasks, completed_tasks, progress_percentage, welcome_message, welcome_email_sent, created_at, updated_at)
SELECT 'ONB-2026-00003', id, '2021-03-10', '2021-04-10', 'COMPLETED', 8, 8, 100, 'Welcome to the Sales team!', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP003'
AND NOT EXISTS (SELECT 1 FROM onboarding_plans WHERE plan_number = 'ONB-2026-00003');

INSERT INTO onboarding_plans (plan_number, employee_id, start_date, target_completion_date, status, total_tasks, completed_tasks, progress_percentage, welcome_message, welcome_email_sent, created_at, updated_at)
SELECT 'ONB-2026-00004', id, '2022-08-20', '2022-09-20', 'COMPLETED', 10, 10, 100, 'Welcome to the Finance department!', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP004'
AND NOT EXISTS (SELECT 1 FROM onboarding_plans WHERE plan_number = 'ONB-2026-00004');

INSERT INTO onboarding_plans (plan_number, employee_id, start_date, target_completion_date, status, total_tasks, completed_tasks, progress_percentage, welcome_message, welcome_email_sent, created_at, updated_at)
SELECT 'ONB-2026-00005', id, '2018-11-05', '2018-12-05', 'COMPLETED', 9, 9, 100, 'Welcome to Operations!', true, NOW(), NOW()
FROM employees WHERE employee_code = 'EMP005'
AND NOT EXISTS (SELECT 1 FROM onboarding_plans WHERE plan_number = 'ONB-2026-00005');

-- =====================================================
-- MULTI-COMPANY SETUP WITH EMPLOYEE SELF-SERVICE ACCESS
-- =====================================================

-- Create Employee Self-Service Role (Time Clock + ESS only)
INSERT INTO roles (name, description, permissions)
SELECT 'ESS_EMPLOYEE', 'Employee Self-Service - Time Clock and ESS Portal access only', 'TIME_CLOCK,ESS_PORTAL,ESS_LEAVE,ESS_ATTENDANCE,ESS_PAYSLIP,ESS_EXPENSES,ESS_DOCUMENTS'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ESS_EMPLOYEE' AND branch_id IS NULL);

-- Create 3 Companies (Branches)
INSERT INTO branches (code, name, address, city, state, country, zip_code, phone, email, currency, timezone, active, created_at, updated_at)
VALUES ('ACME-CORP', 'Acme Corporation', '100 Tech Boulevard', 'San Francisco', 'California', 'USA', '94105', '+1-415-555-0100', 'info@acmecorp.com', 'USD', 'America/Los_Angeles', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO branches (code, name, address, city, state, country, zip_code, phone, email, currency, timezone, active, created_at, updated_at)
VALUES ('GLOBAL-TECH', 'Global Tech Solutions', '250 Innovation Park', 'Austin', 'Texas', 'USA', '78701', '+1-512-555-0200', 'contact@globaltech.com', 'USD', 'America/Chicago', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO branches (code, name, address, city, state, country, zip_code, phone, email, currency, timezone, active, created_at, updated_at)
VALUES ('APEX-IND', 'Apex Industries', '500 Commerce Drive', 'Atlanta', 'Georgia', 'USA', '30301', '+1-404-555-0300', 'hr@apexind.com', 'USD', 'America/New_York', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Create Employees for Acme Corporation
INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'ACME-E001', 'John', 'Smith', 'john.smith@acmecorp.com', '+1-415-555-1001', 'MALE', '1990-05-15', '2023-01-10', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-IT' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-DEV' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'ACME-E001');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'ACME-E002', 'Sarah', 'Johnson', 'sarah.johnson@acmecorp.com', '+1-415-555-1002', 'FEMALE', '1988-08-22', '2022-06-15', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-HR' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-HRM' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'ACME-E002');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'ACME-E003', 'Michael', 'Brown', 'michael.brown@acmecorp.com', '+1-415-555-1003', 'MALE', '1992-03-10', '2023-09-01', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-SALES' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-MGR' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC001' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'ACME-E003');

-- Create Employees for Global Tech Solutions
INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'GT-E001', 'Emily', 'Davis', 'emily.davis@globaltech.com', '+1-512-555-2001', 'FEMALE', '1991-11-28', '2022-03-01', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-IT' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-DEV' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC002' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'GT-E001');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'GT-E002', 'Robert', 'Wilson', 'robert.wilson@globaltech.com', '+1-512-555-2002', 'MALE', '1985-07-14', '2021-08-20', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-FIN' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-MGR' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC002' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'GT-E002');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'GT-E003', 'Jennifer', 'Martinez', 'jennifer.martinez@globaltech.com', '+1-512-555-2003', 'FEMALE', '1993-02-05', '2024-01-15', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-OPS' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-EXEC' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC002' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'GT-E003');

-- Create Employees for Apex Industries
INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'APEX-E001', 'David', 'Anderson', 'david.anderson@apexind.com', '+1-404-555-3001', 'MALE', '1987-09-20', '2020-05-01', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-OPS' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-MGR' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC003' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'APEX-E001');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'APEX-E002', 'Lisa', 'Taylor', 'lisa.taylor@apexind.com', '+1-404-555-3002', 'FEMALE', '1994-12-08', '2023-04-10', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-HR' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-HRM' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC003' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'APEX-E002');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, gender, date_of_birth, joining_date, employment_type, employment_status, department_id, designation_id, location_id, active, created_at, updated_at)
SELECT 'APEX-E003', 'James', 'Thomas', 'james.thomas@apexind.com', '+1-404-555-3003', 'MALE', '1989-06-30', '2022-11-01', 'FULL_TIME', 'ACTIVE',
       (SELECT id FROM departments WHERE code = 'DEPT-SALES' LIMIT 1),
       (SELECT id FROM designations WHERE code = 'DES-DEV' LIMIT 1),
       (SELECT id FROM locations WHERE code = 'LOC003' LIMIT 1),
       true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'APEX-E003');

-- Create User Accounts for Acme Corporation Employees (ESS access only)
-- Password: password123 (BCrypt hash)
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'john.smith', 'john.smith@acmecorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'John', 'Smith', '+1-415-555-1001',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'ACME-CORP' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'john.smith');

INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'sarah.johnson', 'sarah.johnson@acmecorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'Sarah', 'Johnson', '+1-415-555-1002',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'ACME-CORP' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sarah.johnson');

INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'michael.brown', 'michael.brown@acmecorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'Michael', 'Brown', '+1-415-555-1003',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'ACME-CORP' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'michael.brown');

-- Create User Accounts for Global Tech Solutions Employees (ESS access only)
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'emily.davis', 'emily.davis@globaltech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'Emily', 'Davis', '+1-512-555-2001',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'GLOBAL-TECH' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'emily.davis');

INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'robert.wilson', 'robert.wilson@globaltech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'Robert', 'Wilson', '+1-512-555-2002',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'GLOBAL-TECH' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'robert.wilson');

INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'jennifer.martinez', 'jennifer.martinez@globaltech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'Jennifer', 'Martinez', '+1-512-555-2003',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'GLOBAL-TECH' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'jennifer.martinez');

-- Create User Accounts for Apex Industries Employees (ESS access only)
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'david.anderson', 'david.anderson@apexind.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'David', 'Anderson', '+1-404-555-3001',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'APEX-IND' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'david.anderson');

INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'lisa.taylor', 'lisa.taylor@apexind.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'Lisa', 'Taylor', '+1-404-555-3002',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'APEX-IND' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'lisa.taylor');

INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, branch_id, is_super_admin, active, created_at)
SELECT 'james.thomas', 'james.thomas@apexind.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.ykQRoJLJQ6VKcvZRBTxNpQWKyBqfHm', 'James', 'Thomas', '+1-404-555-3003',
       (SELECT id FROM roles WHERE name = 'ESS_EMPLOYEE' LIMIT 1),
       (SELECT id FROM branches WHERE code = 'APEX-IND' LIMIT 1),
       false, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'james.thomas');

-- Add Salary Data for Company Employees
INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 75000.00, 36.06, '2023-01-10', true, NOW(), NOW()
FROM employees WHERE employee_code = 'ACME-E001'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'ACME-E001' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 68000.00, 32.69, '2022-06-15', true, NOW(), NOW()
FROM employees WHERE employee_code = 'ACME-E002'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'ACME-E002' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 82000.00, 39.42, '2023-09-01', true, NOW(), NOW()
FROM employees WHERE employee_code = 'ACME-E003'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'ACME-E003' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 85000.00, 40.87, '2022-03-01', true, NOW(), NOW()
FROM employees WHERE employee_code = 'GT-E001'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'GT-E001' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 95000.00, 45.67, '2021-08-20', true, NOW(), NOW()
FROM employees WHERE employee_code = 'GT-E002'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'GT-E002' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 62000.00, 29.81, '2024-01-15', true, NOW(), NOW()
FROM employees WHERE employee_code = 'GT-E003'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'GT-E003' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 88000.00, 42.31, '2020-05-01', true, NOW(), NOW()
FROM employees WHERE employee_code = 'APEX-E001'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'APEX-E001' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 58000.00, 27.88, '2023-04-10', true, NOW(), NOW()
FROM employees WHERE employee_code = 'APEX-E002'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'APEX-E002' AND es.is_current = true);

INSERT INTO employee_salaries (employee_id, basic_salary, hourly_rate, effective_from, is_current, created_at, updated_at)
SELECT id, 72000.00, 34.62, '2022-11-01', true, NOW(), NOW()
FROM employees WHERE employee_code = 'APEX-E003'
AND NOT EXISTS (SELECT 1 FROM employee_salaries es JOIN employees e ON es.employee_id = e.id WHERE e.employee_code = 'APEX-E003' AND es.is_current = true);
