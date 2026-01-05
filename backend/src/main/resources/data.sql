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
