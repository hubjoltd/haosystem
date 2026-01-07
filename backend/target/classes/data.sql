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
