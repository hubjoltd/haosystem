--
-- PostgreSQL database dump
--

\restrict lCogssTcGmKhdYTdmjSwad6rXUsbaKFIPAMgKg6u53ZsBgKfdOy3o1lzZsjpLu9

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_categories (
    id bigint NOT NULL,
    account_type character varying(255) NOT NULL,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    description character varying(255),
    display_order integer,
    is_system boolean,
    name character varying(255) NOT NULL
);


--
-- Name: account_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.account_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.account_categories_id_seq OWNED BY public.account_categories.id;


--
-- Name: account_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_mappings (
    id bigint NOT NULL,
    active boolean,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    description character varying(255),
    display_order integer,
    mapping_key character varying(255) NOT NULL,
    mapping_label character varying(255),
    mapping_type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    branch_id bigint,
    credit_account_id bigint,
    debit_account_id bigint,
    CONSTRAINT account_mappings_mapping_type_check CHECK (((mapping_type)::text = ANY ((ARRAY['GENERAL'::character varying, 'PAYSLIPS'::character varying, 'PURCHASE'::character varying, 'INVENTORY'::character varying, 'MANUFACTURING'::character varying, 'OMNICHANNEL_SALES'::character varying, 'FIXED_EQUIPMENT'::character varying])::text[])))
);


--
-- Name: account_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.account_mappings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.account_mappings_id_seq OWNED BY public.account_mappings.id;


--
-- Name: account_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_transfers (
    id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    description character varying(255),
    memo character varying(255),
    status character varying(255),
    transfer_date date NOT NULL,
    transfer_number character varying(255),
    from_account_id bigint NOT NULL,
    journal_entry_id bigint,
    to_account_id bigint NOT NULL
);


--
-- Name: account_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.account_transfers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.account_transfers_id_seq OWNED BY public.account_transfers.id;


--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id bigint NOT NULL,
    approval_status character varying(20),
    approved_at timestamp(6) without time zone,
    attendance_date date NOT NULL,
    break_duration numeric(38,2),
    capture_method character varying(20),
    clock_in time(6) without time zone,
    clock_out time(6) without time zone,
    created_at timestamp(6) without time zone,
    early_departure boolean,
    early_minutes integer,
    late_arrival boolean,
    late_minutes integer,
    overtime_hours numeric(38,2),
    project_code character varying(50),
    project_name character varying(100),
    regular_hours numeric(38,2),
    remarks character varying(500),
    status character varying(20),
    updated_at timestamp(6) without time zone,
    approved_by bigint,
    employee_id bigint NOT NULL
);


--
-- Name: attendance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_records_id_seq OWNED BY public.attendance_records.id;


--
-- Name: attendance_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_rules (
    id bigint NOT NULL,
    auto_deduct_break boolean,
    break_duration_minutes numeric(38,2),
    created_at timestamp(6) without time zone,
    description character varying(500),
    enable_overtime boolean,
    grace_minutes_in integer,
    grace_minutes_out integer,
    half_day_enabled boolean,
    half_day_hours numeric(38,2),
    is_active boolean,
    is_default boolean,
    max_overtime_hours_daily numeric(38,2),
    max_overtime_hours_weekly numeric(38,2),
    overtime_multiplier numeric(38,2),
    regular_hours_per_day numeric(38,2),
    rule_name character varying(255) NOT NULL,
    standard_end_time time(6) without time zone,
    standard_start_time time(6) without time zone,
    updated_at timestamp(6) without time zone,
    weekly_hours_limit numeric(38,2)
);


--
-- Name: attendance_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_rules_id_seq OWNED BY public.attendance_rules.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action character varying(255),
    entity_id bigint,
    entity_name character varying(255),
    entity_type character varying(255),
    ip_address character varying(255),
    new_value text,
    old_value text,
    "timestamp" timestamp(6) without time zone,
    username character varying(255)
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_accounts (
    id bigint NOT NULL,
    account_name character varying(255) NOT NULL,
    account_number character varying(255),
    account_type character varying(255),
    as_of_date date,
    bank_address character varying(255),
    bank_branch character varying(255),
    bank_name character varying(255),
    contact_email character varying(255),
    contact_name character varying(255),
    contact_phone character varying(255),
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    currency_code character varying(255),
    current_balance numeric(15,2),
    description character varying(255),
    iban character varying(255),
    is_active boolean,
    is_primary boolean,
    last_reconciled_balance numeric(15,2),
    last_reconciled_date date,
    modified_by character varying(255),
    modified_date timestamp(6) without time zone,
    opening_balance numeric(15,2),
    routing_number character varying(255),
    swift_code character varying(255),
    gl_account_id bigint
);


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- Name: bank_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transactions (
    id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    bill_id bigint,
    check_number character varying(255),
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    customer_id bigint,
    description character varying(255),
    expense_id bigint,
    import_id character varying(255),
    import_source character varying(255),
    invoice_id bigint,
    is_imported boolean,
    is_reconciled boolean,
    is_transfer boolean,
    matched boolean,
    matched_transaction_id bigint,
    memo character varying(255),
    modified_by character varying(255),
    modified_date timestamp(6) without time zone,
    payee character varying(255),
    reconciliation_id bigint,
    reference character varying(255),
    rule_id bigint,
    running_balance numeric(15,2),
    status character varying(255),
    supplier_id bigint,
    transaction_date date NOT NULL,
    transaction_type character varying(255) NOT NULL,
    transfer_id bigint,
    value_date date,
    account_id bigint,
    bank_account_id bigint NOT NULL,
    journal_entry_id bigint
);


--
-- Name: bank_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bank_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_transactions_id_seq OWNED BY public.bank_transactions.id;


--
-- Name: banking_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banking_rules (
    id bigint NOT NULL,
    apply_to_all_accounts boolean,
    assign_memo character varying(255),
    assign_payee character varying(255),
    auto_confirm boolean,
    condition_field character varying(255),
    condition_logic character varying(255),
    condition_operator character varying(255),
    condition_value character varying(255),
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    is_active boolean,
    modified_by character varying(255),
    modified_date timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    priority integer,
    secondary_condition_field character varying(255),
    secondary_condition_operator character varying(255),
    secondary_condition_value character varying(255),
    times_applied integer,
    transaction_type character varying(255),
    assign_account_id bigint,
    bank_account_id bigint
);


--
-- Name: banking_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banking_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banking_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banking_rules_id_seq OWNED BY public.banking_rules.id;


--
-- Name: benefit_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.benefit_plans (
    id bigint NOT NULL,
    benefit_type character varying(50) NOT NULL,
    category character varying(50),
    contribution_type character varying(20),
    coverage_amount numeric(38,2),
    coverage_details text,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    description text,
    effective_from date,
    effective_to date,
    eligibility_rules text,
    employee_contribution numeric(38,2),
    employer_contribution numeric(38,2),
    enrollment_end_date date,
    enrollment_start_date date,
    exclusions text,
    is_active boolean,
    is_mandatory boolean,
    name character varying(200) NOT NULL,
    plan_code character varying(30) NOT NULL,
    policy_number character varying(100),
    provider character varying(200),
    terms_and_conditions text,
    updated_at timestamp(6) without time zone,
    waiting_period_days integer
);


--
-- Name: benefit_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.benefit_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: benefit_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.benefit_plans_id_seq OWNED BY public.benefit_plans.id;


--
-- Name: bill_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bill_lines (
    id bigint NOT NULL,
    amount numeric(15,2),
    billable boolean,
    cost_center_id bigint,
    description character varying(255),
    line_number integer,
    memo character varying(255),
    project_id bigint,
    quantity numeric(15,4),
    tax_amount numeric(15,2),
    tax_code character varying(255),
    tax_rate numeric(5,2),
    unit_price numeric(15,4),
    account_id bigint,
    bill_id bigint NOT NULL,
    item_id bigint
);


--
-- Name: bill_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bill_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bill_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bill_lines_id_seq OWNED BY public.bill_lines.id;


--
-- Name: bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bills (
    id bigint NOT NULL,
    amount_paid numeric(15,2),
    balance_due numeric(15,2),
    bill_date date NOT NULL,
    bill_number character varying(255),
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    currency_code character varying(255),
    discount_amount numeric(15,2),
    due_date date,
    exchange_rate numeric(10,6),
    memo character varying(255),
    modified_by character varying(255),
    modified_date timestamp(6) without time zone,
    purchase_order_id bigint,
    status character varying(255),
    subtotal numeric(15,2),
    tax_amount numeric(15,2),
    terms character varying(255),
    total_amount numeric(15,2),
    vendor_invoice_number character varying(255),
    journal_entry_id bigint,
    payable_account_id bigint,
    supplier_id bigint
);


--
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bills_id_seq OWNED BY public.bills.id;


--
-- Name: bins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bins (
    id bigint NOT NULL,
    aisle character varying(255),
    code character varying(255) NOT NULL,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    rack character varying(255),
    shelf character varying(255),
    status character varying(255) NOT NULL,
    updated_by character varying(255),
    updated_date timestamp(6) without time zone,
    zone character varying(255),
    warehouse_id bigint NOT NULL
);


--
-- Name: bins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bins_id_seq OWNED BY public.bins.id;


--
-- Name: branch_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_settings (
    id bigint NOT NULL,
    auto_generate_employee_id boolean,
    business_registration_number character varying(255),
    company_legal_name character varying(255),
    created_at timestamp(6) without time zone,
    currency_position character varying(255),
    currency_symbol character varying(255),
    default_payment_terms character varying(255),
    default_tax_rate numeric(10,2),
    display_name character varying(255),
    employee_id_next_number bigint,
    employee_id_prefix character varying(255),
    fiscal_year_start_month integer,
    invoice_due_days integer,
    invoice_footer text,
    invoice_next_number bigint,
    invoice_prefix character varying(255),
    invoice_terms text,
    letterhead text,
    number_format character varying(255),
    payroll_next_number bigint,
    payroll_prefix character varying(255),
    primary_color character varying(255),
    purchase_order_next_number bigint,
    purchase_order_prefix character varying(255),
    quotation_next_number bigint,
    quotation_prefix character varying(255),
    receipt_next_number bigint,
    receipt_prefix character varying(255),
    secondary_color character varying(255),
    show_logo_on_invoices boolean,
    show_logo_on_reports boolean,
    signature_path text,
    tax_label character varying(255),
    tax_registration_number character varying(255),
    time_format character varying(255),
    updated_at timestamp(6) without time zone,
    branch_id bigint NOT NULL
);


--
-- Name: branch_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branch_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branch_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branch_settings_id_seq OWNED BY public.branch_settings.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id bigint NOT NULL,
    active boolean,
    address character varying(255),
    city character varying(255),
    code character varying(255) NOT NULL,
    country character varying(255),
    created_at timestamp(6) without time zone,
    currency character varying(255),
    date_format character varying(255),
    email character varying(255),
    logo_path text,
    name character varying(255) NOT NULL,
    phone character varying(255),
    primary_color character varying(255),
    secondary_color character varying(255),
    slug character varying(255),
    state character varying(255),
    timezone character varying(255),
    updated_at timestamp(6) without time zone,
    website character varying(255),
    zip_code character varying(255)
);


--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: budget_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_lines (
    id bigint NOT NULL,
    annual_amount numeric(15,2),
    apr_amount numeric(15,2),
    aug_amount numeric(15,2),
    dec_amount numeric(15,2),
    feb_amount numeric(15,2),
    jan_amount numeric(15,2),
    jul_amount numeric(15,2),
    jun_amount numeric(15,2),
    mar_amount numeric(15,2),
    may_amount numeric(15,2),
    notes character varying(255),
    nov_amount numeric(15,2),
    oct_amount numeric(15,2),
    sep_amount numeric(15,2),
    account_id bigint NOT NULL,
    budget_id bigint NOT NULL
);


--
-- Name: budget_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_lines_id_seq OWNED BY public.budget_lines.id;


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id bigint NOT NULL,
    approved_by character varying(255),
    approved_date timestamp(6) without time zone,
    budget_type character varying(255),
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    description character varying(255),
    fiscal_year integer NOT NULL,
    is_active boolean,
    modified_by character varying(255),
    modified_date timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    net_amount numeric(15,2),
    status character varying(255),
    total_expense numeric(15,2),
    total_income numeric(15,2)
);


--
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budgets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidates (
    id bigint NOT NULL,
    alternate_phone character varying(20),
    available_from date,
    candidate_number character varying(30) NOT NULL,
    certifications text,
    city character varying(100),
    converted_at timestamp(6) without time zone,
    country character varying(100),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    current_address text,
    current_designation character varying(200),
    current_employer character varying(200),
    current_salary numeric(38,2),
    date_of_birth date,
    email character varying(150) NOT NULL,
    expected_salary numeric(38,2),
    first_name character varying(100) NOT NULL,
    gender character varying(20),
    graduation_year integer,
    highest_education character varying(200),
    last_name character varying(100) NOT NULL,
    linkedin_url character varying(500),
    middle_name character varying(100),
    notes text,
    notice_period character varying(30),
    overall_rating integer,
    phone character varying(20),
    portfolio_url character varying(500),
    postal_code character varying(20),
    referred_by character varying(200),
    relevant_experience integer,
    resume_text text,
    resume_url character varying(500),
    skills text,
    source character varying(50),
    stage character varying(30),
    state character varying(100),
    status character varying(30) NOT NULL,
    total_experience integer,
    university character varying(200),
    updated_at timestamp(6) without time zone,
    assigned_recruiter_id bigint,
    converted_employee_id bigint,
    job_posting_id bigint,
    requisition_id bigint
);


--
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.candidates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chart_of_accounts (
    id bigint NOT NULL,
    account_code character varying(255) NOT NULL,
    account_name character varying(255) NOT NULL,
    account_type character varying(255) NOT NULL,
    balance_type character varying(255),
    bank_account_id bigint,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    current_balance numeric(15,2),
    description character varying(255),
    display_order integer,
    is_header boolean,
    is_sub_account boolean,
    is_system boolean,
    modified_by character varying(255),
    modified_date timestamp(6) without time zone,
    opening_balance numeric(15,2),
    status character varying(255),
    tax_applicable boolean,
    category_id bigint,
    parent_id bigint
);


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chart_of_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chart_of_accounts_id_seq OWNED BY public.chart_of_accounts.id;


--
-- Name: contract_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_statuses (
    id bigint NOT NULL,
    color character varying(255),
    name character varying(255)
);


--
-- Name: contract_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contract_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contract_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contract_statuses_id_seq OWNED BY public.contract_statuses.id;


--
-- Name: contract_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_types (
    id bigint NOT NULL,
    duration integer,
    name character varying(255),
    renewable boolean
);


--
-- Name: contract_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contract_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contract_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contract_types_id_seq OWNED BY public.contract_types.id;


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id bigint NOT NULL,
    contract_number character varying(255),
    created_at date,
    description character varying(255),
    end_date date,
    payment_terms character varying(255),
    start_date date,
    status character varying(255),
    title character varying(255),
    updated_at date,
    value numeric(38,2),
    customer_id bigint
);


--
-- Name: contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contracts_id_seq OWNED BY public.contracts.id;


--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_centers (
    id bigint NOT NULL,
    active boolean,
    code character varying(255),
    description character varying(255),
    name character varying(255),
    parent_id bigint
);


--
-- Name: cost_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cost_centers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cost_centers_id_seq OWNED BY public.cost_centers.id;


--
-- Name: customer_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_groups (
    id bigint NOT NULL,
    description character varying(255),
    discount double precision,
    name character varying(255)
);


--
-- Name: customer_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_groups_id_seq OWNED BY public.customer_groups.id;


--
-- Name: customer_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_statuses (
    id bigint NOT NULL,
    color character varying(255),
    name character varying(255)
);


--
-- Name: customer_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_statuses_id_seq OWNED BY public.customer_statuses.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    address character varying(255),
    customer_group character varying(255),
    email character varying(255),
    name character varying(255),
    phone character varying(255),
    status character varying(255)
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    active boolean,
    code character varying(255),
    description character varying(255),
    name character varying(255),
    branch_id bigint,
    cost_center_id bigint,
    location_id bigint,
    parent_id bigint
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designations (
    id bigint NOT NULL,
    active boolean,
    code character varying(255),
    description character varying(255),
    title character varying(255),
    grade_id bigint
);


--
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.designations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- Name: document_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_categories (
    id bigint NOT NULL,
    active boolean,
    code character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    description text,
    name character varying(255) NOT NULL,
    sort_order integer,
    updated_at timestamp(6) without time zone
);


--
-- Name: document_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.document_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.document_categories_id_seq OWNED BY public.document_categories.id;


--
-- Name: document_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_types (
    id bigint NOT NULL,
    active boolean,
    code character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    default_reminder_days integer,
    description text,
    has_expiry boolean,
    is_mandatory boolean,
    name character varying(255) NOT NULL,
    sort_order integer,
    updated_at timestamp(6) without time zone,
    category_id bigint NOT NULL
);


--
-- Name: document_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.document_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.document_types_id_seq OWNED BY public.document_types.id;


--
-- Name: employee_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_assets (
    id bigint NOT NULL,
    approval_status character varying(255),
    approved_at timestamp(6) without time zone,
    approved_by character varying(255),
    asset_code character varying(255),
    asset_name character varying(255),
    asset_type character varying(255),
    condition character varying(255),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    description text,
    issue_date date,
    manufacturer character varying(255),
    model character varying(255),
    remarks text,
    return_date date,
    serial_number character varying(255),
    status character varying(255),
    updated_at timestamp(6) without time zone,
    employee_id bigint NOT NULL
);


--
-- Name: employee_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_assets_id_seq OWNED BY public.employee_assets.id;


--
-- Name: employee_bank_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_bank_details (
    id bigint NOT NULL,
    account_holder_name character varying(255),
    account_number character varying(255),
    account_type character varying(255),
    active boolean,
    bank_name character varying(255),
    branch_name character varying(255),
    created_at timestamp(6) without time zone,
    ifsc_code character varying(255),
    is_primary boolean,
    payment_method character varying(255),
    routing_number character varying(255),
    swift_code character varying(255),
    updated_at timestamp(6) without time zone,
    employee_id bigint NOT NULL
);


--
-- Name: employee_bank_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_bank_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_bank_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_bank_details_id_seq OWNED BY public.employee_bank_details.id;


--
-- Name: employee_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_benefits (
    id bigint NOT NULL,
    annual_employee_contribution numeric(38,2),
    annual_employer_contribution numeric(38,2),
    benefit_type character varying(50) NOT NULL,
    contribution_percentage numeric(38,2),
    contribution_type character varying(20),
    coverage_level character varying(50),
    created_at timestamp(6) without time zone,
    effective_date date,
    employee_contribution numeric(38,2),
    employer_contribution numeric(38,2),
    employer_match_limit numeric(38,2),
    employer_match_percentage numeric(38,2),
    enrollment_date date,
    is_active boolean,
    is_pre_tax boolean,
    notes character varying(500),
    plan_name character varying(100),
    termination_date date,
    updated_at timestamp(6) without time zone,
    employee_id bigint NOT NULL
);


--
-- Name: employee_benefits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_benefits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_benefits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_benefits_id_seq OWNED BY public.employee_benefits.id;


--
-- Name: employee_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_documents (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    document_number character varying(255),
    expiry_date date,
    file_name character varying(255),
    file_size bigint,
    file_url character varying(255),
    issue_date date,
    mime_type character varying(255),
    remarks text,
    reminder_days integer,
    reminder_sent boolean,
    updated_at timestamp(6) without time zone,
    uploaded_at timestamp(6) without time zone,
    uploaded_by character varying(255),
    verification_remarks text,
    verification_status character varying(255) NOT NULL,
    verified_at timestamp(6) without time zone,
    verified_by character varying(255),
    document_type_id bigint NOT NULL,
    employee_id bigint NOT NULL
);


--
-- Name: employee_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_documents_id_seq OWNED BY public.employee_documents.id;


--
-- Name: employee_education; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_education (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    grade character varying(255),
    institution character varying(255),
    percentage character varying(255),
    qualification character varying(255),
    remarks text,
    specialization character varying(255),
    university character varying(255),
    updated_at timestamp(6) without time zone,
    year_of_passing character varying(255),
    employee_id bigint NOT NULL
);


--
-- Name: employee_education_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_education_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_education_id_seq OWNED BY public.employee_education.id;


--
-- Name: employee_experience; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_experience (
    id bigint NOT NULL,
    company_name character varying(255),
    created_at timestamp(6) without time zone,
    designation character varying(255),
    from_date date,
    last_salary character varying(255),
    location character varying(255),
    reason_for_leaving character varying(255),
    reference_contact character varying(255),
    responsibilities text,
    to_date date,
    updated_at timestamp(6) without time zone,
    employee_id bigint NOT NULL
);


--
-- Name: employee_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_experience_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_experience_id_seq OWNED BY public.employee_experience.id;


--
-- Name: employee_salaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_salaries (
    id bigint NOT NULL,
    basic_salary numeric(38,2),
    change_reason character varying(255),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    ctc_annual numeric(38,2),
    da_amount numeric(38,2),
    effective_from date,
    effective_to date,
    esi_deduction numeric(38,2),
    gross_salary numeric(38,2),
    hourly_rate numeric(38,2),
    hra_amount numeric(38,2),
    is_current boolean,
    medical_allowance numeric(38,2),
    net_salary numeric(38,2),
    other_allowances numeric(38,2),
    other_deductions numeric(38,2),
    pay_frequency character varying(255),
    pf_deduction numeric(38,2),
    professional_tax numeric(38,2),
    remarks text,
    special_allowance numeric(38,2),
    ta_amount numeric(38,2),
    tds_deduction numeric(38,2),
    updated_at timestamp(6) without time zone,
    employee_id bigint NOT NULL
);


--
-- Name: employee_salaries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_salaries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_salaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_salaries_id_seq OWNED BY public.employee_salaries.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id bigint NOT NULL,
    aadhar_number character varying(255),
    active boolean,
    alternate_phone character varying(255),
    blood_group character varying(255),
    citizenship character varying(255),
    confirmation_date date,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    current_address text,
    current_city character varying(255),
    current_country character varying(255),
    current_state character varying(255),
    current_zip_code character varying(255),
    date_of_birth date,
    email character varying(255),
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(255),
    emergency_contact_relation character varying(255),
    employee_code character varying(255),
    employment_status character varying(255),
    employment_type character varying(255),
    first_name character varying(255),
    gender character varying(255),
    hourly_rate numeric(38,2),
    i9expiry_date date,
    i9status character varying(255),
    joining_date date,
    last_name character varying(255),
    last_working_date date,
    marital_status character varying(255),
    middle_name character varying(255),
    national_id character varying(255),
    nationality character varying(255),
    notice_period_days integer,
    pan_number character varying(255),
    passport_expiry date,
    passport_number character varying(255),
    permanent_address text,
    permanent_city character varying(255),
    permanent_country character varying(255),
    permanent_state character varying(255),
    permanent_zip_code character varying(255),
    phone character varying(255),
    probation_end_date date,
    probation_months integer,
    profile_photo character varying(255),
    resignation_date date,
    salary numeric(38,2),
    ssn character varying(255),
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    visa_expiry date,
    visa_type character varying(255),
    work_authorization_type character varying(255),
    branch_id bigint,
    cost_center_id bigint,
    department_id bigint,
    designation_id bigint,
    expense_center_id bigint,
    grade_id bigint,
    job_role_id bigint,
    location_id bigint,
    project_id bigint,
    reporting_manager_id bigint
);


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_categories (
    id bigint NOT NULL,
    account_code character varying(50),
    active boolean,
    code character varying(20) NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(500),
    display_order integer,
    expense_type character varying(50),
    max_amount numeric(38,2),
    name character varying(100) NOT NULL,
    requires_approval boolean,
    requires_receipt boolean,
    updated_at timestamp(6) without time zone,
    parent_id bigint
);


--
-- Name: expense_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_categories_id_seq OWNED BY public.expense_categories.id;


--
-- Name: expense_centers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_centers (
    id bigint NOT NULL,
    active boolean,
    code character varying(255),
    description character varying(255),
    name character varying(255),
    cost_center_id bigint
);


--
-- Name: expense_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_centers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_centers_id_seq OWNED BY public.expense_centers.id;


--
-- Name: expense_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_items (
    id bigint NOT NULL,
    amount numeric(38,2) NOT NULL,
    amount_in_base_currency numeric(38,2),
    approval_notes text,
    approved boolean,
    approved_amount numeric(38,2),
    billable boolean,
    client_code character varying(50),
    created_at timestamp(6) without time zone,
    currency character varying(3),
    description character varying(200) NOT NULL,
    exchange_rate numeric(38,2),
    expense_date date,
    notes text,
    payment_method character varying(20),
    quantity integer,
    receipt_attached boolean,
    receipt_number character varying(100),
    receipt_url character varying(500),
    unit_price numeric(38,2),
    updated_at timestamp(6) without time zone,
    vendor character varying(100),
    category_id bigint NOT NULL,
    expense_request_id bigint NOT NULL
);


--
-- Name: expense_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_items_id_seq OWNED BY public.expense_items.id;


--
-- Name: expense_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_requests (
    id bigint NOT NULL,
    accounting_reference character varying(100),
    approved_amount numeric(38,2) NOT NULL,
    approved_at timestamp(6) without time zone,
    approver_remarks text,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    description text,
    expense_date date,
    payee_name character varying(200),
    period_from date,
    period_to date,
    posted_at timestamp(6) without time zone,
    posted_to_accounts boolean,
    project_code character varying(50),
    receipt_number character varying(100),
    receipt_url text,
    reimbursed_at timestamp(6) without time zone,
    reimbursement_required boolean,
    reimbursement_status character varying(20),
    rejected_at timestamp(6) without time zone,
    rejection_reason text,
    request_number character varying(30) NOT NULL,
    status character varying(20) NOT NULL,
    submitted_at timestamp(6) without time zone,
    title character varying(200) NOT NULL,
    total_amount numeric(38,2) NOT NULL,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    approver_id bigint,
    category_id bigint,
    cost_center_id bigint,
    employee_id bigint NOT NULL,
    payroll_record_id bigint
);


--
-- Name: expense_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_requests_id_seq OWNED BY public.expense_requests.id;


--
-- Name: final_settlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.final_settlements (
    id bigint NOT NULL,
    advance_recovery numeric(38,2),
    allowances_due numeric(38,2),
    approved_at timestamp(6) without time zone,
    approved_by character varying(255),
    asset_recovery numeric(38,2),
    basic_salary_due numeric(38,2),
    bonus_due numeric(38,2),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    gratuity_amount numeric(38,2),
    last_working_day date,
    leave_balance_days integer,
    leave_encashment numeric(38,2),
    loan_recovery numeric(38,2),
    net_payable numeric(38,2),
    notice_pay_recovery numeric(38,2),
    other_deductions numeric(38,2),
    other_earnings numeric(38,2),
    processed_at timestamp(6) without time zone,
    processed_by character varying(255),
    remarks text,
    resignation_date date,
    separation_type character varying(255),
    settlement_number character varying(255),
    status character varying(255),
    tax_deduction numeric(38,2),
    total_deductions numeric(38,2),
    total_earnings numeric(38,2),
    updated_at timestamp(6) without time zone,
    employee_id bigint NOT NULL
);


--
-- Name: final_settlements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.final_settlements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: final_settlements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.final_settlements_id_seq OWNED BY public.final_settlements.id;


--
-- Name: finance_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_settings (
    id bigint NOT NULL,
    bank_account_number character varying(255),
    bank_name character varying(255),
    bank_routing_number character varying(255),
    fiscal_year_start character varying(255),
    invoice_prefix character varying(255),
    next_invoice_number integer,
    payment_terms_default character varying(255),
    tax_id character varying(255),
    tax_rate numeric(38,2)
);


--
-- Name: finance_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_settings_id_seq OWNED BY public.finance_settings.id;


--
-- Name: fiscal_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiscal_periods (
    id bigint NOT NULL,
    closed_by character varying(255),
    closed_date timestamp(6) without time zone,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    end_date date NOT NULL,
    fiscal_year integer NOT NULL,
    is_closed boolean,
    is_current boolean,
    name character varying(255) NOT NULL,
    period_number integer,
    start_date date NOT NULL
);


--
-- Name: fiscal_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fiscal_periods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fiscal_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fiscal_periods_id_seq OWNED BY public.fiscal_periods.id;


--
-- Name: general_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.general_settings (
    id bigint NOT NULL,
    company_address character varying(255),
    company_email character varying(255),
    company_name character varying(255),
    company_phone character varying(255),
    company_website character varying(255),
    currency character varying(255),
    date_format character varying(255),
    logo_path character varying(255),
    timezone character varying(255),
    valuation_method character varying(255)
);


--
-- Name: general_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.general_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: general_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.general_settings_id_seq OWNED BY public.general_settings.id;


--
-- Name: goods_issue_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_issue_lines (
    id bigint NOT NULL,
    line_total numeric(38,2),
    quantity integer,
    unit_price numeric(38,2),
    bin_id bigint,
    goods_issue_id bigint,
    item_id bigint
);


--
-- Name: goods_issue_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_issue_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_issue_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_issue_lines_id_seq OWNED BY public.goods_issue_lines.id;


--
-- Name: goods_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_issues (
    id bigint NOT NULL,
    created_at date,
    issue_date date,
    issue_number character varying(255),
    reference_number character varying(255),
    remarks character varying(255),
    status character varying(255),
    total_value numeric(38,2),
    customer_id bigint,
    warehouse_id bigint
);


--
-- Name: goods_issues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_issues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_issues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_issues_id_seq OWNED BY public.goods_issues.id;


--
-- Name: goods_receipt_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipt_lines (
    id bigint NOT NULL,
    line_total numeric(38,2),
    quantity integer,
    unit_price numeric(38,2),
    bin_id bigint,
    goods_receipt_id bigint,
    item_id bigint
);


--
-- Name: goods_receipt_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_receipt_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipt_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_receipt_lines_id_seq OWNED BY public.goods_receipt_lines.id;


--
-- Name: goods_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipts (
    id bigint NOT NULL,
    created_at date,
    grn_number character varying(255),
    po_number character varying(255),
    receipt_date date,
    receipt_type character varying(255),
    reference_number character varying(255),
    remarks character varying(255),
    status character varying(255),
    total_value numeric(38,2),
    supplier_id bigint,
    warehouse_id bigint
);


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_receipts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_receipts_id_seq OWNED BY public.goods_receipts.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id bigint NOT NULL,
    active boolean,
    code character varying(255),
    description character varying(255),
    level integer,
    max_salary numeric(38,2),
    min_salary numeric(38,2),
    name character varying(255)
);


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.holidays (
    id bigint NOT NULL,
    applicable_departments character varying(100),
    applicable_locations character varying(100),
    created_at timestamp(6) without time zone,
    day_of_week character varying(20),
    description character varying(500),
    holiday_date date NOT NULL,
    holiday_type character varying(20),
    is_active boolean,
    is_optional boolean,
    is_paid boolean,
    name character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    year integer NOT NULL
);


--
-- Name: holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.holidays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: holidays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.holidays_id_seq OWNED BY public.holidays.id;


--
-- Name: hr_letters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hr_letters (
    id bigint NOT NULL,
    approved_at timestamp(6) without time zone,
    content text,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    document_url character varying(500),
    effective_date date,
    expiry_date date,
    generated_at timestamp(6) without time zone,
    issue_date date,
    letter_number character varying(30) NOT NULL,
    letter_type character varying(50) NOT NULL,
    notes text,
    sent_at timestamp(6) without time zone,
    sent_to_employee boolean,
    signature_required boolean,
    signed boolean,
    signed_at timestamp(6) without time zone,
    signed_document_url character varying(500),
    status character varying(30) NOT NULL,
    subject character varying(200),
    updated_at timestamp(6) without time zone,
    approved_by_id bigint,
    employee_id bigint NOT NULL,
    generated_by_id bigint
);


--
-- Name: hr_letters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hr_letters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hr_letters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hr_letters_id_seq OWNED BY public.hr_letters.id;


--
-- Name: integration_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_configs (
    id bigint NOT NULL,
    access_token character varying(255),
    active boolean,
    api_key character varying(255),
    api_secret character varying(255),
    api_url character varying(255),
    client_id character varying(255),
    client_secret character varying(255),
    company_id character varying(100),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    description character varying(500),
    environment character varying(50),
    integration_type character varying(50) NOT NULL,
    last_sync_at timestamp(6) without time zone,
    last_sync_message text,
    last_sync_status character varying(50),
    name character varying(100) NOT NULL,
    password character varying(255),
    refresh_token character varying(255),
    sms_account_sid character varying(50),
    sms_auth_token character varying(100),
    sms_from_number character varying(20),
    sms_provider character varying(100),
    smtp_host character varying(100),
    smtp_port integer,
    smtp_security character varying(50),
    sync_enabled boolean,
    sync_frequency character varying(50),
    token_expires_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    username character varying(255),
    webhook_secret character varying(255),
    webhook_url character varying(255)
);


--
-- Name: integration_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integration_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: integration_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integration_configs_id_seq OWNED BY public.integration_configs.id;


--
-- Name: integration_sync_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_sync_logs (
    id bigint NOT NULL,
    completed_at timestamp(6) without time zone,
    error_details text,
    records_failed integer,
    records_processed integer,
    records_successful integer,
    started_at timestamp(6) without time zone,
    status character varying(20) NOT NULL,
    sync_details text,
    sync_type character varying(50) NOT NULL,
    triggered_by character varying(255),
    integration_id bigint NOT NULL
);


--
-- Name: integration_sync_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integration_sync_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: integration_sync_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integration_sync_logs_id_seq OWNED BY public.integration_sync_logs.id;


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interviews (
    id bigint NOT NULL,
    agenda text,
    candidate_notified boolean,
    communication_rating integer,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    culture_fit_rating integer,
    end_time time(6) without time zone,
    feedback text,
    feedback_submitted_at timestamp(6) without time zone,
    interview_date date,
    interview_mode character varying(30),
    interview_type character varying(100) NOT NULL,
    interviewer_notes text,
    interviewer_notified boolean,
    location character varying(500),
    meeting_link character varying(500),
    overall_rating integer,
    problem_solving_rating integer,
    recommendation character varying(30),
    round_name character varying(100),
    round_number integer,
    start_time time(6) without time zone,
    status character varying(30) NOT NULL,
    strengths text,
    technical_rating integer,
    updated_at timestamp(6) without time zone,
    weaknesses text,
    candidate_id bigint NOT NULL,
    interviewer_id bigint
);


--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: inventory_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_ledger (
    id bigint NOT NULL,
    balance_quantity integer,
    quantity_in integer,
    quantity_out integer,
    reference_number character varying(255),
    remarks character varying(255),
    total_value numeric(38,2),
    transaction_date timestamp(6) without time zone,
    transaction_type character varying(255),
    unit_value numeric(38,2),
    bin_id bigint,
    item_id bigint,
    warehouse_id bigint
);


--
-- Name: inventory_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_ledger_id_seq OWNED BY public.inventory_ledger.id;


--
-- Name: item_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.item_groups (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    description character varying(255),
    name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    updated_by character varying(255),
    updated_date timestamp(6) without time zone
);


--
-- Name: item_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.item_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: item_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.item_groups_id_seq OWNED BY public.item_groups.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    current_stock integer,
    description character varying(1000),
    name character varying(255) NOT NULL,
    reorder_level integer,
    status character varying(255) NOT NULL,
    taxable boolean NOT NULL,
    unit_cost numeric(38,2),
    updated_by character varying(255),
    updated_date timestamp(6) without time zone,
    group_id bigint NOT NULL,
    supplier_id bigint,
    uom_id bigint NOT NULL
);


--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: job_postings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_postings (
    id bigint NOT NULL,
    application_count integer,
    application_url character varying(500),
    benefits text,
    close_date date,
    closed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    description text,
    external_job_boards text,
    is_external boolean,
    is_internal boolean,
    open_date date,
    posting_number character varying(30) NOT NULL,
    posting_type character varying(20),
    published_at timestamp(6) without time zone,
    requirements text,
    status character varying(30),
    title character varying(200) NOT NULL,
    updated_at timestamp(6) without time zone,
    view_count integer,
    requisition_id bigint NOT NULL
);


--
-- Name: job_postings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_postings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_postings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_postings_id_seq OWNED BY public.job_postings.id;


--
-- Name: job_requisitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_requisitions (
    id bigint NOT NULL,
    approved_at timestamp(6) without time zone,
    approver_remarks text,
    budgeted_salary_max numeric(38,2),
    budgeted_salary_min numeric(38,2),
    closed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    education_requirement character varying(100),
    employment_type character varying(50),
    filled_positions integer,
    job_description text,
    justification text,
    max_experience integer,
    min_experience integer,
    number_of_positions integer,
    position_title character varying(200) NOT NULL,
    priority character varying(20),
    rejected_at timestamp(6) without time zone,
    rejection_reason text,
    requirements text,
    requisition_number character varying(30) NOT NULL,
    requisition_type character varying(50),
    skills text,
    status character varying(30) NOT NULL,
    submitted_at timestamp(6) without time zone,
    target_join_date date,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    approved_by_id bigint,
    department_id bigint,
    grade_id bigint,
    job_role_id bigint,
    location_id bigint,
    reporting_to_id bigint,
    requested_by_id bigint
);


--
-- Name: job_requisitions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_requisitions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_requisitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_requisitions_id_seq OWNED BY public.job_requisitions.id;


--
-- Name: job_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_roles (
    id bigint NOT NULL,
    active boolean,
    code character varying(255),
    description character varying(255),
    title character varying(255),
    department_id bigint,
    grade_id bigint
);


--
-- Name: job_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_roles_id_seq OWNED BY public.job_roles.id;


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id bigint NOT NULL,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    description character varying(255),
    entry_date date NOT NULL,
    entry_number character varying(255),
    is_adjusting boolean,
    is_closing boolean,
    is_reversing boolean,
    modified_by character varying(255),
    modified_date timestamp(6) without time zone,
    posted_by character varying(255),
    posted_date timestamp(6) without time zone,
    reference_id bigint,
    reference_number character varying(255),
    reference_type character varying(255),
    reversed_entry_id bigint,
    status character varying(255),
    total_credit numeric(15,2),
    total_debit numeric(15,2),
    fiscal_period_id bigint
);


--
-- Name: journal_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.journal_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: journal_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.journal_entries_id_seq OWNED BY public.journal_entries.id;


--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_lines (
    id bigint NOT NULL,
    cost_center_id bigint,
    created_date timestamp(6) without time zone,
    credit_amount numeric(15,2),
    customer_id bigint,
    debit_amount numeric(15,2),
    description character varying(255),
    employee_id bigint,
    line_number integer,
    memo character varying(255),
    project_id bigint,
    reconciled boolean,
    reconciliation_id bigint,
    supplier_id bigint,
    tax_amount numeric(15,2),
    tax_code character varying(255),
    account_id bigint NOT NULL,
    journal_entry_id bigint NOT NULL
);


--
-- Name: journal_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.journal_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: journal_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.journal_lines_id_seq OWNED BY public.journal_lines.id;


--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_balances (
    id bigint NOT NULL,
    carry_forward numeric(38,2),
    created_at timestamp(6) without time zone,
    credited numeric(38,2),
    encashed numeric(38,2),
    lapsed numeric(38,2),
    last_accrual_date timestamp(6) without time zone,
    opening_balance numeric(38,2),
    pending numeric(38,2),
    updated_at timestamp(6) without time zone,
    used numeric(38,2),
    year integer NOT NULL,
    employee_id bigint NOT NULL,
    leave_type_id bigint NOT NULL
);


--
-- Name: leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_balances_id_seq OWNED BY public.leave_balances.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_requests (
    id bigint NOT NULL,
    approved_at timestamp(6) without time zone,
    approver_remarks character varying(500),
    attachment_url character varying(255),
    created_at timestamp(6) without time zone,
    day_type character varying(20),
    emergency_contact character varying(100),
    end_date date NOT NULL,
    end_time time(6) without time zone,
    hr_approval_status character varying(20),
    hr_approved_at timestamp(6) without time zone,
    hr_remarks character varying(500),
    is_hourly_leave boolean,
    manager_approval_status character varying(20),
    manager_approved_at timestamp(6) without time zone,
    manager_remarks character varying(500),
    notify_manager boolean,
    reason character varying(1000),
    start_date date NOT NULL,
    start_time time(6) without time zone,
    status character varying(20),
    total_days numeric(38,2),
    total_hours numeric(38,2),
    updated_at timestamp(6) without time zone,
    approved_by bigint,
    employee_id bigint NOT NULL,
    hr_approved_by bigint,
    leave_type_id bigint NOT NULL,
    manager_approved_by bigint
);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_types (
    id bigint NOT NULL,
    accrual_rate numeric(38,2),
    accrual_type character varying(20),
    allow_hourly_leave boolean,
    annual_entitlement numeric(38,2),
    applicable_gender character varying(50),
    carry_forward_allowed boolean,
    code character varying(255) NOT NULL,
    color_code character varying(255),
    created_at timestamp(6) without time zone,
    description character varying(500),
    document_required boolean,
    encashment_allowed boolean,
    encashment_rate numeric(38,2),
    is_active boolean,
    is_paid boolean,
    max_carry_forward numeric(38,2),
    max_consecutive_days integer,
    min_notice_days integer,
    name character varying(255) NOT NULL,
    requires_approval boolean,
    time_unit character varying(20),
    updated_at timestamp(6) without time zone
);


--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: loan_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_applications (
    id bigint NOT NULL,
    actual_disbursement_date date,
    application_number character varying(30) NOT NULL,
    approved_amount numeric(38,2),
    approved_at timestamp(6) without time zone,
    approved_tenure_months integer,
    approver_remarks text,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    deduct_from_payroll boolean,
    emi_amount numeric(38,2),
    fully_repaid boolean,
    interest_rate numeric(38,2),
    interest_type character varying(30),
    last_emi_date date,
    loan_type character varying(50) NOT NULL,
    next_emi_date date,
    notes text,
    outstanding_balance numeric(38,2),
    paid_installments integer,
    purpose text,
    rejected_at timestamp(6) without time zone,
    rejection_reason text,
    remaining_installments integer,
    repaid_at timestamp(6) without time zone,
    requested_amount numeric(38,2) NOT NULL,
    requested_disbursement_date date,
    requested_tenure_months integer,
    status character varying(30) NOT NULL,
    submitted_at timestamp(6) without time zone,
    total_interest numeric(38,2),
    total_repayable numeric(38,2),
    updated_at timestamp(6) without time zone,
    approved_by_id bigint,
    employee_id bigint NOT NULL
);


--
-- Name: loan_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_applications_id_seq OWNED BY public.loan_applications.id;


--
-- Name: loan_repayments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_repayments (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    deducted_from_payroll boolean,
    due_date date,
    emi_amount numeric(38,2),
    installment_number integer,
    interest_amount numeric(38,2),
    notes text,
    outstanding_after numeric(38,2),
    paid_amount numeric(38,2),
    paid_date date,
    payment_mode character varying(50),
    payment_reference character varying(100),
    penalty_amount numeric(38,2),
    principal_amount numeric(38,2),
    status character varying(30) NOT NULL,
    updated_at timestamp(6) without time zone,
    loan_id bigint NOT NULL,
    payroll_record_id bigint
);


--
-- Name: loan_repayments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_repayments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_repayments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_repayments_id_seq OWNED BY public.loan_repayments.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id bigint NOT NULL,
    active boolean,
    address character varying(255),
    city character varying(255),
    code character varying(255),
    country character varying(255),
    email character varying(255),
    location_type character varying(255),
    name character varying(255),
    phone character varying(255),
    state character varying(255),
    zip_code character varying(255)
);


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: offer_letters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offer_letters (
    id bigint NOT NULL,
    accepted_at timestamp(6) without time zone,
    approved_at timestamp(6) without time zone,
    benefits text,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    decline_reason text,
    declined_at timestamp(6) without time zone,
    employment_type character varying(50),
    letter_content text,
    offer_number character varying(30) NOT NULL,
    offered_salary numeric(38,2),
    position_title character varying(200) NOT NULL,
    proposed_join_date date,
    salary_breakdown text,
    sent_at timestamp(6) without time zone,
    signed_document_url character varying(500),
    signing_bonus numeric(38,2),
    status character varying(30) NOT NULL,
    terms_and_conditions text,
    updated_at timestamp(6) without time zone,
    valid_until date,
    approved_by_id bigint,
    candidate_id bigint NOT NULL,
    department_id bigint,
    grade_id bigint,
    location_id bigint,
    reporting_to_id bigint,
    requisition_id bigint
);


--
-- Name: offer_letters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offer_letters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offer_letters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offer_letters_id_seq OWNED BY public.offer_letters.id;


--
-- Name: onboarding_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_plans (
    id bigint NOT NULL,
    actual_completion_date date,
    completed_tasks integer,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    notes text,
    plan_number character varying(30) NOT NULL,
    progress_percentage integer,
    start_date date,
    status character varying(30) NOT NULL,
    target_completion_date date,
    total_tasks integer,
    updated_at timestamp(6) without time zone,
    welcome_email_sent boolean,
    welcome_email_sent_at timestamp(6) without time zone,
    welcome_message text,
    buddy_id bigint,
    employee_id bigint NOT NULL,
    hr_coordinator_id bigint,
    manager_id bigint
);


--
-- Name: onboarding_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onboarding_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: onboarding_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_plans_id_seq OWNED BY public.onboarding_plans.id;


--
-- Name: onboarding_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_tasks (
    id bigint NOT NULL,
    assignee_role character varying(30),
    attachment_url character varying(500),
    category character varying(50),
    completed_at timestamp(6) without time zone,
    completion_notes text,
    created_at timestamp(6) without time zone,
    description text,
    due_date date,
    is_mandatory boolean,
    requires_signature boolean,
    signature_obtained boolean,
    signed_at timestamp(6) without time zone,
    sort_order integer,
    status character varying(30) NOT NULL,
    task_name character varying(200) NOT NULL,
    updated_at timestamp(6) without time zone,
    assigned_to_id bigint,
    completed_by_id bigint,
    onboarding_plan_id bigint NOT NULL
);


--
-- Name: onboarding_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onboarding_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: onboarding_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onboarding_tasks_id_seq OWNED BY public.onboarding_tasks.id;


--
-- Name: overtime_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.overtime_rules (
    id bigint NOT NULL,
    code character varying(20) NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(300),
    is_active boolean,
    max_overtime_hours numeric(38,2),
    max_overtime_period character varying(20),
    min_hours_threshold numeric(38,2),
    multiplier numeric(38,2),
    name character varying(100) NOT NULL,
    priority integer,
    requires_approval boolean,
    rule_type character varying(30) NOT NULL,
    threshold_type character varying(20),
    updated_at timestamp(6) without time zone
);


--
-- Name: overtime_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.overtime_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: overtime_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.overtime_rules_id_seq OWNED BY public.overtime_rules.id;


--
-- Name: pay_frequencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pay_frequencies (
    id bigint NOT NULL,
    code character varying(20) NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(200),
    is_active boolean,
    is_default boolean,
    name character varying(50) NOT NULL,
    pay_day_of_month integer,
    pay_day_of_week integer,
    periods_per_year integer,
    second_pay_day_of_month integer,
    updated_at timestamp(6) without time zone
);


--
-- Name: pay_frequencies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pay_frequencies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pay_frequencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pay_frequencies_id_seq OWNED BY public.pay_frequencies.id;


--
-- Name: payroll_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_records (
    id bigint NOT NULL,
    annual_salary numeric(38,2),
    base_pay numeric(38,2),
    bonuses numeric(38,2),
    cost_center_code character varying(50),
    created_at timestamp(6) without time zone,
    dental_insurance numeric(38,2),
    disability_tax numeric(38,2),
    employee_type character varying(20),
    employer401k_match numeric(38,2),
    employer_health_contribution numeric(38,2),
    employer_medicare numeric(38,2),
    employer_social_security numeric(38,2),
    federal_tax numeric(38,2),
    garnishments numeric(38,2),
    gross_pay numeric(38,2),
    health_insurance numeric(38,2),
    hourly_rate numeric(38,2),
    hsa_contribution numeric(38,2),
    loan_deductions numeric(38,2),
    local_tax numeric(38,2),
    medicare_tax numeric(38,2),
    net_pay numeric(38,2),
    other_post_tax_deductions numeric(38,2),
    other_pre_tax_deductions numeric(38,2),
    overtime_hours numeric(38,2),
    overtime_pay numeric(38,2),
    post_tax_deductions numeric(38,2),
    pre_tax_deductions numeric(38,2),
    project_code character varying(50),
    regular_hours numeric(38,2),
    reimbursements numeric(38,2),
    remarks character varying(500),
    retirement401k numeric(38,2),
    social_security_tax numeric(38,2),
    state_tax numeric(38,2),
    status character varying(20) NOT NULL,
    taxable_income numeric(38,2),
    total_deductions numeric(38,2),
    total_employer_contributions numeric(38,2),
    total_taxes numeric(38,2),
    updated_at timestamp(6) without time zone,
    vision_insurance numeric(38,2),
    employee_id bigint NOT NULL,
    payroll_run_id bigint NOT NULL,
    timesheet_id bigint
);


--
-- Name: payroll_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payroll_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payroll_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payroll_records_id_seq OWNED BY public.payroll_records.id;


--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_runs (
    id bigint NOT NULL,
    approved_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    description character varying(100),
    is_posted_to_accounts boolean,
    pay_date date NOT NULL,
    payroll_run_number character varying(30) NOT NULL,
    period_end_date date NOT NULL,
    period_start_date date NOT NULL,
    posted_at timestamp(6) without time zone,
    processed_at timestamp(6) without time zone,
    remarks character varying(500),
    status character varying(20) NOT NULL,
    total_deductions numeric(38,2),
    total_employees integer,
    total_employer_contributions numeric(38,2),
    total_gross_pay numeric(38,2),
    total_net_pay numeric(38,2),
    total_taxes numeric(38,2),
    updated_at timestamp(6) without time zone,
    approved_by bigint,
    created_by bigint,
    pay_frequency_id bigint,
    processed_by bigint
);


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payroll_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payroll_runs_id_seq OWNED BY public.payroll_runs.id;


--
-- Name: pr_fulfillment_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr_fulfillment_items (
    id bigint NOT NULL,
    amount double precision,
    fulfill_qty double precision,
    fulfilled_qty double precision,
    item_code character varying(255),
    item_description character varying(255),
    item_id bigint,
    item_name character varying(255),
    pending_qty double precision,
    pr_item_id bigint,
    rate double precision,
    requested_qty double precision,
    uom character varying(255),
    pr_fulfillment_id bigint
);


--
-- Name: pr_fulfillment_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_fulfillment_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_fulfillment_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_fulfillment_items_id_seq OWNED BY public.pr_fulfillment_items.id;


--
-- Name: pr_fulfillments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr_fulfillments (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    expected_delivery_date date,
    fulfillment_date date,
    fulfillment_type character varying(255),
    payment_terms character varying(255),
    performed_by character varying(255),
    performed_by_id bigint,
    pr_id bigint,
    pr_number character varying(255),
    reference_number character varying(255),
    remarks text,
    source_location character varying(255),
    supplier_id bigint,
    supplier_name character varying(255),
    target_location character varying(255),
    total_amount double precision,
    warehouse_id bigint,
    warehouse_name character varying(255)
);


--
-- Name: pr_fulfillments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_fulfillments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_fulfillments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_fulfillments_id_seq OWNED BY public.pr_fulfillments.id;


--
-- Name: pr_material_transfer_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr_material_transfer_items (
    id bigint NOT NULL,
    item_code character varying(255),
    item_id bigint,
    item_name character varying(255),
    pr_item_id bigint,
    remarks character varying(255),
    requested_quantity double precision,
    transferred_quantity double precision,
    uom character varying(255),
    material_transfer_id bigint
);


--
-- Name: pr_material_transfer_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_material_transfer_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_material_transfer_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_material_transfer_items_id_seq OWNED BY public.pr_material_transfer_items.id;


--
-- Name: pr_material_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr_material_transfers (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    from_project character varying(255),
    pr_number character varying(255),
    remarks text,
    status character varying(255),
    supplier_name character varying(255),
    transfer_date date,
    transfer_number character varying(255),
    updated_at timestamp(6) without time zone,
    purchase_requisition_id bigint,
    supplier_id bigint
);


--
-- Name: pr_material_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_material_transfers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_material_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_material_transfers_id_seq OWNED BY public.pr_material_transfers.id;


--
-- Name: pr_stock_fulfillment_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr_stock_fulfillment_items (
    id bigint NOT NULL,
    fulfilled_quantity double precision,
    item_code character varying(255),
    item_id bigint,
    item_name character varying(255),
    pr_item_id bigint,
    remarks character varying(255),
    requested_quantity double precision,
    uom character varying(255),
    stock_fulfillment_id bigint
);


--
-- Name: pr_stock_fulfillment_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_stock_fulfillment_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_stock_fulfillment_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_stock_fulfillment_items_id_seq OWNED BY public.pr_stock_fulfillment_items.id;


--
-- Name: pr_stock_fulfillments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pr_stock_fulfillments (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    from_warehouse_name character varying(255),
    fulfillment_date date,
    fulfillment_number character varying(255),
    pr_number character varying(255),
    remarks text,
    status character varying(255),
    supplier_name character varying(255),
    updated_at timestamp(6) without time zone,
    from_warehouse_id bigint,
    purchase_requisition_id bigint,
    supplier_id bigint
);


--
-- Name: pr_stock_fulfillments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pr_stock_fulfillments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pr_stock_fulfillments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pr_stock_fulfillments_id_seq OWNED BY public.pr_stock_fulfillments.id;


--
-- Name: prefix_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prefix_settings (
    id bigint NOT NULL,
    adjustment_next_number integer,
    adjustment_prefix character varying(255),
    bin_next_number integer,
    bin_prefix character varying(255),
    employee_next_number integer,
    employee_prefix character varying(255),
    grn_next_number integer,
    grn_prefix character varying(255),
    group_next_number integer,
    group_prefix character varying(255),
    issue_next_number integer,
    issue_prefix character varying(255),
    item_next_number integer,
    item_prefix character varying(255),
    po_next_number integer,
    po_prefix character varying(255),
    pr_next_number integer,
    pr_prefix character varying(255),
    supplier_next_number integer,
    supplier_prefix character varying(255),
    transfer_next_number integer,
    transfer_prefix character varying(255),
    unit_next_number integer,
    unit_prefix character varying(255),
    warehouse_next_number integer,
    warehouse_prefix character varying(255)
);


--
-- Name: prefix_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prefix_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prefix_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prefix_settings_id_seq OWNED BY public.prefix_settings.id;


--
-- Name: project_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_members (
    id bigint NOT NULL,
    added_at timestamp(6) without time zone,
    hourly_rate numeric(38,2),
    role character varying(100),
    employee_id bigint NOT NULL,
    project_id bigint NOT NULL
);


--
-- Name: project_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_members_id_seq OWNED BY public.project_members.id;


--
-- Name: project_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_milestones (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(1000),
    due_date date,
    name character varying(200) NOT NULL,
    status character varying(30),
    project_id bigint NOT NULL
);


--
-- Name: project_milestones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_milestones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_milestones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_milestones_id_seq OWNED BY public.project_milestones.id;


--
-- Name: project_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_tasks (
    id bigint NOT NULL,
    billable boolean,
    created_at timestamp(6) without time zone,
    description character varying(1000),
    due_date date,
    estimated_hours numeric(38,2),
    logged_hours numeric(38,2),
    name character varying(200) NOT NULL,
    priority character varying(20),
    start_date date,
    status character varying(30),
    updated_at timestamp(6) without time zone,
    visible_to_client boolean,
    assignee_id bigint,
    project_id bigint NOT NULL
);


--
-- Name: project_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_tasks_id_seq OWNED BY public.project_tasks.id;


--
-- Name: project_time_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_time_entries (
    id bigint NOT NULL,
    approved_at timestamp(6) without time zone,
    billable boolean,
    billable_rate numeric(38,2),
    created_at timestamp(6) without time zone,
    entry_date date NOT NULL,
    entry_type character varying(20),
    hours_worked numeric(38,2),
    is_present boolean,
    project_code character varying(255) NOT NULL,
    project_name character varying(255) NOT NULL,
    remarks character varying(500),
    status character varying(20),
    task_description character varying(500),
    updated_at timestamp(6) without time zone,
    approved_by bigint,
    employee_id bigint NOT NULL
);


--
-- Name: project_time_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_time_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_time_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_time_entries_id_seq OWNED BY public.project_time_entries.id;


--
-- Name: project_timesheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_timesheets (
    id bigint NOT NULL,
    approved_at timestamp(6) without time zone,
    approver_remarks character varying(500),
    billable_hours numeric(38,2),
    created_at timestamp(6) without time zone,
    non_billable_hours numeric(38,2),
    overtime_hours numeric(38,2),
    period_end_date date NOT NULL,
    period_start_date date NOT NULL,
    project_code character varying(50),
    project_name character varying(100),
    project_timesheet_number character varying(30) NOT NULL,
    regular_hours numeric(38,2),
    remarks character varying(500),
    status character varying(20),
    total_hours numeric(38,2),
    updated_at timestamp(6) without time zone,
    approved_by bigint,
    employee_id bigint NOT NULL
);


--
-- Name: project_timesheets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_timesheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_timesheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_timesheets_id_seq OWNED BY public.project_timesheets.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id bigint NOT NULL,
    allow_customer_comment_tasks boolean,
    allow_customer_upload_files boolean,
    allow_customer_view_discussions boolean,
    allow_customer_view_files boolean,
    allow_customer_view_project boolean,
    allow_customer_view_task_comments boolean,
    allow_customer_view_tasks boolean,
    allow_customer_view_timesheets boolean,
    archived boolean,
    billable_tasks boolean,
    billing_type character varying(30),
    calculated_progress character varying(20),
    completion_date date,
    created_at timestamp(6) without time zone,
    created_by character varying(100),
    currency character varying(10),
    deadline date,
    deleted boolean,
    description character varying(2000),
    end_date date,
    estimated_cost numeric(38,2),
    estimated_hours numeric(38,2),
    fixed_rate_amount numeric(38,2),
    hourly_rate numeric(38,2),
    invoice_project boolean,
    invoice_tasks boolean,
    invoice_timesheets boolean,
    location_address character varying(500),
    location_latitude double precision,
    location_longitude double precision,
    location_radius_meters integer,
    location_tracking_enabled boolean,
    name character varying(200) NOT NULL,
    progress integer,
    project_code character varying(30) NOT NULL,
    project_cost numeric(38,2),
    start_date date,
    status character varying(30),
    tags character varying(500),
    total_billable_time numeric(38,2),
    total_logged_time numeric(38,2),
    updated_at timestamp(6) without time zone,
    customer_id bigint,
    project_manager_id bigint
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: purchase_invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_invoice_items (
    id bigint NOT NULL,
    amount numeric(15,2),
    description character varying(255),
    hsn_code character varying(255),
    item_code character varying(255),
    item_name character varying(255),
    quantity integer,
    rate numeric(15,2),
    remarks text,
    tax_amount numeric(15,2),
    tax_rate numeric(5,2),
    uom character varying(255),
    invoice_id bigint
);


--
-- Name: purchase_invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_invoice_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_invoice_items_id_seq OWNED BY public.purchase_invoice_items.id;


--
-- Name: purchase_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_invoices (
    id bigint NOT NULL,
    bill_to_address character varying(255),
    bill_to_gstin character varying(255),
    bill_to_name character varying(255),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    discount numeric(15,2),
    due_date date,
    invoice_date date,
    invoice_number character varying(255),
    payment_terms character varying(255),
    po_id bigint,
    po_number character varying(255),
    remarks text,
    ship_to_address character varying(255),
    ship_to_name character varying(255),
    status character varying(255),
    subtotal numeric(15,2),
    supplier_address character varying(255),
    supplier_contact character varying(255),
    supplier_email character varying(255),
    supplier_gstin character varying(255),
    supplier_id bigint,
    supplier_name character varying(255),
    tax_amount numeric(15,2),
    total_amount numeric(15,2),
    updated_at timestamp(6) without time zone
);


--
-- Name: purchase_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_invoices_id_seq OWNED BY public.purchase_invoices.id;


--
-- Name: purchase_requisition_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_requisition_items (
    id bigint NOT NULL,
    fulfilled_quantity double precision,
    item_code character varying(255),
    item_description character varying(255),
    item_id bigint,
    item_name character varying(255),
    quantity double precision,
    remarks character varying(255),
    status character varying(255),
    uom character varying(255),
    purchase_requisition_id bigint
);


--
-- Name: purchase_requisition_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_requisition_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_requisition_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_requisition_items_id_seq OWNED BY public.purchase_requisition_items.id;


--
-- Name: purchase_requisitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_requisitions (
    id bigint NOT NULL,
    approved_at timestamp(6) without time zone,
    approved_by character varying(255),
    approved_by_id bigint,
    comments_count integer,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    created_by_id bigint,
    delivery_location character varying(255),
    department character varying(255),
    pr_date date,
    pr_number character varying(255),
    priority character varying(255),
    purpose character varying(255),
    rejected_at timestamp(6) without time zone,
    rejected_by character varying(255),
    rejected_by_id bigint,
    rejection_reason text,
    remarks text,
    requested_by character varying(255),
    requested_by_id bigint,
    required_date date,
    status character varying(255),
    submitted_at timestamp(6) without time zone,
    submitted_by character varying(255),
    submitted_by_id bigint,
    updated_at timestamp(6) without time zone
);


--
-- Name: purchase_requisitions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_requisitions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_requisitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_requisitions_id_seq OWNED BY public.purchase_requisitions.id;


--
-- Name: reconciliations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reconciliations (
    id bigint NOT NULL,
    beginning_balance numeric(15,2),
    cleared_balance numeric(15,2),
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    difference numeric(15,2),
    is_reconciled boolean,
    notes character varying(255),
    reconciled_by character varying(255),
    reconciled_date timestamp(6) without time zone,
    statement_date date NOT NULL,
    statement_ending_balance numeric(15,2),
    status character varying(255),
    bank_account_id bigint NOT NULL
);


--
-- Name: reconciliations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reconciliations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reconciliations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reconciliations_id_seq OWNED BY public.reconciliations.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    description character varying(255),
    is_system_role boolean,
    name character varying(255) NOT NULL,
    permissions text,
    branch_id bigint
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: salary_bands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salary_bands (
    id bigint NOT NULL,
    band_code character varying(30) NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    currency character varying(10),
    da_percentage numeric(38,2),
    effective_from date,
    effective_to date,
    hra_percentage numeric(38,2),
    is_active boolean,
    max_salary numeric(38,2),
    medical_allowance_percentage numeric(38,2),
    mid_salary numeric(38,2),
    min_salary numeric(38,2),
    name character varying(100) NOT NULL,
    notes text,
    pay_frequency character varying(30),
    special_allowance_percentage numeric(38,2),
    ta_percentage numeric(38,2),
    updated_at timestamp(6) without time zone,
    grade_id bigint,
    job_role_id bigint
);


--
-- Name: salary_bands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salary_bands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salary_bands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salary_bands_id_seq OWNED BY public.salary_bands.id;


--
-- Name: salary_heads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salary_heads (
    id bigint NOT NULL,
    affects_gross_pay boolean,
    applicable_to character varying(50),
    based_on_head character varying(50),
    calculation_type character varying(20),
    category character varying(30) NOT NULL,
    code character varying(20) NOT NULL,
    created_at timestamp(6) without time zone,
    default_value numeric(38,2),
    description character varying(500),
    display_order integer,
    head_type character varying(20) NOT NULL,
    is_active boolean,
    is_statutory boolean,
    is_taxable boolean,
    name character varying(100) NOT NULL,
    percentage_of numeric(38,2),
    updated_at timestamp(6) without time zone
);


--
-- Name: salary_heads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salary_heads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salary_heads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salary_heads_id_seq OWNED BY public.salary_heads.id;


--
-- Name: statutory_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.statutory_rules (
    id bigint NOT NULL,
    applicable_year integer,
    code character varying(20) NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(500),
    effective_from date,
    effective_to date,
    employee_rate numeric(38,2),
    employer_rate numeric(38,2),
    frequency character varying(20),
    is_active boolean,
    is_mandatory boolean,
    max_contribution numeric(38,2),
    min_wage numeric(38,2),
    name character varying(100) NOT NULL,
    rule_type character varying(50) NOT NULL,
    state_code character varying(50),
    updated_at timestamp(6) without time zone,
    wage_base numeric(38,2)
);


--
-- Name: statutory_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.statutory_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: statutory_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.statutory_rules_id_seq OWNED BY public.statutory_rules.id;


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_adjustments (
    id bigint NOT NULL,
    adjustment_date date,
    adjustment_number character varying(255),
    adjustment_type character varying(255),
    created_at date,
    quantity_adjusted integer,
    quantity_after integer,
    quantity_before integer,
    reason character varying(255),
    status character varying(255),
    value_difference numeric(38,2),
    bin_id bigint,
    item_id bigint,
    warehouse_id bigint
);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_adjustments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_adjustments_id_seq OWNED BY public.stock_adjustments.id;


--
-- Name: stock_transfer_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transfer_lines (
    id bigint NOT NULL,
    quantity integer,
    from_bin_id bigint,
    item_id bigint,
    stock_transfer_id bigint,
    to_bin_id bigint
);


--
-- Name: stock_transfer_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_transfer_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_transfer_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_transfer_lines_id_seq OWNED BY public.stock_transfer_lines.id;


--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transfers (
    id bigint NOT NULL,
    created_at date,
    remarks character varying(255),
    status character varying(255),
    transfer_date date,
    transfer_number character varying(255),
    from_warehouse_id bigint,
    to_warehouse_id bigint
);


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_transfers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_transfers_id_seq OWNED BY public.stock_transfers.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id bigint NOT NULL,
    address character varying(255),
    code character varying(255),
    contact_person character varying(255),
    email character varying(255),
    name character varying(255),
    payment_terms character varying(255),
    phone character varying(255),
    status character varying(255)
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: tax_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_rules (
    id bigint NOT NULL,
    calculation_basis character varying(20),
    code character varying(20) NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(300),
    effective_from date,
    effective_to date,
    employee_contribution boolean,
    employer_contribution boolean,
    employer_rate numeric(38,2),
    fixed_amount numeric(38,2),
    is_active boolean,
    max_income numeric(38,2),
    min_income numeric(38,2),
    name character varying(100) NOT NULL,
    rate numeric(38,2),
    state_code character varying(50),
    tax_type character varying(30) NOT NULL,
    tax_year integer,
    updated_at timestamp(6) without time zone
);


--
-- Name: tax_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tax_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tax_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tax_rules_id_seq OWNED BY public.tax_rules.id;


--
-- Name: timesheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timesheets (
    id bigint NOT NULL,
    absent_days integer,
    approved_at timestamp(6) without time zone,
    approver_remarks character varying(500),
    created_at timestamp(6) without time zone,
    holiday_days integer,
    leave_days integer,
    period_end_date date NOT NULL,
    period_start_date date NOT NULL,
    present_days integer,
    remarks character varying(500),
    status character varying(20) NOT NULL,
    timesheet_number character varying(30) NOT NULL,
    total_hours numeric(38,2),
    total_overtime_hours numeric(38,2),
    total_regular_hours numeric(38,2),
    updated_at timestamp(6) without time zone,
    working_days integer,
    approved_by bigint,
    employee_id bigint NOT NULL,
    pay_frequency_id bigint
);


--
-- Name: timesheets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.timesheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: timesheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.timesheets_id_seq OWNED BY public.timesheets.id;


--
-- Name: training_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_enrollments (
    id bigint NOT NULL,
    attendance_marked_at timestamp(6) without time zone,
    attendance_percentage integer,
    attended boolean,
    certificate_expiry_date date,
    certificate_issued boolean,
    certificate_issued_date date,
    certificate_number character varying(100),
    certificate_url character varying(500),
    completed boolean,
    completed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    enrolled_date date,
    feedback text,
    grade character varying(20),
    notes text,
    rating integer,
    score integer,
    status character varying(30) NOT NULL,
    updated_at timestamp(6) without time zone,
    employee_id bigint NOT NULL,
    session_id bigint NOT NULL
);


--
-- Name: training_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.training_enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.training_enrollments_id_seq OWNED BY public.training_enrollments.id;


--
-- Name: training_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_programs (
    id bigint NOT NULL,
    category character varying(50),
    certification_name character varying(200),
    cost_per_participant numeric(38,2),
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    curriculum text,
    delivery_mode character varying(50),
    description text,
    duration_days integer,
    duration_hours integer,
    external_provider character varying(200),
    has_certification boolean,
    is_active boolean,
    is_mandatory boolean,
    max_participants integer,
    min_participants integer,
    name character varying(200) NOT NULL,
    objectives text,
    prerequisites text,
    program_code character varying(30) NOT NULL,
    target_audience text,
    training_type character varying(50),
    updated_at timestamp(6) without time zone,
    validity_months integer
);


--
-- Name: training_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.training_programs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.training_programs_id_seq OWNED BY public.training_programs.id;


--
-- Name: training_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_sessions (
    id bigint NOT NULL,
    attended_count integer,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    end_date date,
    end_time time(6) without time zone,
    enrolled_count integer,
    external_trainer character varying(200),
    materials text,
    max_participants integer,
    notes text,
    online_link character varying(500),
    session_code character varying(30) NOT NULL,
    session_name character varying(200),
    start_date date,
    start_time time(6) without time zone,
    status character varying(30) NOT NULL,
    total_cost numeric(38,2),
    updated_at timestamp(6) without time zone,
    venue character varying(500),
    program_id bigint NOT NULL,
    trainer_id bigint
);


--
-- Name: training_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.training_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.training_sessions_id_seq OWNED BY public.training_sessions.id;


--
-- Name: units_of_measure; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units_of_measure (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    conversion_factor numeric(18,6),
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    symbol character varying(255),
    updated_by character varying(255),
    updated_date timestamp(6) without time zone,
    base_uom_id bigint
);


--
-- Name: units_of_measure_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.units_of_measure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units_of_measure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.units_of_measure_id_seq OWNED BY public.units_of_measure.id;


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notifications (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    message text,
    is_read boolean NOT NULL,
    read_at timestamp(6) without time zone,
    recipient_username character varying(255) NOT NULL,
    reference_id bigint,
    reference_type character varying(255),
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL
);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_notifications_id_seq OWNED BY public.user_notifications.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    active boolean,
    created_at timestamp(6) without time zone,
    email character varying(255),
    first_name character varying(255),
    is_super_admin boolean,
    last_login timestamp(6) without time zone,
    last_name character varying(255),
    password character varying(255),
    phone character varying(255),
    username character varying(255),
    branch_id bigint,
    role_id bigint
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: valuation_cost_layers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valuation_cost_layers (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    quantity_in integer,
    quantity_remaining integer,
    reference_number character varying(255),
    reference_type character varying(255),
    total_value numeric(38,2),
    unit_cost numeric(38,2),
    item_id bigint,
    warehouse_id bigint
);


--
-- Name: valuation_cost_layers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.valuation_cost_layers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: valuation_cost_layers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.valuation_cost_layers_id_seq OWNED BY public.valuation_cost_layers.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouses (
    id bigint NOT NULL,
    address character varying(500),
    code character varying(255) NOT NULL,
    created_by character varying(255),
    created_date timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    updated_by character varying(255),
    updated_date timestamp(6) without time zone,
    default_bin_id bigint
);


--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warehouses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: account_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_categories ALTER COLUMN id SET DEFAULT nextval('public.account_categories_id_seq'::regclass);


--
-- Name: account_mappings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_mappings ALTER COLUMN id SET DEFAULT nextval('public.account_mappings_id_seq'::regclass);


--
-- Name: account_transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_transfers ALTER COLUMN id SET DEFAULT nextval('public.account_transfers_id_seq'::regclass);


--
-- Name: attendance_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records ALTER COLUMN id SET DEFAULT nextval('public.attendance_records_id_seq'::regclass);


--
-- Name: attendance_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_rules ALTER COLUMN id SET DEFAULT nextval('public.attendance_rules_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- Name: bank_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions ALTER COLUMN id SET DEFAULT nextval('public.bank_transactions_id_seq'::regclass);


--
-- Name: banking_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banking_rules ALTER COLUMN id SET DEFAULT nextval('public.banking_rules_id_seq'::regclass);


--
-- Name: benefit_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_plans ALTER COLUMN id SET DEFAULT nextval('public.benefit_plans_id_seq'::regclass);


--
-- Name: bill_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_lines ALTER COLUMN id SET DEFAULT nextval('public.bill_lines_id_seq'::regclass);


--
-- Name: bills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills ALTER COLUMN id SET DEFAULT nextval('public.bills_id_seq'::regclass);


--
-- Name: bins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bins ALTER COLUMN id SET DEFAULT nextval('public.bins_id_seq'::regclass);


--
-- Name: branch_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_settings ALTER COLUMN id SET DEFAULT nextval('public.branch_settings_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: budget_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines ALTER COLUMN id SET DEFAULT nextval('public.budget_lines_id_seq'::regclass);


--
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- Name: chart_of_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts ALTER COLUMN id SET DEFAULT nextval('public.chart_of_accounts_id_seq'::regclass);


--
-- Name: contract_statuses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_statuses ALTER COLUMN id SET DEFAULT nextval('public.contract_statuses_id_seq'::regclass);


--
-- Name: contract_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_types ALTER COLUMN id SET DEFAULT nextval('public.contract_types_id_seq'::regclass);


--
-- Name: contracts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts ALTER COLUMN id SET DEFAULT nextval('public.contracts_id_seq'::regclass);


--
-- Name: cost_centers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers ALTER COLUMN id SET DEFAULT nextval('public.cost_centers_id_seq'::regclass);


--
-- Name: customer_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_groups ALTER COLUMN id SET DEFAULT nextval('public.customer_groups_id_seq'::regclass);


--
-- Name: customer_statuses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_statuses ALTER COLUMN id SET DEFAULT nextval('public.customer_statuses_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- Name: document_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories ALTER COLUMN id SET DEFAULT nextval('public.document_categories_id_seq'::regclass);


--
-- Name: document_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_types ALTER COLUMN id SET DEFAULT nextval('public.document_types_id_seq'::regclass);


--
-- Name: employee_assets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_assets ALTER COLUMN id SET DEFAULT nextval('public.employee_assets_id_seq'::regclass);


--
-- Name: employee_bank_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_bank_details ALTER COLUMN id SET DEFAULT nextval('public.employee_bank_details_id_seq'::regclass);


--
-- Name: employee_benefits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_benefits ALTER COLUMN id SET DEFAULT nextval('public.employee_benefits_id_seq'::regclass);


--
-- Name: employee_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents ALTER COLUMN id SET DEFAULT nextval('public.employee_documents_id_seq'::regclass);


--
-- Name: employee_education id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_education ALTER COLUMN id SET DEFAULT nextval('public.employee_education_id_seq'::regclass);


--
-- Name: employee_experience id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_experience ALTER COLUMN id SET DEFAULT nextval('public.employee_experience_id_seq'::regclass);


--
-- Name: employee_salaries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_salaries ALTER COLUMN id SET DEFAULT nextval('public.employee_salaries_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: expense_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories ALTER COLUMN id SET DEFAULT nextval('public.expense_categories_id_seq'::regclass);


--
-- Name: expense_centers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_centers ALTER COLUMN id SET DEFAULT nextval('public.expense_centers_id_seq'::regclass);


--
-- Name: expense_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_items ALTER COLUMN id SET DEFAULT nextval('public.expense_items_id_seq'::regclass);


--
-- Name: expense_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests ALTER COLUMN id SET DEFAULT nextval('public.expense_requests_id_seq'::regclass);


--
-- Name: final_settlements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_settlements ALTER COLUMN id SET DEFAULT nextval('public.final_settlements_id_seq'::regclass);


--
-- Name: finance_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_settings ALTER COLUMN id SET DEFAULT nextval('public.finance_settings_id_seq'::regclass);


--
-- Name: fiscal_periods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiscal_periods ALTER COLUMN id SET DEFAULT nextval('public.fiscal_periods_id_seq'::regclass);


--
-- Name: general_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.general_settings ALTER COLUMN id SET DEFAULT nextval('public.general_settings_id_seq'::regclass);


--
-- Name: goods_issue_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_lines ALTER COLUMN id SET DEFAULT nextval('public.goods_issue_lines_id_seq'::regclass);


--
-- Name: goods_issues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues ALTER COLUMN id SET DEFAULT nextval('public.goods_issues_id_seq'::regclass);


--
-- Name: goods_receipt_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_lines ALTER COLUMN id SET DEFAULT nextval('public.goods_receipt_lines_id_seq'::regclass);


--
-- Name: goods_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts ALTER COLUMN id SET DEFAULT nextval('public.goods_receipts_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: holidays id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays ALTER COLUMN id SET DEFAULT nextval('public.holidays_id_seq'::regclass);


--
-- Name: hr_letters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_letters ALTER COLUMN id SET DEFAULT nextval('public.hr_letters_id_seq'::regclass);


--
-- Name: integration_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_configs ALTER COLUMN id SET DEFAULT nextval('public.integration_configs_id_seq'::regclass);


--
-- Name: integration_sync_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_sync_logs ALTER COLUMN id SET DEFAULT nextval('public.integration_sync_logs_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: inventory_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ledger ALTER COLUMN id SET DEFAULT nextval('public.inventory_ledger_id_seq'::regclass);


--
-- Name: item_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_groups ALTER COLUMN id SET DEFAULT nextval('public.item_groups_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: job_postings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings ALTER COLUMN id SET DEFAULT nextval('public.job_postings_id_seq'::regclass);


--
-- Name: job_requisitions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions ALTER COLUMN id SET DEFAULT nextval('public.job_requisitions_id_seq'::regclass);


--
-- Name: job_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles ALTER COLUMN id SET DEFAULT nextval('public.job_roles_id_seq'::regclass);


--
-- Name: journal_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_id_seq'::regclass);


--
-- Name: journal_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines ALTER COLUMN id SET DEFAULT nextval('public.journal_lines_id_seq'::regclass);


--
-- Name: leave_balances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances ALTER COLUMN id SET DEFAULT nextval('public.leave_balances_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: loan_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications ALTER COLUMN id SET DEFAULT nextval('public.loan_applications_id_seq'::regclass);


--
-- Name: loan_repayments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayments ALTER COLUMN id SET DEFAULT nextval('public.loan_repayments_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: offer_letters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters ALTER COLUMN id SET DEFAULT nextval('public.offer_letters_id_seq'::regclass);


--
-- Name: onboarding_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_plans ALTER COLUMN id SET DEFAULT nextval('public.onboarding_plans_id_seq'::regclass);


--
-- Name: onboarding_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_tasks ALTER COLUMN id SET DEFAULT nextval('public.onboarding_tasks_id_seq'::regclass);


--
-- Name: overtime_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_rules ALTER COLUMN id SET DEFAULT nextval('public.overtime_rules_id_seq'::regclass);


--
-- Name: pay_frequencies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_frequencies ALTER COLUMN id SET DEFAULT nextval('public.pay_frequencies_id_seq'::regclass);


--
-- Name: payroll_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records ALTER COLUMN id SET DEFAULT nextval('public.payroll_records_id_seq'::regclass);


--
-- Name: payroll_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs ALTER COLUMN id SET DEFAULT nextval('public.payroll_runs_id_seq'::regclass);


--
-- Name: pr_fulfillment_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_fulfillment_items ALTER COLUMN id SET DEFAULT nextval('public.pr_fulfillment_items_id_seq'::regclass);


--
-- Name: pr_fulfillments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_fulfillments ALTER COLUMN id SET DEFAULT nextval('public.pr_fulfillments_id_seq'::regclass);


--
-- Name: pr_material_transfer_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfer_items ALTER COLUMN id SET DEFAULT nextval('public.pr_material_transfer_items_id_seq'::regclass);


--
-- Name: pr_material_transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfers ALTER COLUMN id SET DEFAULT nextval('public.pr_material_transfers_id_seq'::regclass);


--
-- Name: pr_stock_fulfillment_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillment_items ALTER COLUMN id SET DEFAULT nextval('public.pr_stock_fulfillment_items_id_seq'::regclass);


--
-- Name: pr_stock_fulfillments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillments ALTER COLUMN id SET DEFAULT nextval('public.pr_stock_fulfillments_id_seq'::regclass);


--
-- Name: prefix_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prefix_settings ALTER COLUMN id SET DEFAULT nextval('public.prefix_settings_id_seq'::regclass);


--
-- Name: project_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members ALTER COLUMN id SET DEFAULT nextval('public.project_members_id_seq'::regclass);


--
-- Name: project_milestones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones ALTER COLUMN id SET DEFAULT nextval('public.project_milestones_id_seq'::regclass);


--
-- Name: project_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks ALTER COLUMN id SET DEFAULT nextval('public.project_tasks_id_seq'::regclass);


--
-- Name: project_time_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_time_entries ALTER COLUMN id SET DEFAULT nextval('public.project_time_entries_id_seq'::regclass);


--
-- Name: project_timesheets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_timesheets ALTER COLUMN id SET DEFAULT nextval('public.project_timesheets_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: purchase_invoice_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_invoice_items_id_seq'::regclass);


--
-- Name: purchase_invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoices ALTER COLUMN id SET DEFAULT nextval('public.purchase_invoices_id_seq'::regclass);


--
-- Name: purchase_requisition_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requisition_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_requisition_items_id_seq'::regclass);


--
-- Name: purchase_requisitions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requisitions ALTER COLUMN id SET DEFAULT nextval('public.purchase_requisitions_id_seq'::regclass);


--
-- Name: reconciliations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reconciliations ALTER COLUMN id SET DEFAULT nextval('public.reconciliations_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: salary_bands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_bands ALTER COLUMN id SET DEFAULT nextval('public.salary_bands_id_seq'::regclass);


--
-- Name: salary_heads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_heads ALTER COLUMN id SET DEFAULT nextval('public.salary_heads_id_seq'::regclass);


--
-- Name: statutory_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statutory_rules ALTER COLUMN id SET DEFAULT nextval('public.statutory_rules_id_seq'::regclass);


--
-- Name: stock_adjustments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments ALTER COLUMN id SET DEFAULT nextval('public.stock_adjustments_id_seq'::regclass);


--
-- Name: stock_transfer_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_lines ALTER COLUMN id SET DEFAULT nextval('public.stock_transfer_lines_id_seq'::regclass);


--
-- Name: stock_transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers ALTER COLUMN id SET DEFAULT nextval('public.stock_transfers_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: tax_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rules ALTER COLUMN id SET DEFAULT nextval('public.tax_rules_id_seq'::regclass);


--
-- Name: timesheets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timesheets ALTER COLUMN id SET DEFAULT nextval('public.timesheets_id_seq'::regclass);


--
-- Name: training_enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_enrollments ALTER COLUMN id SET DEFAULT nextval('public.training_enrollments_id_seq'::regclass);


--
-- Name: training_programs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_programs ALTER COLUMN id SET DEFAULT nextval('public.training_programs_id_seq'::regclass);


--
-- Name: training_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions ALTER COLUMN id SET DEFAULT nextval('public.training_sessions_id_seq'::regclass);


--
-- Name: units_of_measure id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_of_measure ALTER COLUMN id SET DEFAULT nextval('public.units_of_measure_id_seq'::regclass);


--
-- Name: user_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications ALTER COLUMN id SET DEFAULT nextval('public.user_notifications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: valuation_cost_layers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valuation_cost_layers ALTER COLUMN id SET DEFAULT nextval('public.valuation_cost_layers_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: account_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_categories (id, account_type, created_by, created_date, description, display_order, is_system, name) FROM stdin;
\.


--
-- Data for Name: account_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_mappings (id, active, created_at, created_by, description, display_order, mapping_key, mapping_label, mapping_type, updated_at, branch_id, credit_account_id, debit_account_id) FROM stdin;
\.


--
-- Data for Name: account_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_transfers (id, amount, created_by, created_date, description, memo, status, transfer_date, transfer_number, from_account_id, journal_entry_id, to_account_id) FROM stdin;
\.


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_records (id, approval_status, approved_at, attendance_date, break_duration, capture_method, clock_in, clock_out, created_at, early_departure, early_minutes, late_arrival, late_minutes, overtime_hours, project_code, project_name, regular_hours, remarks, status, updated_at, approved_by, employee_id) FROM stdin;
1	APPROVED	\N	2026-02-18	\N	ON_SITE	10:14:00	\N	2026-02-18 04:44:48.08506	\N	\N	\N	\N	\N	\N	\N	\N	\N	PRESENT	2026-02-18 04:44:48.085072	\N	1
\.


--
-- Data for Name: attendance_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_rules (id, auto_deduct_break, break_duration_minutes, created_at, description, enable_overtime, grace_minutes_in, grace_minutes_out, half_day_enabled, half_day_hours, is_active, is_default, max_overtime_hours_daily, max_overtime_hours_weekly, overtime_multiplier, regular_hours_per_day, rule_name, standard_end_time, standard_start_time, updated_at, weekly_hours_limit) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, action, entity_id, entity_name, entity_type, ip_address, new_value, old_value, "timestamp", username) FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_accounts (id, account_name, account_number, account_type, as_of_date, bank_address, bank_branch, bank_name, contact_email, contact_name, contact_phone, created_by, created_date, currency_code, current_balance, description, iban, is_active, is_primary, last_reconciled_balance, last_reconciled_date, modified_by, modified_date, opening_balance, routing_number, swift_code, gl_account_id) FROM stdin;
1	HDFC Current Account	50100123456789	Current	\N	\N	Fort, Mumbai	HDFC Bank	\N	\N	\N	\N	2026-02-18 03:59:42.035074	INR	5000000.00	\N	\N	t	f	\N	\N	\N	\N	0.00	HDFC0001234	\N	1
2	ICICI Savings Account	012301234567	Savings	\N	\N	Andheri, Mumbai	ICICI Bank	\N	\N	\N	\N	2026-02-18 03:59:42.045594	INR	2500000.00	\N	\N	t	f	\N	\N	\N	\N	0.00	ICIC0000123	\N	1
3	SBI Current Account	39876543210	Current	\N	\N	Connaught Place, Delhi	State Bank of India	\N	\N	\N	\N	2026-02-18 03:59:42.052321	INR	7500000.00	\N	\N	t	f	\N	\N	\N	\N	0.00	SBIN0001234	\N	1
\.


--
-- Data for Name: bank_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_transactions (id, amount, bill_id, check_number, created_by, created_date, customer_id, description, expense_id, import_id, import_source, invoice_id, is_imported, is_reconciled, is_transfer, matched, matched_transaction_id, memo, modified_by, modified_date, payee, reconciliation_id, reference, rule_id, running_balance, status, supplier_id, transaction_date, transaction_type, transfer_id, value_date, account_id, bank_account_id, journal_entry_id) FROM stdin;
\.


--
-- Data for Name: banking_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banking_rules (id, apply_to_all_accounts, assign_memo, assign_payee, auto_confirm, condition_field, condition_logic, condition_operator, condition_value, created_by, created_date, is_active, modified_by, modified_date, name, priority, secondary_condition_field, secondary_condition_operator, secondary_condition_value, times_applied, transaction_type, assign_account_id, bank_account_id) FROM stdin;
\.


--
-- Data for Name: benefit_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.benefit_plans (id, benefit_type, category, contribution_type, coverage_amount, coverage_details, created_at, created_by, description, effective_from, effective_to, eligibility_rules, employee_contribution, employer_contribution, enrollment_end_date, enrollment_start_date, exclusions, is_active, is_mandatory, name, plan_code, policy_number, provider, terms_and_conditions, updated_at, waiting_period_days) FROM stdin;
\.


--
-- Data for Name: bill_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bill_lines (id, amount, billable, cost_center_id, description, line_number, memo, project_id, quantity, tax_amount, tax_code, tax_rate, unit_price, account_id, bill_id, item_id) FROM stdin;
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bills (id, amount_paid, balance_due, bill_date, bill_number, created_by, created_date, currency_code, discount_amount, due_date, exchange_rate, memo, modified_by, modified_date, purchase_order_id, status, subtotal, tax_amount, terms, total_amount, vendor_invoice_number, journal_entry_id, payable_account_id, supplier_id) FROM stdin;
\.


--
-- Data for Name: bins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bins (id, aisle, code, created_by, created_date, name, rack, shelf, status, updated_by, updated_date, zone, warehouse_id) FROM stdin;
\.


--
-- Data for Name: branch_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_settings (id, auto_generate_employee_id, business_registration_number, company_legal_name, created_at, currency_position, currency_symbol, default_payment_terms, default_tax_rate, display_name, employee_id_next_number, employee_id_prefix, fiscal_year_start_month, invoice_due_days, invoice_footer, invoice_next_number, invoice_prefix, invoice_terms, letterhead, number_format, payroll_next_number, payroll_prefix, primary_color, purchase_order_next_number, purchase_order_prefix, quotation_next_number, quotation_prefix, receipt_next_number, receipt_prefix, secondary_color, show_logo_on_invoices, show_logo_on_reports, signature_path, tax_label, tax_registration_number, time_format, updated_at, branch_id) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, active, address, city, code, country, created_at, currency, date_format, email, logo_path, name, phone, primary_color, secondary_color, slug, state, timezone, updated_at, website, zip_code) FROM stdin;
\.


--
-- Data for Name: budget_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_lines (id, annual_amount, apr_amount, aug_amount, dec_amount, feb_amount, jan_amount, jul_amount, jun_amount, mar_amount, may_amount, notes, nov_amount, oct_amount, sep_amount, account_id, budget_id) FROM stdin;
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budgets (id, approved_by, approved_date, budget_type, created_by, created_date, description, fiscal_year, is_active, modified_by, modified_date, name, net_amount, status, total_expense, total_income) FROM stdin;
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.candidates (id, alternate_phone, available_from, candidate_number, certifications, city, converted_at, country, created_at, created_by, current_address, current_designation, current_employer, current_salary, date_of_birth, email, expected_salary, first_name, gender, graduation_year, highest_education, last_name, linkedin_url, middle_name, notes, notice_period, overall_rating, phone, portfolio_url, postal_code, referred_by, relevant_experience, resume_text, resume_url, skills, source, stage, state, status, total_experience, university, updated_at, assigned_recruiter_id, converted_employee_id, job_posting_id, requisition_id) FROM stdin;
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chart_of_accounts (id, account_code, account_name, account_type, balance_type, bank_account_id, created_by, created_date, current_balance, description, display_order, is_header, is_sub_account, is_system, modified_by, modified_date, opening_balance, status, tax_applicable, category_id, parent_id) FROM stdin;
1	1000	Cash and Bank	ASSET	\N	\N	\N	2026-02-18 03:59:42.008703	0.00	Cash and bank balances	\N	f	f	f	\N	\N	0.00	Active	f	\N	\N
2	2000	Accounts Payable	LIABILITY	\N	\N	\N	2026-02-18 03:59:42.016487	0.00	Trade payables	\N	f	f	f	\N	\N	0.00	Active	f	\N	\N
3	4000	Sales Revenue	INCOME	\N	\N	\N	2026-02-18 03:59:42.022288	0.00	Revenue from sales	\N	f	f	f	\N	\N	0.00	Active	f	\N	\N
\.


--
-- Data for Name: contract_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_statuses (id, color, name) FROM stdin;
\.


--
-- Data for Name: contract_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_types (id, duration, name, renewable) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, contract_number, created_at, description, end_date, payment_terms, start_date, status, title, updated_at, value, customer_id) FROM stdin;
1	CON-2024-001	\N	Annual software maintenance and support	2024-12-31	\N	2024-01-01	Active	Annual Maintenance Contract	\N	5000000.00	1
2	CON-2024-002	\N	Enterprise software licensing	2027-03-31	\N	2024-04-01	Active	Software License Agreement	\N	12000000.00	2
3	CON-2024-003	\N	IT consulting and advisory services	2025-01-31	\N	2024-02-01	Active	Consulting Services Agreement	\N	8000000.00	3
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cost_centers (id, active, code, description, name, parent_id) FROM stdin;
1	t	CC-ADMIN	Administrative Cost Center	Administration	\N
2	t	CC-TECH	Technology Cost Center	Technology	\N
3	t	CC-SALES	Sales and Marketing Cost Center	Sales & Marketing	\N
\.


--
-- Data for Name: customer_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_groups (id, description, discount, name) FROM stdin;
\.


--
-- Data for Name: customer_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_statuses (id, color, name) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, address, customer_group, email, name, phone, status) FROM stdin;
1	TCS House, Raveline Street, Fort, Mumbai	Enterprise	contact@tcs.com	Tata Consultancy Services	+91-22-67789999	Active
2	Electronics City, Hosur Road, Bangalore	Enterprise	contact@infosys.com	Infosys Limited	+91-80-28520261	Active
3	Doddakannelli, Sarjapur Road, Bangalore	Enterprise	contact@wipro.com	Wipro Technologies	+91-80-28440011	Active
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, active, code, description, name, branch_id, cost_center_id, location_id, parent_id) FROM stdin;
1	t	DEPT-HR	HR and People Operations	Human Resources	\N	\N	\N	\N
2	t	DEPT-FIN	Finance and Accounting	Finance	\N	\N	\N	\N
3	t	DEPT-IT	IT and Software Development	Information Technology	\N	\N	\N	\N
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.designations (id, active, code, description, title, grade_id) FROM stdin;
1	t	DES-MGR	Department Manager	Manager	3
2	t	DES-SR-ENG	Senior Software Engineer	Senior Engineer	2
3	t	DES-ANALYST	Business Analyst	Analyst	1
\.


--
-- Data for Name: document_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_categories (id, active, code, created_at, description, name, sort_order, updated_at) FROM stdin;
\.


--
-- Data for Name: document_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_types (id, active, code, created_at, default_reminder_days, description, has_expiry, is_mandatory, name, sort_order, updated_at, category_id) FROM stdin;
\.


--
-- Data for Name: employee_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_assets (id, approval_status, approved_at, approved_by, asset_code, asset_name, asset_type, condition, created_at, created_by, description, issue_date, manufacturer, model, remarks, return_date, serial_number, status, updated_at, employee_id) FROM stdin;
\.


--
-- Data for Name: employee_bank_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_bank_details (id, account_holder_name, account_number, account_type, active, bank_name, branch_name, created_at, ifsc_code, is_primary, payment_method, routing_number, swift_code, updated_at, employee_id) FROM stdin;
\.


--
-- Data for Name: employee_benefits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_benefits (id, annual_employee_contribution, annual_employer_contribution, benefit_type, contribution_percentage, contribution_type, coverage_level, created_at, effective_date, employee_contribution, employer_contribution, employer_match_limit, employer_match_percentage, enrollment_date, is_active, is_pre_tax, notes, plan_name, termination_date, updated_at, employee_id) FROM stdin;
\.


--
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_documents (id, created_at, document_number, expiry_date, file_name, file_size, file_url, issue_date, mime_type, remarks, reminder_days, reminder_sent, updated_at, uploaded_at, uploaded_by, verification_remarks, verification_status, verified_at, verified_by, document_type_id, employee_id) FROM stdin;
\.


--
-- Data for Name: employee_education; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_education (id, created_at, grade, institution, percentage, qualification, remarks, specialization, university, updated_at, year_of_passing, employee_id) FROM stdin;
\.


--
-- Data for Name: employee_experience; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_experience (id, company_name, created_at, designation, from_date, last_salary, location, reason_for_leaving, reference_contact, responsibilities, to_date, updated_at, employee_id) FROM stdin;
\.


--
-- Data for Name: employee_salaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_salaries (id, basic_salary, change_reason, created_at, created_by, ctc_annual, da_amount, effective_from, effective_to, esi_deduction, gross_salary, hourly_rate, hra_amount, is_current, medical_allowance, net_salary, other_allowances, other_deductions, pay_frequency, pf_deduction, professional_tax, remarks, special_allowance, ta_amount, tds_deduction, updated_at, employee_id) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, aadhar_number, active, alternate_phone, blood_group, citizenship, confirmation_date, created_at, created_by, current_address, current_city, current_country, current_state, current_zip_code, date_of_birth, email, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, employee_code, employment_status, employment_type, first_name, gender, hourly_rate, i9expiry_date, i9status, joining_date, last_name, last_working_date, marital_status, middle_name, national_id, nationality, notice_period_days, pan_number, passport_expiry, passport_number, permanent_address, permanent_city, permanent_country, permanent_state, permanent_zip_code, phone, probation_end_date, probation_months, profile_photo, resignation_date, salary, ssn, updated_at, updated_by, visa_expiry, visa_type, work_authorization_type, branch_id, cost_center_id, department_id, designation_id, expense_center_id, grade_id, job_role_id, location_id, project_id, reporting_manager_id) FROM stdin;
1	\N	t	\N	\N	\N	\N	2026-02-18 03:59:41.718539	\N	\N	\N	\N	\N	\N	1985-05-15	rajesh.sharma@company.com	\N	\N	\N	EMP-001	Active	Full-Time	Rajesh	Male	450.00	\N	\N	2020-01-15	Sharma	\N	Married	\N	\N	Indian	\N	\N	\N	\N	\N	Mumbai	India	Maharashtra	\N	+91-9876543210	\N	\N	\N	\N	75000.00	\N	2026-02-18 03:59:41.718554	\N	\N	\N	\N	\N	\N	1	1	\N	\N	\N	\N	\N	\N
2	\N	t	\N	\N	\N	\N	2026-02-18 03:59:41.734384	\N	\N	\N	\N	\N	\N	1990-08-22	priya.patel@company.com	\N	\N	\N	EMP-002	Active	Full-Time	Priya	Female	390.00	\N	\N	2021-03-10	Patel	\N	Single	\N	\N	Indian	\N	\N	\N	\N	\N	Ahmedabad	India	Gujarat	\N	+91-9876543211	\N	\N	\N	\N	65000.00	\N	2026-02-18 03:59:41.734396	\N	\N	\N	\N	\N	\N	2	2	\N	\N	\N	\N	\N	\N
3	\N	t	\N	\N	\N	\N	2026-02-18 03:59:41.739219	\N	\N	\N	\N	\N	\N	1992-12-05	amit.verma@company.com	\N	\N	\N	EMP-003	Active	Full-Time	Amit	Male	330.00	\N	\N	2022-06-01	Verma	\N	Married	\N	\N	Indian	\N	\N	\N	\N	\N	Delhi	India	Delhi	\N	+91-9876543212	\N	\N	\N	\N	55000.00	\N	2026-02-18 03:59:41.739227	\N	\N	\N	\N	\N	\N	3	3	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_categories (id, account_code, active, code, created_at, description, display_order, expense_type, max_amount, name, requires_approval, requires_receipt, updated_at, parent_id) FROM stdin;
1	\N	t	EXP-TRV	2026-02-18 03:59:41.972068	Travel, transport and conveyance expenses	\N	\N	\N	Travel & Conveyance	t	t	2026-02-18 03:59:41.972084	\N
2	\N	t	EXP-MEAL	2026-02-18 03:59:41.978054	Business meals and client entertainment	\N	\N	\N	Meals & Entertainment	t	t	2026-02-18 03:59:41.978065	\N
3	\N	t	EXP-OFF	2026-02-18 03:59:41.98221	Office supplies and equipment	\N	\N	\N	Office Expenses	t	t	2026-02-18 03:59:41.982217	\N
\.


--
-- Data for Name: expense_centers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_centers (id, active, code, description, name, cost_center_id) FROM stdin;
\.


--
-- Data for Name: expense_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_items (id, amount, amount_in_base_currency, approval_notes, approved, approved_amount, billable, client_code, created_at, currency, description, exchange_rate, expense_date, notes, payment_method, quantity, receipt_attached, receipt_number, receipt_url, unit_price, updated_at, vendor, category_id, expense_request_id) FROM stdin;
\.


--
-- Data for Name: expense_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_requests (id, accounting_reference, approved_amount, approved_at, approver_remarks, created_at, created_by, description, expense_date, payee_name, period_from, period_to, posted_at, posted_to_accounts, project_code, receipt_number, receipt_url, reimbursed_at, reimbursement_required, reimbursement_status, rejected_at, rejection_reason, request_number, status, submitted_at, title, total_amount, updated_at, updated_by, approver_id, category_id, cost_center_id, employee_id, payroll_record_id) FROM stdin;
\.


--
-- Data for Name: final_settlements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.final_settlements (id, advance_recovery, allowances_due, approved_at, approved_by, asset_recovery, basic_salary_due, bonus_due, created_at, created_by, gratuity_amount, last_working_day, leave_balance_days, leave_encashment, loan_recovery, net_payable, notice_pay_recovery, other_deductions, other_earnings, processed_at, processed_by, remarks, resignation_date, separation_type, settlement_number, status, tax_deduction, total_deductions, total_earnings, updated_at, employee_id) FROM stdin;
\.


--
-- Data for Name: finance_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_settings (id, bank_account_number, bank_name, bank_routing_number, fiscal_year_start, invoice_prefix, next_invoice_number, payment_terms_default, tax_id, tax_rate) FROM stdin;
\.


--
-- Data for Name: fiscal_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fiscal_periods (id, closed_by, closed_date, created_by, created_date, end_date, fiscal_year, is_closed, is_current, name, period_number, start_date) FROM stdin;
\.


--
-- Data for Name: general_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.general_settings (id, company_address, company_email, company_name, company_phone, company_website, currency, date_format, logo_path, timezone, valuation_method) FROM stdin;
\.


--
-- Data for Name: goods_issue_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goods_issue_lines (id, line_total, quantity, unit_price, bin_id, goods_issue_id, item_id) FROM stdin;
\.


--
-- Data for Name: goods_issues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goods_issues (id, created_at, issue_date, issue_number, reference_number, remarks, status, total_value, customer_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: goods_receipt_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goods_receipt_lines (id, line_total, quantity, unit_price, bin_id, goods_receipt_id, item_id) FROM stdin;
\.


--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goods_receipts (id, created_at, grn_number, po_number, receipt_date, receipt_type, reference_number, remarks, status, total_value, supplier_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, active, code, description, level, max_salary, min_salary, name) FROM stdin;
1	t	G1	Fresh graduates and junior staff	\N	\N	\N	Entry Level
2	t	G2	Experienced professionals	\N	\N	\N	Mid Level
3	t	G3	Senior professionals and managers	\N	\N	\N	Senior Level
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.holidays (id, applicable_departments, applicable_locations, created_at, day_of_week, description, holiday_date, holiday_type, is_active, is_optional, is_paid, name, updated_at, year) FROM stdin;
1	\N	\N	2026-02-18 03:59:42.058663	\N	National holiday - Republic Day of India	2024-01-26	FEDERAL	t	f	t	Republic Day	2026-02-18 03:59:42.058675	2024
2	\N	\N	2026-02-18 03:59:42.064362	\N	National holiday - Independence Day of India	2024-08-15	FEDERAL	t	f	t	Independence Day	2026-02-18 03:59:42.064369	2024
3	\N	\N	2026-02-18 03:59:42.068808	\N	National holiday - Birthday of Mahatma Gandhi	2024-10-02	FEDERAL	t	f	t	Gandhi Jayanti	2026-02-18 03:59:42.068815	2024
\.


--
-- Data for Name: hr_letters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hr_letters (id, approved_at, content, created_at, created_by, document_url, effective_date, expiry_date, generated_at, issue_date, letter_number, letter_type, notes, sent_at, sent_to_employee, signature_required, signed, signed_at, signed_document_url, status, subject, updated_at, approved_by_id, employee_id, generated_by_id) FROM stdin;
\.


--
-- Data for Name: integration_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integration_configs (id, access_token, active, api_key, api_secret, api_url, client_id, client_secret, company_id, created_at, created_by, description, environment, integration_type, last_sync_at, last_sync_message, last_sync_status, name, password, refresh_token, sms_account_sid, sms_auth_token, sms_from_number, sms_provider, smtp_host, smtp_port, smtp_security, sync_enabled, sync_frequency, token_expires_at, updated_at, updated_by, username, webhook_secret, webhook_url) FROM stdin;
\.


--
-- Data for Name: integration_sync_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integration_sync_logs (id, completed_at, error_details, records_failed, records_processed, records_successful, started_at, status, sync_details, sync_type, triggered_by, integration_id) FROM stdin;
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interviews (id, agenda, candidate_notified, communication_rating, created_at, created_by, culture_fit_rating, end_time, feedback, feedback_submitted_at, interview_date, interview_mode, interview_type, interviewer_notes, interviewer_notified, location, meeting_link, overall_rating, problem_solving_rating, recommendation, round_name, round_number, start_time, status, strengths, technical_rating, updated_at, weaknesses, candidate_id, interviewer_id) FROM stdin;
\.


--
-- Data for Name: inventory_ledger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_ledger (id, balance_quantity, quantity_in, quantity_out, reference_number, remarks, total_value, transaction_date, transaction_type, unit_value, bin_id, item_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: item_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.item_groups (id, code, created_by, created_date, description, name, status, updated_by, updated_date) FROM stdin;
1	IG-ELEC	\N	2026-02-18 03:59:41.80354	Electronic equipment and components	Electronics	Active	\N	\N
2	IG-OFF	\N	2026-02-18 03:59:41.811562	Office stationery and supplies	Office Supplies	Active	\N	\N
3	IG-RAW	\N	2026-02-18 03:59:41.818778	Raw materials for production	Raw Materials	Active	\N	\N
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.items (id, code, created_by, created_date, current_stock, description, name, reorder_level, status, taxable, unit_cost, updated_by, updated_date, group_id, supplier_id, uom_id) FROM stdin;
1	ITM-001	\N	2026-02-18 03:59:41.836507	50	Dell Latitude 5520 Business Laptop	Laptop Dell Latitude	10	Active	t	75000.00	\N	\N	1	\N	1
2	ITM-002	\N	2026-02-18 03:59:41.846212	200	500 sheets A4 white paper	A4 Paper Ream	50	Active	t	350.00	\N	\N	2	\N	1
3	ITM-003	\N	2026-02-18 03:59:41.854892	100	Stainless steel sheets 4x8 ft	Steel Sheets	20	Active	t	2500.00	\N	\N	3	\N	2
\.


--
-- Data for Name: job_postings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_postings (id, application_count, application_url, benefits, close_date, closed_at, created_at, created_by, description, external_job_boards, is_external, is_internal, open_date, posting_number, posting_type, published_at, requirements, status, title, updated_at, view_count, requisition_id) FROM stdin;
\.


--
-- Data for Name: job_requisitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_requisitions (id, approved_at, approver_remarks, budgeted_salary_max, budgeted_salary_min, closed_at, created_at, created_by, education_requirement, employment_type, filled_positions, job_description, justification, max_experience, min_experience, number_of_positions, position_title, priority, rejected_at, rejection_reason, requirements, requisition_number, requisition_type, skills, status, submitted_at, target_join_date, updated_at, updated_by, approved_by_id, department_id, grade_id, job_role_id, location_id, reporting_to_id, requested_by_id) FROM stdin;
\.


--
-- Data for Name: job_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_roles (id, active, code, description, title, department_id, grade_id) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entries (id, created_by, created_date, description, entry_date, entry_number, is_adjusting, is_closing, is_reversing, modified_by, modified_date, posted_by, posted_date, reference_id, reference_number, reference_type, reversed_entry_id, status, total_credit, total_debit, fiscal_period_id) FROM stdin;
\.


--
-- Data for Name: journal_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_lines (id, cost_center_id, created_date, credit_amount, customer_id, debit_amount, description, employee_id, line_number, memo, project_id, reconciled, reconciliation_id, supplier_id, tax_amount, tax_code, account_id, journal_entry_id) FROM stdin;
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_balances (id, carry_forward, created_at, credited, encashed, lapsed, last_accrual_date, opening_balance, pending, updated_at, used, year, employee_id, leave_type_id) FROM stdin;
1	0.00	2026-02-18 10:54:45.510663	12.00	0.00	0.00	\N	0.00	0.00	2026-02-18 10:54:45.510678	0.00	2026	1	1
2	0.00	2026-02-18 10:54:45.63479	10.00	0.00	0.00	\N	0.00	0.00	2026-02-18 10:54:45.634802	0.00	2026	1	2
3	0.00	2026-02-18 10:54:45.641904	15.00	0.00	0.00	\N	0.00	0.00	2026-02-18 10:54:45.64193	0.00	2026	1	3
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_requests (id, approved_at, approver_remarks, attachment_url, created_at, day_type, emergency_contact, end_date, end_time, hr_approval_status, hr_approved_at, hr_remarks, is_hourly_leave, manager_approval_status, manager_approved_at, manager_remarks, notify_manager, reason, start_date, start_time, status, total_days, total_hours, updated_at, approved_by, employee_id, hr_approved_by, leave_type_id, manager_approved_by) FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_types (id, accrual_rate, accrual_type, allow_hourly_leave, annual_entitlement, applicable_gender, carry_forward_allowed, code, color_code, created_at, description, document_required, encashment_allowed, encashment_rate, is_active, is_paid, max_carry_forward, max_consecutive_days, min_notice_days, name, requires_approval, time_unit, updated_at) FROM stdin;
1	\N	MONTHLY	\N	12.00	ALL	f	LT-CL	\N	2026-02-18 03:59:41.903655	Casual leave for personal matters	\N	\N	\N	t	t	\N	\N	\N	Casual Leave	t	\N	2026-02-18 03:59:41.903666
2	\N	ANNUALLY	\N	10.00	ALL	t	LT-SL	\N	2026-02-18 03:59:41.917817	Leave for medical reasons	\N	\N	\N	t	t	5.00	\N	\N	Sick Leave	t	\N	2026-02-18 03:59:41.917833
3	\N	MONTHLY	\N	15.00	ALL	t	LT-EL	\N	2026-02-18 03:59:41.922756	Paid earned leave	\N	t	\N	t	t	30.00	\N	\N	Earned Leave	t	\N	2026-02-18 03:59:41.922773
\.


--
-- Data for Name: loan_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_applications (id, actual_disbursement_date, application_number, approved_amount, approved_at, approved_tenure_months, approver_remarks, created_at, created_by, deduct_from_payroll, emi_amount, fully_repaid, interest_rate, interest_type, last_emi_date, loan_type, next_emi_date, notes, outstanding_balance, paid_installments, purpose, rejected_at, rejection_reason, remaining_installments, repaid_at, requested_amount, requested_disbursement_date, requested_tenure_months, status, submitted_at, total_interest, total_repayable, updated_at, approved_by_id, employee_id) FROM stdin;
\.


--
-- Data for Name: loan_repayments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_repayments (id, created_at, deducted_from_payroll, due_date, emi_amount, installment_number, interest_amount, notes, outstanding_after, paid_amount, paid_date, payment_mode, payment_reference, penalty_amount, principal_amount, status, updated_at, loan_id, payroll_record_id) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locations (id, active, address, city, code, country, email, location_type, name, phone, state, zip_code) FROM stdin;
1	t	\N	Mumbai	LOC-MUM	India	\N	\N	Mumbai Office	\N	Maharashtra	\N
2	t	\N	New Delhi	LOC-DEL	India	\N	\N	Delhi Office	\N	Delhi	\N
3	t	\N	Bangalore	LOC-BLR	India	\N	\N	Bangalore Office	\N	Karnataka	\N
\.


--
-- Data for Name: offer_letters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offer_letters (id, accepted_at, approved_at, benefits, created_at, created_by, decline_reason, declined_at, employment_type, letter_content, offer_number, offered_salary, position_title, proposed_join_date, salary_breakdown, sent_at, signed_document_url, signing_bonus, status, terms_and_conditions, updated_at, valid_until, approved_by_id, candidate_id, department_id, grade_id, location_id, reporting_to_id, requisition_id) FROM stdin;
\.


--
-- Data for Name: onboarding_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_plans (id, actual_completion_date, completed_tasks, created_at, created_by, notes, plan_number, progress_percentage, start_date, status, target_completion_date, total_tasks, updated_at, welcome_email_sent, welcome_email_sent_at, welcome_message, buddy_id, employee_id, hr_coordinator_id, manager_id) FROM stdin;
\.


--
-- Data for Name: onboarding_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_tasks (id, assignee_role, attachment_url, category, completed_at, completion_notes, created_at, description, due_date, is_mandatory, requires_signature, signature_obtained, signed_at, sort_order, status, task_name, updated_at, assigned_to_id, completed_by_id, onboarding_plan_id) FROM stdin;
\.


--
-- Data for Name: overtime_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.overtime_rules (id, code, created_at, description, is_active, max_overtime_hours, max_overtime_period, min_hours_threshold, multiplier, name, priority, requires_approval, rule_type, threshold_type, updated_at) FROM stdin;
\.


--
-- Data for Name: pay_frequencies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pay_frequencies (id, code, created_at, description, is_active, is_default, name, pay_day_of_month, pay_day_of_week, periods_per_year, second_pay_day_of_month, updated_at) FROM stdin;
\.


--
-- Data for Name: payroll_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payroll_records (id, annual_salary, base_pay, bonuses, cost_center_code, created_at, dental_insurance, disability_tax, employee_type, employer401k_match, employer_health_contribution, employer_medicare, employer_social_security, federal_tax, garnishments, gross_pay, health_insurance, hourly_rate, hsa_contribution, loan_deductions, local_tax, medicare_tax, net_pay, other_post_tax_deductions, other_pre_tax_deductions, overtime_hours, overtime_pay, post_tax_deductions, pre_tax_deductions, project_code, regular_hours, reimbursements, remarks, retirement401k, social_security_tax, state_tax, status, taxable_income, total_deductions, total_employer_contributions, total_taxes, updated_at, vision_insurance, employee_id, payroll_run_id, timesheet_id) FROM stdin;
\.


--
-- Data for Name: payroll_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payroll_runs (id, approved_at, created_at, description, is_posted_to_accounts, pay_date, payroll_run_number, period_end_date, period_start_date, posted_at, processed_at, remarks, status, total_deductions, total_employees, total_employer_contributions, total_gross_pay, total_net_pay, total_taxes, updated_at, approved_by, created_by, pay_frequency_id, processed_by) FROM stdin;
\.


--
-- Data for Name: pr_fulfillment_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pr_fulfillment_items (id, amount, fulfill_qty, fulfilled_qty, item_code, item_description, item_id, item_name, pending_qty, pr_item_id, rate, requested_qty, uom, pr_fulfillment_id) FROM stdin;
\.


--
-- Data for Name: pr_fulfillments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pr_fulfillments (id, created_at, expected_delivery_date, fulfillment_date, fulfillment_type, payment_terms, performed_by, performed_by_id, pr_id, pr_number, reference_number, remarks, source_location, supplier_id, supplier_name, target_location, total_amount, warehouse_id, warehouse_name) FROM stdin;
\.


--
-- Data for Name: pr_material_transfer_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pr_material_transfer_items (id, item_code, item_id, item_name, pr_item_id, remarks, requested_quantity, transferred_quantity, uom, material_transfer_id) FROM stdin;
\.


--
-- Data for Name: pr_material_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pr_material_transfers (id, created_at, created_by, from_project, pr_number, remarks, status, supplier_name, transfer_date, transfer_number, updated_at, purchase_requisition_id, supplier_id) FROM stdin;
\.


--
-- Data for Name: pr_stock_fulfillment_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pr_stock_fulfillment_items (id, fulfilled_quantity, item_code, item_id, item_name, pr_item_id, remarks, requested_quantity, uom, stock_fulfillment_id) FROM stdin;
\.


--
-- Data for Name: pr_stock_fulfillments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pr_stock_fulfillments (id, created_at, created_by, from_warehouse_name, fulfillment_date, fulfillment_number, pr_number, remarks, status, supplier_name, updated_at, from_warehouse_id, purchase_requisition_id, supplier_id) FROM stdin;
\.


--
-- Data for Name: prefix_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prefix_settings (id, adjustment_next_number, adjustment_prefix, bin_next_number, bin_prefix, employee_next_number, employee_prefix, grn_next_number, grn_prefix, group_next_number, group_prefix, issue_next_number, issue_prefix, item_next_number, item_prefix, po_next_number, po_prefix, pr_next_number, pr_prefix, supplier_next_number, supplier_prefix, transfer_next_number, transfer_prefix, unit_next_number, unit_prefix, warehouse_next_number, warehouse_prefix) FROM stdin;
1	1	ADJ-	1	BIN-	1	EMP-	1	GRN-	1	GRP-	1	GI-	1	ITM-	1	PO-	1	PR-	1	SUP-	1	ST-	1	UOM-	1	WH-
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_members (id, added_at, hourly_rate, role, employee_id, project_id) FROM stdin;
\.


--
-- Data for Name: project_milestones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_milestones (id, created_at, description, due_date, name, status, project_id) FROM stdin;
\.


--
-- Data for Name: project_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_tasks (id, billable, created_at, description, due_date, estimated_hours, logged_hours, name, priority, start_date, status, updated_at, visible_to_client, assignee_id, project_id) FROM stdin;
\.


--
-- Data for Name: project_time_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_time_entries (id, approved_at, billable, billable_rate, created_at, entry_date, entry_type, hours_worked, is_present, project_code, project_name, remarks, status, task_description, updated_at, approved_by, employee_id) FROM stdin;
\.


--
-- Data for Name: project_timesheets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_timesheets (id, approved_at, approver_remarks, billable_hours, created_at, non_billable_hours, overtime_hours, period_end_date, period_start_date, project_code, project_name, project_timesheet_number, regular_hours, remarks, status, total_hours, updated_at, approved_by, employee_id) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, allow_customer_comment_tasks, allow_customer_upload_files, allow_customer_view_discussions, allow_customer_view_files, allow_customer_view_project, allow_customer_view_task_comments, allow_customer_view_tasks, allow_customer_view_timesheets, archived, billable_tasks, billing_type, calculated_progress, completion_date, created_at, created_by, currency, deadline, deleted, description, end_date, estimated_cost, estimated_hours, fixed_rate_amount, hourly_rate, invoice_project, invoice_tasks, invoice_timesheets, location_address, location_latitude, location_longitude, location_radius_meters, location_tracking_enabled, name, progress, project_code, project_cost, start_date, status, tags, total_billable_time, total_logged_time, updated_at, customer_id, project_manager_id) FROM stdin;
1	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	Fixed Price	\N	\N	2026-02-18 03:59:41.931843	\N	USD	\N	f	Enterprise-wide digital transformation project	2024-12-31	15000000.00	5000.00	\N	\N	\N	\N	\N	\N	\N	\N	100	f	Digital Transformation Initiative	45	PRJ-2024-001	\N	2024-01-01	In Progress	\N	0.00	0.00	2026-02-18 03:59:41.931853	1	\N
2	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	Time & Material	\N	\N	2026-02-18 03:59:41.94109	\N	USD	\N	f	Migrate on-premise systems to cloud	2024-09-30	8000000.00	3000.00	\N	\N	\N	\N	\N	\N	\N	\N	100	f	Cloud Migration Project	30	PRJ-2024-002	\N	2024-03-01	In Progress	\N	0.00	0.00	2026-02-18 03:59:41.941119	2	\N
3	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	Fixed Price	\N	\N	2026-02-18 03:59:41.946053	\N	USD	\N	f	Implement new ERP system	2025-05-31	25000000.00	8000.00	\N	\N	\N	\N	\N	\N	\N	\N	100	f	ERP Implementation	10	PRJ-2024-003	\N	2024-06-01	Planning	\N	0.00	0.00	2026-02-18 03:59:41.946062	3	\N
\.


--
-- Data for Name: purchase_invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_invoice_items (id, amount, description, hsn_code, item_code, item_name, quantity, rate, remarks, tax_amount, tax_rate, uom, invoice_id) FROM stdin;
\.


--
-- Data for Name: purchase_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_invoices (id, bill_to_address, bill_to_gstin, bill_to_name, created_at, created_by, discount, due_date, invoice_date, invoice_number, payment_terms, po_id, po_number, remarks, ship_to_address, ship_to_name, status, subtotal, supplier_address, supplier_contact, supplier_email, supplier_gstin, supplier_id, supplier_name, tax_amount, total_amount, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_requisition_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_requisition_items (id, fulfilled_quantity, item_code, item_description, item_id, item_name, quantity, remarks, status, uom, purchase_requisition_id) FROM stdin;
\.


--
-- Data for Name: purchase_requisitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_requisitions (id, approved_at, approved_by, approved_by_id, comments_count, created_at, created_by, created_by_id, delivery_location, department, pr_date, pr_number, priority, purpose, rejected_at, rejected_by, rejected_by_id, rejection_reason, remarks, requested_by, requested_by_id, required_date, status, submitted_at, submitted_by, submitted_by_id, updated_at) FROM stdin;
\.


--
-- Data for Name: reconciliations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reconciliations (id, beginning_balance, cleared_balance, created_by, created_date, difference, is_reconciled, notes, reconciled_by, reconciled_date, statement_date, statement_ending_balance, status, bank_account_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, description, is_system_role, name, permissions, branch_id) FROM stdin;
1	Super Administrator with all branches access	f	SUPER_ADMIN	all	\N
2	Branch Administrator	f	ADMIN	all	\N
3	Manager with full access	f	MANAGER	read,create,update,delete,reports	\N
4	Standard staff member	f	STAFF	read,create,update	\N
5	Read-only access	f	VIEWER	read	\N
\.


--
-- Data for Name: salary_bands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salary_bands (id, band_code, created_at, created_by, currency, da_percentage, effective_from, effective_to, hra_percentage, is_active, max_salary, medical_allowance_percentage, mid_salary, min_salary, name, notes, pay_frequency, special_allowance_percentage, ta_percentage, updated_at, grade_id, job_role_id) FROM stdin;
1	SB-G1	2026-02-18 03:59:42.075817	\N	INR	\N	\N	\N	\N	t	600000.00	\N	\N	300000.00	Entry Level Band	\N	\N	\N	\N	2026-02-18 03:59:42.075826	1	\N
2	SB-G2	2026-02-18 03:59:42.083197	\N	INR	\N	\N	\N	\N	t	1500000.00	\N	\N	600000.00	Mid Level Band	\N	\N	\N	\N	2026-02-18 03:59:42.083206	2	\N
3	SB-G3	2026-02-18 03:59:42.088331	\N	INR	\N	\N	\N	\N	t	3500000.00	\N	\N	1500000.00	Senior Level Band	\N	\N	\N	\N	2026-02-18 03:59:42.088339	3	\N
\.


--
-- Data for Name: salary_heads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salary_heads (id, affects_gross_pay, applicable_to, based_on_head, calculation_type, category, code, created_at, default_value, description, display_order, head_type, is_active, is_statutory, is_taxable, name, percentage_of, updated_at) FROM stdin;
\.


--
-- Data for Name: statutory_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.statutory_rules (id, applicable_year, code, created_at, description, effective_from, effective_to, employee_rate, employer_rate, frequency, is_active, is_mandatory, max_contribution, min_wage, name, rule_type, state_code, updated_at, wage_base) FROM stdin;
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_adjustments (id, adjustment_date, adjustment_number, adjustment_type, created_at, quantity_adjusted, quantity_after, quantity_before, reason, status, value_difference, bin_id, item_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: stock_transfer_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_transfer_lines (id, quantity, from_bin_id, item_id, stock_transfer_id, to_bin_id) FROM stdin;
\.


--
-- Data for Name: stock_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_transfers (id, created_at, remarks, status, transfer_date, transfer_number, from_warehouse_id, to_warehouse_id) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, address, code, contact_person, email, name, payment_terms, phone, status) FROM stdin;
1	Maker Chambers IV, Nariman Point, Mumbai	SUP-001	Mukesh Agarwal	procurement@ril.com	Reliance Industries Ltd	Net 30	+91-22-35553000	Active
2	Unilever House, BG Kher Marg, Mumbai	SUP-002	Sanjay Mishra	supply@hul.com	Hindustan Unilever Limited	Net 45	+91-22-39832000	Active
3	Gateway Building, Apollo Bunder, Mumbai	SUP-003	Ravi Krishnan	vendors@mahindra.com	Mahindra & Mahindra Ltd	Net 30	+91-22-24901441	Active
\.


--
-- Data for Name: tax_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_rules (id, calculation_basis, code, created_at, description, effective_from, effective_to, employee_contribution, employer_contribution, employer_rate, fixed_amount, is_active, max_income, min_income, name, rate, state_code, tax_type, tax_year, updated_at) FROM stdin;
\.


--
-- Data for Name: timesheets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timesheets (id, absent_days, approved_at, approver_remarks, created_at, holiday_days, leave_days, period_end_date, period_start_date, present_days, remarks, status, timesheet_number, total_hours, total_overtime_hours, total_regular_hours, updated_at, working_days, approved_by, employee_id, pay_frequency_id) FROM stdin;
\.


--
-- Data for Name: training_enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_enrollments (id, attendance_marked_at, attendance_percentage, attended, certificate_expiry_date, certificate_issued, certificate_issued_date, certificate_number, certificate_url, completed, completed_at, created_at, enrolled_date, feedback, grade, notes, rating, score, status, updated_at, employee_id, session_id) FROM stdin;
\.


--
-- Data for Name: training_programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_programs (id, category, certification_name, cost_per_participant, created_at, created_by, curriculum, delivery_mode, description, duration_days, duration_hours, external_provider, has_certification, is_active, is_mandatory, max_participants, min_participants, name, objectives, prerequisites, program_code, target_audience, training_type, updated_at, validity_months) FROM stdin;
1	\N	\N	\N	2026-02-18 03:59:41.989093	\N	\N	Classroom	Developing future leaders	\N	40	\N	f	t	f	25	\N	Leadership Development Program	\N	\N	TRN-001	\N	Internal	2026-02-18 03:59:41.98912	\N
2	\N	\N	\N	2026-02-18 03:59:41.996967	\N	\N	Online	Advanced technical skills training	\N	24	\N	f	t	f	50	\N	Technical Skills Workshop	\N	\N	TRN-002	\N	External	2026-02-18 03:59:41.99698	\N
3	\N	\N	\N	2026-02-18 03:59:42.001683	\N	\N	Hybrid	Effective business communication	\N	16	\N	f	t	f	30	\N	Communication Skills	\N	\N	TRN-003	\N	Internal	2026-02-18 03:59:42.001694	\N
\.


--
-- Data for Name: training_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_sessions (id, attended_count, created_at, created_by, end_date, end_time, enrolled_count, external_trainer, materials, max_participants, notes, online_link, session_code, session_name, start_date, start_time, status, total_cost, updated_at, venue, program_id, trainer_id) FROM stdin;
\.


--
-- Data for Name: units_of_measure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.units_of_measure (id, code, conversion_factor, created_by, created_date, name, status, symbol, updated_by, updated_date, base_uom_id) FROM stdin;
1	PCS	1.000000	\N	2026-02-18 03:59:41.779183	Pieces	Active	pc	\N	\N	\N
2	KG	1.000000	\N	2026-02-18 03:59:41.787696	Kilograms	Active	kg	\N	\N	\N
3	LTR	1.000000	\N	2026-02-18 03:59:41.79433	Liters	Active	L	\N	\N	\N
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notifications (id, created_at, message, is_read, read_at, recipient_username, reference_id, reference_type, title, type) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, active, created_at, email, first_name, is_super_admin, last_login, last_name, password, phone, username, branch_id, role_id) FROM stdin;
1	t	2026-02-18 03:59:42.227478	admin@erp.com	System	t	2026-02-18 10:56:45.397631	Administrator	$2a$10$LpMkKbIICz276brDS87J5OI1j2a/a5.pE0uJJSHbiZtAMKYqLNoE.	\N	admin	\N	1
\.


--
-- Data for Name: valuation_cost_layers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.valuation_cost_layers (id, created_at, quantity_in, quantity_remaining, reference_number, reference_type, total_value, unit_cost, item_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouses (id, address, code, created_by, created_date, name, status, updated_by, updated_date, default_bin_id) FROM stdin;
1	Plot 45, MIDC Industrial Area, Andheri East, Mumbai	WH-MUM	\N	2026-02-18 03:59:41.866847	Mumbai Warehouse	Active	\N	\N	\N
2	Block C, Okhla Industrial Estate, New Delhi	WH-DEL	\N	2026-02-18 03:59:41.889349	Delhi Warehouse	Active	\N	\N	\N
3	Guindy Industrial Estate, Chennai	WH-CHN	\N	2026-02-18 03:59:41.895214	Chennai Warehouse	Active	\N	\N	\N
\.


--
-- Name: account_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_categories_id_seq', 1, false);


--
-- Name: account_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_mappings_id_seq', 1, false);


--
-- Name: account_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_transfers_id_seq', 1, false);


--
-- Name: attendance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_records_id_seq', 1, true);


--
-- Name: attendance_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_rules_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_accounts_id_seq', 3, true);


--
-- Name: bank_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_transactions_id_seq', 1, false);


--
-- Name: banking_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.banking_rules_id_seq', 1, false);


--
-- Name: benefit_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.benefit_plans_id_seq', 1, false);


--
-- Name: bill_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bill_lines_id_seq', 1, false);


--
-- Name: bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bills_id_seq', 1, false);


--
-- Name: bins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bins_id_seq', 1, false);


--
-- Name: branch_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branch_settings_id_seq', 1, false);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, false);


--
-- Name: budget_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.budget_lines_id_seq', 1, false);


--
-- Name: budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.budgets_id_seq', 1, false);


--
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.candidates_id_seq', 1, false);


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chart_of_accounts_id_seq', 3, true);


--
-- Name: contract_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contract_statuses_id_seq', 1, false);


--
-- Name: contract_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contract_types_id_seq', 1, false);


--
-- Name: contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contracts_id_seq', 3, true);


--
-- Name: cost_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cost_centers_id_seq', 3, true);


--
-- Name: customer_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_groups_id_seq', 1, false);


--
-- Name: customer_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_statuses_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 3, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 3, true);


--
-- Name: designations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.designations_id_seq', 3, true);


--
-- Name: document_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_categories_id_seq', 1, false);


--
-- Name: document_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_types_id_seq', 1, false);


--
-- Name: employee_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_assets_id_seq', 1, false);


--
-- Name: employee_bank_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_bank_details_id_seq', 1, false);


--
-- Name: employee_benefits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_benefits_id_seq', 1, false);


--
-- Name: employee_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_documents_id_seq', 1, false);


--
-- Name: employee_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_education_id_seq', 1, false);


--
-- Name: employee_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_experience_id_seq', 1, false);


--
-- Name: employee_salaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_salaries_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_id_seq', 3, true);


--
-- Name: expense_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expense_categories_id_seq', 3, true);


--
-- Name: expense_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expense_centers_id_seq', 1, false);


--
-- Name: expense_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expense_items_id_seq', 1, false);


--
-- Name: expense_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expense_requests_id_seq', 1, false);


--
-- Name: final_settlements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.final_settlements_id_seq', 1, false);


--
-- Name: finance_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_settings_id_seq', 1, false);


--
-- Name: fiscal_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fiscal_periods_id_seq', 1, false);


--
-- Name: general_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.general_settings_id_seq', 1, false);


--
-- Name: goods_issue_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_issue_lines_id_seq', 1, false);


--
-- Name: goods_issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_issues_id_seq', 1, false);


--
-- Name: goods_receipt_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_receipt_lines_id_seq', 1, false);


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_receipts_id_seq', 1, false);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grades_id_seq', 3, true);


--
-- Name: holidays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.holidays_id_seq', 3, true);


--
-- Name: hr_letters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hr_letters_id_seq', 1, false);


--
-- Name: integration_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.integration_configs_id_seq', 1, false);


--
-- Name: integration_sync_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.integration_sync_logs_id_seq', 1, false);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- Name: inventory_ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_ledger_id_seq', 1, false);


--
-- Name: item_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.item_groups_id_seq', 3, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.items_id_seq', 3, true);


--
-- Name: job_postings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_postings_id_seq', 1, false);


--
-- Name: job_requisitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_requisitions_id_seq', 1, false);


--
-- Name: job_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_roles_id_seq', 1, false);


--
-- Name: journal_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.journal_entries_id_seq', 1, false);


--
-- Name: journal_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.journal_lines_id_seq', 1, false);


--
-- Name: leave_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_balances_id_seq', 3, true);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 3, true);


--
-- Name: loan_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_applications_id_seq', 1, false);


--
-- Name: loan_repayments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_repayments_id_seq', 1, false);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.locations_id_seq', 3, true);


--
-- Name: offer_letters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offer_letters_id_seq', 1, false);


--
-- Name: onboarding_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_plans_id_seq', 1, false);


--
-- Name: onboarding_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onboarding_tasks_id_seq', 1, false);


--
-- Name: overtime_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.overtime_rules_id_seq', 1, false);


--
-- Name: pay_frequencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pay_frequencies_id_seq', 1, false);


--
-- Name: payroll_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payroll_records_id_seq', 1, false);


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payroll_runs_id_seq', 1, false);


--
-- Name: pr_fulfillment_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pr_fulfillment_items_id_seq', 1, false);


--
-- Name: pr_fulfillments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pr_fulfillments_id_seq', 1, false);


--
-- Name: pr_material_transfer_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pr_material_transfer_items_id_seq', 1, false);


--
-- Name: pr_material_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pr_material_transfers_id_seq', 1, false);


--
-- Name: pr_stock_fulfillment_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pr_stock_fulfillment_items_id_seq', 1, false);


--
-- Name: pr_stock_fulfillments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pr_stock_fulfillments_id_seq', 1, false);


--
-- Name: prefix_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prefix_settings_id_seq', 1, true);


--
-- Name: project_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_members_id_seq', 1, false);


--
-- Name: project_milestones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_milestones_id_seq', 1, false);


--
-- Name: project_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_tasks_id_seq', 1, false);


--
-- Name: project_time_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_time_entries_id_seq', 1, false);


--
-- Name: project_timesheets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_timesheets_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 3, true);


--
-- Name: purchase_invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_invoice_items_id_seq', 1, false);


--
-- Name: purchase_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_invoices_id_seq', 1, false);


--
-- Name: purchase_requisition_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_requisition_items_id_seq', 1, false);


--
-- Name: purchase_requisitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_requisitions_id_seq', 1, false);


--
-- Name: reconciliations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reconciliations_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: salary_bands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.salary_bands_id_seq', 3, true);


--
-- Name: salary_heads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.salary_heads_id_seq', 1, false);


--
-- Name: statutory_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.statutory_rules_id_seq', 1, false);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_adjustments_id_seq', 1, false);


--
-- Name: stock_transfer_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_transfer_lines_id_seq', 1, false);


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_transfers_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 3, true);


--
-- Name: tax_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tax_rules_id_seq', 1, false);


--
-- Name: timesheets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.timesheets_id_seq', 1, false);


--
-- Name: training_enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.training_enrollments_id_seq', 1, false);


--
-- Name: training_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.training_programs_id_seq', 3, true);


--
-- Name: training_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.training_sessions_id_seq', 1, false);


--
-- Name: units_of_measure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.units_of_measure_id_seq', 3, true);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_notifications_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: valuation_cost_layers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.valuation_cost_layers_id_seq', 1, false);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 3, true);


--
-- Name: account_categories account_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_categories
    ADD CONSTRAINT account_categories_pkey PRIMARY KEY (id);


--
-- Name: account_mappings account_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_mappings
    ADD CONSTRAINT account_mappings_pkey PRIMARY KEY (id);


--
-- Name: account_transfers account_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_transfers
    ADD CONSTRAINT account_transfers_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: attendance_rules attendance_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_rules
    ADD CONSTRAINT attendance_rules_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions bank_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);


--
-- Name: banking_rules banking_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banking_rules
    ADD CONSTRAINT banking_rules_pkey PRIMARY KEY (id);


--
-- Name: benefit_plans benefit_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_plans
    ADD CONSTRAINT benefit_plans_pkey PRIMARY KEY (id);


--
-- Name: bill_lines bill_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_lines
    ADD CONSTRAINT bill_lines_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: bins bins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bins
    ADD CONSTRAINT bins_pkey PRIMARY KEY (id);


--
-- Name: branch_settings branch_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_settings
    ADD CONSTRAINT branch_settings_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: budget_lines budget_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: contract_statuses contract_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_statuses
    ADD CONSTRAINT contract_statuses_pkey PRIMARY KEY (id);


--
-- Name: contract_types contract_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_types
    ADD CONSTRAINT contract_types_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: customer_groups customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_groups
    ADD CONSTRAINT customer_groups_pkey PRIMARY KEY (id);


--
-- Name: customer_statuses customer_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_statuses
    ADD CONSTRAINT customer_statuses_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: document_categories document_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_pkey PRIMARY KEY (id);


--
-- Name: document_types document_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT document_types_pkey PRIMARY KEY (id);


--
-- Name: employee_assets employee_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_assets
    ADD CONSTRAINT employee_assets_pkey PRIMARY KEY (id);


--
-- Name: employee_bank_details employee_bank_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_bank_details
    ADD CONSTRAINT employee_bank_details_pkey PRIMARY KEY (id);


--
-- Name: employee_benefits employee_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_benefits
    ADD CONSTRAINT employee_benefits_pkey PRIMARY KEY (id);


--
-- Name: employee_documents employee_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_pkey PRIMARY KEY (id);


--
-- Name: employee_education employee_education_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_education
    ADD CONSTRAINT employee_education_pkey PRIMARY KEY (id);


--
-- Name: employee_experience employee_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_experience
    ADD CONSTRAINT employee_experience_pkey PRIMARY KEY (id);


--
-- Name: employee_salaries employee_salaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_salaries
    ADD CONSTRAINT employee_salaries_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expense_centers expense_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_centers
    ADD CONSTRAINT expense_centers_pkey PRIMARY KEY (id);


--
-- Name: expense_items expense_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_items
    ADD CONSTRAINT expense_items_pkey PRIMARY KEY (id);


--
-- Name: expense_requests expense_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests
    ADD CONSTRAINT expense_requests_pkey PRIMARY KEY (id);


--
-- Name: final_settlements final_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_settlements
    ADD CONSTRAINT final_settlements_pkey PRIMARY KEY (id);


--
-- Name: finance_settings finance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_settings
    ADD CONSTRAINT finance_settings_pkey PRIMARY KEY (id);


--
-- Name: fiscal_periods fiscal_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_pkey PRIMARY KEY (id);


--
-- Name: general_settings general_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.general_settings
    ADD CONSTRAINT general_settings_pkey PRIMARY KEY (id);


--
-- Name: goods_issue_lines goods_issue_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_lines
    ADD CONSTRAINT goods_issue_lines_pkey PRIMARY KEY (id);


--
-- Name: goods_issues goods_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT goods_issues_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_lines goods_receipt_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_lines
    ADD CONSTRAINT goods_receipt_lines_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: hr_letters hr_letters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_letters
    ADD CONSTRAINT hr_letters_pkey PRIMARY KEY (id);


--
-- Name: integration_configs integration_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_configs
    ADD CONSTRAINT integration_configs_pkey PRIMARY KEY (id);


--
-- Name: integration_sync_logs integration_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_sync_logs
    ADD CONSTRAINT integration_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: inventory_ledger inventory_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT inventory_ledger_pkey PRIMARY KEY (id);


--
-- Name: item_groups item_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_groups
    ADD CONSTRAINT item_groups_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: job_postings job_postings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT job_postings_pkey PRIMARY KEY (id);


--
-- Name: job_requisitions job_requisitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT job_requisitions_pkey PRIMARY KEY (id);


--
-- Name: job_roles job_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: loan_applications loan_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_pkey PRIMARY KEY (id);


--
-- Name: loan_repayments loan_repayments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayments
    ADD CONSTRAINT loan_repayments_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: offer_letters offer_letters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT offer_letters_pkey PRIMARY KEY (id);


--
-- Name: onboarding_plans onboarding_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_plans
    ADD CONSTRAINT onboarding_plans_pkey PRIMARY KEY (id);


--
-- Name: onboarding_tasks onboarding_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_tasks
    ADD CONSTRAINT onboarding_tasks_pkey PRIMARY KEY (id);


--
-- Name: overtime_rules overtime_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_rules
    ADD CONSTRAINT overtime_rules_pkey PRIMARY KEY (id);


--
-- Name: pay_frequencies pay_frequencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_frequencies
    ADD CONSTRAINT pay_frequencies_pkey PRIMARY KEY (id);


--
-- Name: payroll_records payroll_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_pkey PRIMARY KEY (id);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: pr_fulfillment_items pr_fulfillment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_fulfillment_items
    ADD CONSTRAINT pr_fulfillment_items_pkey PRIMARY KEY (id);


--
-- Name: pr_fulfillments pr_fulfillments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_fulfillments
    ADD CONSTRAINT pr_fulfillments_pkey PRIMARY KEY (id);


--
-- Name: pr_material_transfer_items pr_material_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfer_items
    ADD CONSTRAINT pr_material_transfer_items_pkey PRIMARY KEY (id);


--
-- Name: pr_material_transfers pr_material_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfers
    ADD CONSTRAINT pr_material_transfers_pkey PRIMARY KEY (id);


--
-- Name: pr_stock_fulfillment_items pr_stock_fulfillment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillment_items
    ADD CONSTRAINT pr_stock_fulfillment_items_pkey PRIMARY KEY (id);


--
-- Name: pr_stock_fulfillments pr_stock_fulfillments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillments
    ADD CONSTRAINT pr_stock_fulfillments_pkey PRIMARY KEY (id);


--
-- Name: prefix_settings prefix_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prefix_settings
    ADD CONSTRAINT prefix_settings_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: project_milestones project_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (id);


--
-- Name: project_tasks project_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_pkey PRIMARY KEY (id);


--
-- Name: project_time_entries project_time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT project_time_entries_pkey PRIMARY KEY (id);


--
-- Name: project_timesheets project_timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_timesheets
    ADD CONSTRAINT project_timesheets_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: purchase_invoice_items purchase_invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice_items
    ADD CONSTRAINT purchase_invoice_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_invoices purchase_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT purchase_invoices_pkey PRIMARY KEY (id);


--
-- Name: purchase_requisition_items purchase_requisition_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT purchase_requisition_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_requisitions purchase_requisitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT purchase_requisitions_pkey PRIMARY KEY (id);


--
-- Name: reconciliations reconciliations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reconciliations
    ADD CONSTRAINT reconciliations_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: salary_bands salary_bands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_bands
    ADD CONSTRAINT salary_bands_pkey PRIMARY KEY (id);


--
-- Name: salary_heads salary_heads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_heads
    ADD CONSTRAINT salary_heads_pkey PRIMARY KEY (id);


--
-- Name: statutory_rules statutory_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statutory_rules
    ADD CONSTRAINT statutory_rules_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_transfer_lines stock_transfer_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_lines
    ADD CONSTRAINT stock_transfer_lines_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: tax_rules tax_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rules
    ADD CONSTRAINT tax_rules_pkey PRIMARY KEY (id);


--
-- Name: timesheets timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_pkey PRIMARY KEY (id);


--
-- Name: training_enrollments training_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_enrollments
    ADD CONSTRAINT training_enrollments_pkey PRIMARY KEY (id);


--
-- Name: training_programs training_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);


--
-- Name: training_sessions training_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_pkey PRIMARY KEY (id);


--
-- Name: expense_requests uk_11d45jan07sk3mx2k60h4hq9s; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests
    ADD CONSTRAINT uk_11d45jan07sk3mx2k60h4hq9s UNIQUE (request_number);


--
-- Name: projects uk_1batb7mq0elcfcs3d6maqo6sg; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT uk_1batb7mq0elcfcs3d6maqo6sg UNIQUE (project_code);


--
-- Name: job_postings uk_20a0ufrh4lo005px2ubf5nsoe; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT uk_20a0ufrh4lo005px2ubf5nsoe UNIQUE (posting_number);


--
-- Name: document_categories uk_28aa8ru80aogmpgjqqcaop556; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT uk_28aa8ru80aogmpgjqqcaop556 UNIQUE (code);


--
-- Name: expense_centers uk_2gefnonadkwv19wmqydml0kb0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_centers
    ADD CONSTRAINT uk_2gefnonadkwv19wmqydml0kb0 UNIQUE (code);


--
-- Name: document_types uk_38wlce45ecy6m472frk5um7t0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT uk_38wlce45ecy6m472frk5um7t0 UNIQUE (code);


--
-- Name: job_roles uk_3mvsxqtyajl2a26moa5y564te; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT uk_3mvsxqtyajl2a26moa5y564te UNIQUE (code);


--
-- Name: offer_letters uk_4e4c7qsjd04xligtapi2due19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT uk_4e4c7qsjd04xligtapi2due19 UNIQUE (offer_number);


--
-- Name: pr_stock_fulfillments uk_4f2a04s6v8qvse27sktrnmmxv; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillments
    ADD CONSTRAINT uk_4f2a04s6v8qvse27sktrnmmxv UNIQUE (fulfillment_number);


--
-- Name: purchase_invoices uk_5liy2dbo5i8bfli5lcyoafg87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT uk_5liy2dbo5i8bfli5lcyoafg87 UNIQUE (invoice_number);


--
-- Name: units_of_measure uk_5qom3av4hskdq3ykwx2f13yw8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_of_measure
    ADD CONSTRAINT uk_5qom3av4hskdq3ykwx2f13yw8 UNIQUE (code);


--
-- Name: chart_of_accounts uk_62a4crs7s8ypnqi9u76qtc0du; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT uk_62a4crs7s8ypnqi9u76qtc0du UNIQUE (account_code);


--
-- Name: users uk_6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: warehouses uk_6herdbg4x5wp6gkor8epv73oc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT uk_6herdbg4x5wp6gkor8epv73oc UNIQUE (code);


--
-- Name: journal_entries uk_6vtg8oj18vbcqphqfokc7qtvf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT uk_6vtg8oj18vbcqphqfokc7qtvf UNIQUE (entry_number);


--
-- Name: pr_material_transfers uk_6vyyoihw58in31dre6wwn1f4l; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfers
    ADD CONSTRAINT uk_6vyyoihw58in31dre6wwn1f4l UNIQUE (transfer_number);


--
-- Name: bills uk_7959pofuil5cipraog67b4j29; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT uk_7959pofuil5cipraog67b4j29 UNIQUE (bill_number);


--
-- Name: pay_frequencies uk_7byukoubqtwj58vloncfot030; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_frequencies
    ADD CONSTRAINT uk_7byukoubqtwj58vloncfot030 UNIQUE (code);


--
-- Name: branch_settings uk_7guyk1e2oddj7s8sdicy1b4dj; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_settings
    ADD CONSTRAINT uk_7guyk1e2oddj7s8sdicy1b4dj UNIQUE (branch_id);


--
-- Name: timesheets uk_7vu38y4wivk9oafyjekws81ec; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT uk_7vu38y4wivk9oafyjekws81ec UNIQUE (timesheet_number);


--
-- Name: suppliers uk_8kh5crh75ye2imfi5yv37p61o; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT uk_8kh5crh75ye2imfi5yv37p61o UNIQUE (code);


--
-- Name: items uk_9obt5anl2008e5xmt7r1cuwf2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT uk_9obt5anl2008e5xmt7r1cuwf2 UNIQUE (code);


--
-- Name: purchase_requisitions uk_acq28gdu7djeuc6dcpny7cwh7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requisitions
    ADD CONSTRAINT uk_acq28gdu7djeuc6dcpny7cwh7 UNIQUE (pr_number);


--
-- Name: contracts uk_bx9jyu2cccdntb3ehrf0ojpfd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT uk_bx9jyu2cccdntb3ehrf0ojpfd UNIQUE (contract_number);


--
-- Name: leave_types uk_c7knnvg6a1wkmt3f2gciae83e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT uk_c7knnvg6a1wkmt3f2gciae83e UNIQUE (code);


--
-- Name: onboarding_plans uk_dd54kc0qjn7p2l9h766vdhp2h; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_plans
    ADD CONSTRAINT uk_dd54kc0qjn7p2l9h766vdhp2h UNIQUE (plan_number);


--
-- Name: payroll_runs uk_e3p6excg6sofrak2kx6p5oox3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT uk_e3p6excg6sofrak2kx6p5oox3 UNIQUE (payroll_run_number);


--
-- Name: goods_receipts uk_eb2v8agd6eb7lv2kdxt9ir2vl; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT uk_eb2v8agd6eb7lv2kdxt9ir2vl UNIQUE (grn_number);


--
-- Name: hr_letters uk_elja6jmadfsf7feqfpcg5q0dr; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_letters
    ADD CONSTRAINT uk_elja6jmadfsf7feqfpcg5q0dr UNIQUE (letter_number);


--
-- Name: job_requisitions uk_esmtenkiiwrhy304gcpifstdv; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT uk_esmtenkiiwrhy304gcpifstdv UNIQUE (requisition_number);


--
-- Name: employees uk_etqhw9qqnad1kyjq3ks1glw8x; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT uk_etqhw9qqnad1kyjq3ks1glw8x UNIQUE (employee_code);


--
-- Name: salary_bands uk_f4358m7qu5iq8qi60xbh0lfjp; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_bands
    ADD CONSTRAINT uk_f4358m7qu5iq8qi60xbh0lfjp UNIQUE (band_code);


--
-- Name: expense_categories uk_f6jlej8txbi96jpr2757v48mf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT uk_f6jlej8txbi96jpr2757v48mf UNIQUE (code);


--
-- Name: item_groups uk_ffl8mxcsx3wuvi6qmabjnvlvh; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_groups
    ADD CONSTRAINT uk_ffl8mxcsx3wuvi6qmabjnvlvh UNIQUE (code);


--
-- Name: salary_heads uk_flwm97j3kqpl436krm823jgcc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_heads
    ADD CONSTRAINT uk_flwm97j3kqpl436krm823jgcc UNIQUE (code);


--
-- Name: statutory_rules uk_g594jr7wd28prx4u9rvq1jfre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statutory_rules
    ADD CONSTRAINT uk_g594jr7wd28prx4u9rvq1jfre UNIQUE (code);


--
-- Name: candidates uk_gs6ida522y5uqhkexv78lk8sk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT uk_gs6ida522y5uqhkexv78lk8sk UNIQUE (candidate_number);


--
-- Name: stock_transfers uk_ick25fueer7ic8lpb758bj6b7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT uk_ick25fueer7ic8lpb758bj6b7 UNIQUE (transfer_number);


--
-- Name: goods_issues uk_if85s26ol0ppaxlwkqt61oq36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT uk_if85s26ol0ppaxlwkqt61oq36 UNIQUE (issue_number);


--
-- Name: benefit_plans uk_imuvl110acq7m6syjm699ni4t; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_plans
    ADD CONSTRAINT uk_imuvl110acq7m6syjm699ni4t UNIQUE (plan_code);


--
-- Name: tax_rules uk_jfaikg5ad4rh2xyufuhwa8oon; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rules
    ADD CONSTRAINT uk_jfaikg5ad4rh2xyufuhwa8oon UNIQUE (code);


--
-- Name: departments uk_l7tivi5261wxdnvo6cct9gg6t; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uk_l7tivi5261wxdnvo6cct9gg6t UNIQUE (code);


--
-- Name: branches uk_l7u7xwdqhqihnhh3dmvi1gf3k; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT uk_l7u7xwdqhqihnhh3dmvi1gf3k UNIQUE (slug);


--
-- Name: loan_applications uk_lmmebb2xnyy3oghe068hwcc1x; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT uk_lmmebb2xnyy3oghe068hwcc1x UNIQUE (application_number);


--
-- Name: training_sessions uk_mgjc7paa5p249twiud7rj6k14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT uk_mgjc7paa5p249twiud7rj6k14 UNIQUE (session_code);


--
-- Name: locations uk_njcw38t3qcy312pglqpf3pd59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT uk_njcw38t3qcy312pglqpf3pd59 UNIQUE (code);


--
-- Name: stock_adjustments uk_nmisxi6vihfcie4tbnvvnaoya; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT uk_nmisxi6vihfcie4tbnvvnaoya UNIQUE (adjustment_number);


--
-- Name: account_transfers uk_nxd2df6dgusrgcd9796q68p1q; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_transfers
    ADD CONSTRAINT uk_nxd2df6dgusrgcd9796q68p1q UNIQUE (transfer_number);


--
-- Name: grades uk_oc73nogh3vc7kxlkrmsqcv54g; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT uk_oc73nogh3vc7kxlkrmsqcv54g UNIQUE (code);


--
-- Name: project_timesheets uk_q1p559lnrowv99jhum83qcmmx; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_timesheets
    ADD CONSTRAINT uk_q1p559lnrowv99jhum83qcmmx UNIQUE (project_timesheet_number);


--
-- Name: cost_centers uk_q36p8t74uka38c6rtduhxdpq5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT uk_q36p8t74uka38c6rtduhxdpq5 UNIQUE (code);


--
-- Name: training_programs uk_q4v4hy51yamx2diw0jj3j8pum; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT uk_q4v4hy51yamx2diw0jj3j8pum UNIQUE (program_code);


--
-- Name: users uk_r43af9ap4edm43mmtq01oddj6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_r43af9ap4edm43mmtq01oddj6 UNIQUE (username);


--
-- Name: attendance_rules uk_rct9s6uc9e1dsgn54je6lyott; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_rules
    ADD CONSTRAINT uk_rct9s6uc9e1dsgn54je6lyott UNIQUE (rule_name);


--
-- Name: branches uk_rt29b5cpquhexus5t5ywalg67; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT uk_rt29b5cpquhexus5t5ywalg67 UNIQUE (code);


--
-- Name: designations uk_rx6p8y6ibd6bg12nse7xkkb10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT uk_rx6p8y6ibd6bg12nse7xkkb10 UNIQUE (code);


--
-- Name: final_settlements uk_s51ixesbd1pwpram3wuuh5e5s; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_settlements
    ADD CONSTRAINT uk_s51ixesbd1pwpram3wuuh5e5s UNIQUE (settlement_number);


--
-- Name: overtime_rules uk_tipi2h2jas2dkvf5ktrkw0rkg; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overtime_rules
    ADD CONSTRAINT uk_tipi2h2jas2dkvf5ktrkw0rkg UNIQUE (code);


--
-- Name: attendance_records ukilyruflg6d3m4uo2dusdabwp9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT ukilyruflg6d3m4uo2dusdabwp9 UNIQUE (employee_id, attendance_date);


--
-- Name: roles ukkdiskajtbublqaj08dh4cjr4v; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT ukkdiskajtbublqaj08dh4cjr4v UNIQUE (name, branch_id);


--
-- Name: bins ukq1oemp3lkrh4lppd5jxcd6hqu; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bins
    ADD CONSTRAINT ukq1oemp3lkrh4lppd5jxcd6hqu UNIQUE (code, warehouse_id);


--
-- Name: units_of_measure units_of_measure_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_of_measure
    ADD CONSTRAINT units_of_measure_pkey PRIMARY KEY (id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: valuation_cost_layers valuation_cost_layers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valuation_cost_layers
    ADD CONSTRAINT valuation_cost_layers_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: pr_stock_fulfillments fk16v5jvgoe2rc6px96ioxssaai; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillments
    ADD CONSTRAINT fk16v5jvgoe2rc6px96ioxssaai FOREIGN KEY (from_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: items fk19no9r2d31i2g27fh8h72xif8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT fk19no9r2d31i2g27fh8h72xif8 FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: stock_transfers fk1a7ck2ceraf7yvx8oyalg6qcl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk1a7ck2ceraf7yvx8oyalg6qcl FOREIGN KEY (from_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: timesheets fk1kh6fh0x1cx8x7duxn786arv2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT fk1kh6fh0x1cx8x7duxn786arv2 FOREIGN KEY (pay_frequency_id) REFERENCES public.pay_frequencies(id);


--
-- Name: journal_lines fk1mucajfkxo6i8ldmy61xsaf85; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT fk1mucajfkxo6i8ldmy61xsaf85 FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id);


--
-- Name: bills fk1pbkwt14h7hs3kneae327tfdn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT fk1pbkwt14h7hs3kneae327tfdn FOREIGN KEY (payable_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: pr_fulfillment_items fk21jyllahatnfp4fhmcm4pbrp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_fulfillment_items
    ADD CONSTRAINT fk21jyllahatnfp4fhmcm4pbrp FOREIGN KEY (pr_fulfillment_id) REFERENCES public.pr_fulfillments(id);


--
-- Name: leave_requests fk26il0qrl79p6etqwn0ae6l43b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk26il0qrl79p6etqwn0ae6l43b FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: employee_documents fk28g0aba9xtbkf6bp9pnvtcw5e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT fk28g0aba9xtbkf6bp9pnvtcw5e FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: timesheets fk2hwwbmujjb8y8qqkrxx9yog38; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT fk2hwwbmujjb8y8qqkrxx9yog38 FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employee_benefits fk2o4pgfj3ohbhrg6h8oubfmxpg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_benefits
    ADD CONSTRAINT fk2o4pgfj3ohbhrg6h8oubfmxpg FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: purchase_requisition_items fk2p4q3jcjyu3chrrr7lwt5pjqq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requisition_items
    ADD CONSTRAINT fk2p4q3jcjyu3chrrr7lwt5pjqq FOREIGN KEY (purchase_requisition_id) REFERENCES public.purchase_requisitions(id);


--
-- Name: payroll_runs fk2pwpr3lhv3p8ai9eq2al0bqk3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT fk2pwpr3lhv3p8ai9eq2al0bqk3 FOREIGN KEY (processed_by) REFERENCES public.employees(id);


--
-- Name: project_time_entries fk3521qr0qc2bpoi8w9yv5m0p2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT fk3521qr0qc2bpoi8w9yv5m0p2e FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: valuation_cost_layers fk35jws5tfcn3y2j706mymui0jb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valuation_cost_layers
    ADD CONSTRAINT fk35jws5tfcn3y2j706mymui0jb FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_transfer_lines fk385e9k6s4tb6k70gy7fq2s493; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_lines
    ADD CONSTRAINT fk385e9k6s4tb6k70gy7fq2s493 FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: offer_letters fk38v479ren53n4872qm5gxpwux; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT fk38v479ren53n4872qm5gxpwux FOREIGN KEY (requisition_id) REFERENCES public.job_requisitions(id);


--
-- Name: training_sessions fk3cee6uijj2mfh6674s7qdrutg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT fk3cee6uijj2mfh6674s7qdrutg FOREIGN KEY (trainer_id) REFERENCES public.employees(id);


--
-- Name: expense_requests fk3e43knnphync6d886jtriol23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests
    ADD CONSTRAINT fk3e43knnphync6d886jtriol23 FOREIGN KEY (category_id) REFERENCES public.expense_categories(id);


--
-- Name: expense_categories fk3jmrwv3u8p2m0xkw73hw852lx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT fk3jmrwv3u8p2m0xkw73hw852lx FOREIGN KEY (parent_id) REFERENCES public.expense_categories(id);


--
-- Name: leave_requests fk477vcd3me3ywsipqy7ch4l3ak; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk477vcd3me3ywsipqy7ch4l3ak FOREIGN KEY (hr_approved_by) REFERENCES public.employees(id);


--
-- Name: expense_requests fk4bjhasj2tfsr7od5d9o9v7fl9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests
    ADD CONSTRAINT fk4bjhasj2tfsr7od5d9o9v7fl9 FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: stock_adjustments fk4jmgcv1wfvsg5yes9d9jau4ke; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT fk4jmgcv1wfvsg5yes9d9jau4ke FOREIGN KEY (bin_id) REFERENCES public.bins(id);


--
-- Name: goods_receipt_lines fk4o9d0o7m5ciw5kn42molohb5n; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_lines
    ADD CONSTRAINT fk4o9d0o7m5ciw5kn42molohb5n FOREIGN KEY (bin_id) REFERENCES public.bins(id);


--
-- Name: projects fk4rpwuljjwr5rygq9gwx36q8cj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk4rpwuljjwr5rygq9gwx36q8cj FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: goods_issues fk4ugj8rj7qtxiqtbk1i9xjltrq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT fk4ugj8rj7qtxiqtbk1i9xjltrq FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: cost_centers fk4x55atfitrh24udywpby5v8g6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT fk4x55atfitrh24udywpby5v8g6 FOREIGN KEY (parent_id) REFERENCES public.cost_centers(id);


--
-- Name: interviews fk4yhqbcuvek69rr37nr6lwau77; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk4yhqbcuvek69rr37nr6lwau77 FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: payroll_runs fk55hjyjcl9v2hqp7217vi2wvv8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT fk55hjyjcl9v2hqp7217vi2wvv8 FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: goods_issues fk5e53pl5548uslnhflvx04gr8w; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT fk5e53pl5548uslnhflvx04gr8w FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: onboarding_tasks fk5ma2m0u5wyxwuky73ob6ocrbj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_tasks
    ADD CONSTRAINT fk5ma2m0u5wyxwuky73ob6ocrbj FOREIGN KEY (onboarding_plan_id) REFERENCES public.onboarding_plans(id);


--
-- Name: account_mappings fk5ypx99kof2f5dtlcbqj8jsd2m; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_mappings
    ADD CONSTRAINT fk5ypx99kof2f5dtlcbqj8jsd2m FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: departments fk63q917a0aq92i7gcw6h7f1jrv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk63q917a0aq92i7gcw6h7f1jrv FOREIGN KEY (parent_id) REFERENCES public.departments(id);


--
-- Name: project_members fk6hb0s9g0u21ta4s0bkrghncce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT fk6hb0s9g0u21ta4s0bkrghncce FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: leave_requests fk6knepvdp7rg12739qryd09kfk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk6knepvdp7rg12739qryd09kfk FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: reconciliations fk6r9i4874k9tqr9kmxgrd5jr5i; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reconciliations
    ADD CONSTRAINT fk6r9i4874k9tqr9kmxgrd5jr5i FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: onboarding_plans fk6tdnwl27i2jkl9vp4hg5pwi1f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_plans
    ADD CONSTRAINT fk6tdnwl27i2jkl9vp4hg5pwi1f FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: expense_centers fk75ikrmowu5wms5sc7i6w95bb9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_centers
    ADD CONSTRAINT fk75ikrmowu5wms5sc7i6w95bb9 FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: offer_letters fk7hpsxa496k6owu2p51k38eeod; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT fk7hpsxa496k6owu2p51k38eeod FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: stock_transfer_lines fk7kdcm8artygilcf58hbiepjg9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_lines
    ADD CONSTRAINT fk7kdcm8artygilcf58hbiepjg9 FOREIGN KEY (to_bin_id) REFERENCES public.bins(id);


--
-- Name: offer_letters fk7mv69klkgvra2akut38soypve; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT fk7mv69klkgvra2akut38soypve FOREIGN KEY (reporting_to_id) REFERENCES public.employees(id);


--
-- Name: offer_letters fk7ngr0x0tebb1mkfepkfaamevc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT fk7ngr0x0tebb1mkfepkfaamevc FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: account_transfers fk7p3bo7qddqmglqlxqu34k8j5b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_transfers
    ADD CONSTRAINT fk7p3bo7qddqmglqlxqu34k8j5b FOREIGN KEY (to_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: purchase_invoice_items fk7r71qrg9eopupmxcf5c3ryntt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice_items
    ADD CONSTRAINT fk7r71qrg9eopupmxcf5c3ryntt FOREIGN KEY (invoice_id) REFERENCES public.purchase_invoices(id);


--
-- Name: departments fk7vwo2ly0jp0gh7y1l9utan0q8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk7vwo2ly0jp0gh7y1l9utan0q8 FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: leave_requests fk821ds0ic5kvai8wcjr9amp4j6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk821ds0ic5kvai8wcjr9amp4j6 FOREIGN KEY (manager_approved_by) REFERENCES public.employees(id);


--
-- Name: payroll_records fk841j0c630blmy06rvop9ky76o; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT fk841j0c630blmy06rvop9ky76o FOREIGN KEY (timesheet_id) REFERENCES public.timesheets(id);


--
-- Name: leave_balances fk86791wotycqa54js45s9396wy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT fk86791wotycqa54js45s9396wy FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: goods_receipt_lines fk911tv4c70yqo1u58rdfa0pf5w; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_lines
    ADD CONSTRAINT fk911tv4c70yqo1u58rdfa0pf5w FOREIGN KEY (goods_receipt_id) REFERENCES public.goods_receipts(id);


--
-- Name: employee_assets fk9c2xetk92o2ibip3x0gbcal1n; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_assets
    ADD CONSTRAINT fk9c2xetk92o2ibip3x0gbcal1n FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: attendance_records fk9i546p78s8xmw82howmttgek8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT fk9i546p78s8xmw82howmttgek8 FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: units_of_measure fk9n3cue304bkohx0dq79hsfp6v; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_of_measure
    ADD CONSTRAINT fk9n3cue304bkohx0dq79hsfp6v FOREIGN KEY (base_uom_id) REFERENCES public.units_of_measure(id);


--
-- Name: users fk9o70sp9ku40077y38fk4wieyk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk9o70sp9ku40077y38fk4wieyk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: onboarding_plans fk9tntyk9ayyhh1nsnmgdiwxfql; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_plans
    ADD CONSTRAINT fk9tntyk9ayyhh1nsnmgdiwxfql FOREIGN KEY (buddy_id) REFERENCES public.employees(id);


--
-- Name: goods_issue_lines fk9xd0vi9lw8m5wye3fa2389jcf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_lines
    ADD CONSTRAINT fk9xd0vi9lw8m5wye3fa2389jcf FOREIGN KEY (goods_issue_id) REFERENCES public.goods_issues(id);


--
-- Name: account_transfers fka09g62k9ignhd8r91eqvmekwj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_transfers
    ADD CONSTRAINT fka09g62k9ignhd8r91eqvmekwj FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id);


--
-- Name: departments fka1wtn2bsud212rdljgsc6xnb1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fka1wtn2bsud212rdljgsc6xnb1 FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: pr_stock_fulfillment_items fka2na0qspbc6pt786ete27g45g; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillment_items
    ADD CONSTRAINT fka2na0qspbc6pt786ete27g45g FOREIGN KEY (stock_fulfillment_id) REFERENCES public.pr_stock_fulfillments(id);


--
-- Name: onboarding_plans fkade7hrdl8t6dgvu9okwnd8lbx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_plans
    ADD CONSTRAINT fkade7hrdl8t6dgvu9okwnd8lbx FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: job_postings fkaemf8nw2hv83rfr0n88hildo9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT fkaemf8nw2hv83rfr0n88hildo9 FOREIGN KEY (requisition_id) REFERENCES public.job_requisitions(id);


--
-- Name: project_timesheets fkanh8r1anievpb6dfrk80981o7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_timesheets
    ADD CONSTRAINT fkanh8r1anievpb6dfrk80981o7 FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: items fkau23lo2g59km785iq1lstn7x2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT fkau23lo2g59km785iq1lstn7x2 FOREIGN KEY (uom_id) REFERENCES public.units_of_measure(id);


--
-- Name: expense_items fkayi8j9gindb94p7fwgo32pjyt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_items
    ADD CONSTRAINT fkayi8j9gindb94p7fwgo32pjyt FOREIGN KEY (expense_request_id) REFERENCES public.expense_requests(id);


--
-- Name: pr_material_transfer_items fkayqhpbv762albaqkh0jjvcwtd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfer_items
    ADD CONSTRAINT fkayqhpbv762albaqkh0jjvcwtd FOREIGN KEY (material_transfer_id) REFERENCES public.pr_material_transfers(id);


--
-- Name: bank_accounts fkb971ymuh659i7c9l7l9taoa18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT fkb971ymuh659i7c9l7l9taoa18 FOREIGN KEY (gl_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: onboarding_plans fkbn1ogcuqmcijcm07bwpu8e6gj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_plans
    ADD CONSTRAINT fkbn1ogcuqmcijcm07bwpu8e6gj FOREIGN KEY (hr_coordinator_id) REFERENCES public.employees(id);


--
-- Name: bank_transactions fkbsx5au2h0d5vssvbvxblv04un; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT fkbsx5au2h0d5vssvbvxblv04un FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id);


--
-- Name: goods_receipts fkc0gr14mkdrel00cgjqfmpfk8g; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT fkc0gr14mkdrel00cgjqfmpfk8g FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: employees fkc34kaudmw4k8s78ly7ngyitac; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkc34kaudmw4k8s78ly7ngyitac FOREIGN KEY (expense_center_id) REFERENCES public.expense_centers(id);


--
-- Name: loan_applications fkcdmahycwicrdmfv7puaj014xj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT fkcdmahycwicrdmfv7puaj014xj FOREIGN KEY (approved_by_id) REFERENCES public.employees(id);


--
-- Name: employee_documents fkci02iiw0bg6i1rsnt14boyc2h; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT fkci02iiw0bg6i1rsnt14boyc2h FOREIGN KEY (document_type_id) REFERENCES public.document_types(id);


--
-- Name: final_settlements fkcup34ty7wcxj7x09m1wjhxckc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_settlements
    ADD CONSTRAINT fkcup34ty7wcxj7x09m1wjhxckc FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employee_experience fkcv1hvbh746mvsnycur9njvrgb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_experience
    ADD CONSTRAINT fkcv1hvbh746mvsnycur9njvrgb FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: warehouses fkcvcrgkp6ixevq51lcx8vnow8v; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT fkcvcrgkp6ixevq51lcx8vnow8v FOREIGN KEY (default_bin_id) REFERENCES public.bins(id);


--
-- Name: bins fkd03ymbk4w9ntgiqnxq0tl7sgo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bins
    ADD CONSTRAINT fkd03ymbk4w9ntgiqnxq0tl7sgo FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: chart_of_accounts fkd8em4xdtwfid8tevxx2sxy5wh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT fkd8em4xdtwfid8tevxx2sxy5wh FOREIGN KEY (category_id) REFERENCES public.account_categories(id);


--
-- Name: journal_lines fkdeuud5g3qu39w209hdcgi5dao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT fkdeuud5g3qu39w209hdcgi5dao FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: project_members fkdki1sp2homqsdcvqm9yrix31g; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT fkdki1sp2homqsdcvqm9yrix31g FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: training_enrollments fkdlaj9iqw2swc82ak57wu7cb1k; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_enrollments
    ADD CONSTRAINT fkdlaj9iqw2swc82ak57wu7cb1k FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employees fke4i9i8vu1j96m71g4v98kqirb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fke4i9i8vu1j96m71g4v98kqirb FOREIGN KEY (designation_id) REFERENCES public.designations(id);


--
-- Name: job_requisitions fke7qee6mh6vm3wb4o298tm619x; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT fke7qee6mh6vm3wb4o298tm619x FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: expense_requests fkee26jkxlvr61vv6i690py501k; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests
    ADD CONSTRAINT fkee26jkxlvr61vv6i690py501k FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: expense_requests fkegxyxyxq4k4j54hhf6b0o91es; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests
    ADD CONSTRAINT fkegxyxyxq4k4j54hhf6b0o91es FOREIGN KEY (approver_id) REFERENCES public.employees(id);


--
-- Name: job_requisitions fkellc783vvoqah0ff0y3rx39ed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT fkellc783vvoqah0ff0y3rx39ed FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: loan_repayments fkepelu0tbsh8o78win4jsossp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayments
    ADD CONSTRAINT fkepelu0tbsh8o78win4jsossp FOREIGN KEY (payroll_record_id) REFERENCES public.payroll_records(id);


--
-- Name: budget_lines fkepl6fe246425xqd22qd0hsrp1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT fkepl6fe246425xqd22qd0hsrp1 FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: project_milestones fkf89i5mou2qk96lrjgb8of4mdq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT fkf89i5mou2qk96lrjgb8of4mdq FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: salary_bands fkfdk3b19usa9kn6ejgw86843pp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_bands
    ADD CONSTRAINT fkfdk3b19usa9kn6ejgw86843pp FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id);


--
-- Name: account_transfers fkfgyjk05fmpooft6uhqipbinat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_transfers
    ADD CONSTRAINT fkfgyjk05fmpooft6uhqipbinat FOREIGN KEY (from_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: inventory_ledger fkfomsiyijjibq4p1jhmsl5abuk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT fkfomsiyijjibq4p1jhmsl5abuk FOREIGN KEY (bin_id) REFERENCES public.bins(id);


--
-- Name: integration_sync_logs fkfpoed4v0bp3tikc6vq79xme6b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_sync_logs
    ADD CONSTRAINT fkfpoed4v0bp3tikc6vq79xme6b FOREIGN KEY (integration_id) REFERENCES public.integration_configs(id);


--
-- Name: project_tasks fkfpormum97m1311d9t1nohfj7a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fkfpormum97m1311d9t1nohfj7a FOREIGN KEY (assignee_id) REFERENCES public.employees(id);


--
-- Name: valuation_cost_layers fkful21d9drbuq6akvn9rrb18pk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valuation_cost_layers
    ADD CONSTRAINT fkful21d9drbuq6akvn9rrb18pk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: job_roles fkfy07rcm9lcfodtbxk9r1y4dhg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT fkfy07rcm9lcfodtbxk9r1y4dhg FOREIGN KEY (grade_id) REFERENCES public.grades(id);


--
-- Name: employees fkgawtrwvxw4uu0ppt5h8w5go; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkgawtrwvxw4uu0ppt5h8w5go FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: salary_bands fkgcientq90ese52eisu65qxh99; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_bands
    ADD CONSTRAINT fkgcientq90ese52eisu65qxh99 FOREIGN KEY (grade_id) REFERENCES public.grades(id);


--
-- Name: contracts fkgcu7bfqv1j7nltm5uhk91kxcy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT fkgcu7bfqv1j7nltm5uhk91kxcy FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: journal_entries fkgdc0j7tkmvuxde7phugmetuob; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT fkgdc0j7tkmvuxde7phugmetuob FOREIGN KEY (fiscal_period_id) REFERENCES public.fiscal_periods(id);


--
-- Name: payroll_records fkgpsypgkt2vtal97qpy8kcxq6h; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT fkgpsypgkt2vtal97qpy8kcxq6h FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id);


--
-- Name: banking_rules fkgr3sn3ms8r9j2x5d6kdf6nb8l; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banking_rules
    ADD CONSTRAINT fkgr3sn3ms8r9j2x5d6kdf6nb8l FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: job_requisitions fkgwcfx6f8sjkpwkm9e82s2jh30; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT fkgwcfx6f8sjkpwkm9e82s2jh30 FOREIGN KEY (grade_id) REFERENCES public.grades(id);


--
-- Name: employees fkgy4qe3dnqrm3ktd76sxp7n4c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkgy4qe3dnqrm3ktd76sxp7n4c2 FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: pr_stock_fulfillments fkh88v4v3xo6052d0h30n2hbky9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillments
    ADD CONSTRAINT fkh88v4v3xo6052d0h30n2hbky9 FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: bills fkhj7ecvyj06chhy8dd5a73j829; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT fkhj7ecvyj06chhy8dd5a73j829 FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: project_tasks fkhsx8wvsrs7t8x9hq10jncbisx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fkhsx8wvsrs7t8x9hq10jncbisx FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: budget_lines fki4uhxqhlr9ni14es0hgtkiqr5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT fki4uhxqhlr9ni14es0hgtkiqr5 FOREIGN KEY (budget_id) REFERENCES public.budgets(id);


--
-- Name: banking_rules fkio71bmeg2ntb68yvgjoib898e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banking_rules
    ADD CONSTRAINT fkio71bmeg2ntb68yvgjoib898e FOREIGN KEY (assign_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: employees fkirh0a5q2en4gkbayqhgfiwhs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkirh0a5q2en4gkbayqhgfiwhs FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: project_time_entries fkiytgjnt8xckrp8e291jvuupyx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_time_entries
    ADD CONSTRAINT fkiytgjnt8xckrp8e291jvuupyx FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employees fkj5dawmyfw3dmtixnsrr6cbk63; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkj5dawmyfw3dmtixnsrr6cbk63 FOREIGN KEY (reporting_manager_id) REFERENCES public.employees(id);


--
-- Name: projects fkjhkgnbg8chh6ke9y4110vcpx0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fkjhkgnbg8chh6ke9y4110vcpx0 FOREIGN KEY (project_manager_id) REFERENCES public.employees(id);


--
-- Name: candidates fkjixipl9u70cp8mynr0b3nvvmb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fkjixipl9u70cp8mynr0b3nvvmb FOREIGN KEY (assigned_recruiter_id) REFERENCES public.employees(id);


--
-- Name: goods_issue_lines fkjne489xn4oh04b3vsudco8uqp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_lines
    ADD CONSTRAINT fkjne489xn4oh04b3vsudco8uqp FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: goods_issue_lines fkk32qlqdbobekjln5ojk8v1jxg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_lines
    ADD CONSTRAINT fkk32qlqdbobekjln5ojk8v1jxg FOREIGN KEY (bin_id) REFERENCES public.bins(id);


--
-- Name: loan_repayments fkk61sxs1t0kkr3y6t48xu9waib; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayments
    ADD CONSTRAINT fkk61sxs1t0kkr3y6t48xu9waib FOREIGN KEY (loan_id) REFERENCES public.loan_applications(id);


--
-- Name: expense_requests fkkc68fbrcu3b5qv9dtfp9rv1kn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_requests
    ADD CONSTRAINT fkkc68fbrcu3b5qv9dtfp9rv1kn FOREIGN KEY (payroll_record_id) REFERENCES public.payroll_records(id);


--
-- Name: branch_settings fkkmne33mlqlb6a5byap24e0je6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_settings
    ADD CONSTRAINT fkkmne33mlqlb6a5byap24e0je6 FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: hr_letters fkksy8of3oo6h0s5nl885hj2591; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_letters
    ADD CONSTRAINT fkksy8of3oo6h0s5nl885hj2591 FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: pr_stock_fulfillments fkkwtq2siyp61f27t1401vcxhdk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_stock_fulfillments
    ADD CONSTRAINT fkkwtq2siyp61f27t1401vcxhdk FOREIGN KEY (purchase_requisition_id) REFERENCES public.purchase_requisitions(id);


--
-- Name: goods_receipt_lines fkkyb5k22b0wc8r6o8uw81nkugt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_lines
    ADD CONSTRAINT fkkyb5k22b0wc8r6o8uw81nkugt FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: job_requisitions fkl32y1rujdod2weg4hojdy7m4s; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT fkl32y1rujdod2weg4hojdy7m4s FOREIGN KEY (reporting_to_id) REFERENCES public.employees(id);


--
-- Name: pr_material_transfers fkl8sudaud3i1hhq0jf5k7stq6g; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfers
    ADD CONSTRAINT fkl8sudaud3i1hhq0jf5k7stq6g FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: bank_transactions fklcu39w7fixvl9kv21tfx9tbhm; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT fklcu39w7fixvl9kv21tfx9tbhm FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: employee_bank_details fklubeqplhmxo40vv4ao87yptj2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_bank_details
    ADD CONSTRAINT fklubeqplhmxo40vv4ao87yptj2 FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: account_mappings fkm3r7rtqyouttrwf5bcra6x4nq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_mappings
    ADD CONSTRAINT fkm3r7rtqyouttrwf5bcra6x4nq FOREIGN KEY (debit_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: training_enrollments fkmavemcuhqxfeq0mqwn73iloft; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_enrollments
    ADD CONSTRAINT fkmavemcuhqxfeq0mqwn73iloft FOREIGN KEY (session_id) REFERENCES public.training_sessions(id);


--
-- Name: employees fkmef7fp4oyblw7d2y3g1whac3o; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkmef7fp4oyblw7d2y3g1whac3o FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: leave_balances fkmvepkwsegu6bt3ps5rfh1dx92; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT fkmvepkwsegu6bt3ps5rfh1dx92 FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: job_requisitions fkn0rgnggeiurdgfe4ylyreinhq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT fkn0rgnggeiurdgfe4ylyreinhq FOREIGN KEY (requested_by_id) REFERENCES public.employees(id);


--
-- Name: payroll_records fkn5gkwhuhl0ars0bjwj2y7y7xt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT fkn5gkwhuhl0ars0bjwj2y7y7xt FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: inventory_ledger fkn86fqcgf75a2xcjpuimi0lwrc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT fkn86fqcgf75a2xcjpuimi0lwrc FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: offer_letters fkn8biukllrlbotqmjdbh82luaw; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT fkn8biukllrlbotqmjdbh82luaw FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: offer_letters fknaak086s5ng6xuq9v5fxnttk2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT fknaak086s5ng6xuq9v5fxnttk2 FOREIGN KEY (approved_by_id) REFERENCES public.employees(id);


--
-- Name: loan_applications fknedmm3jbtp1rae3y9yvfh15cn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT fknedmm3jbtp1rae3y9yvfh15cn FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employee_salaries fknh6u7856p9kbeyl7tlqxb52ve; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_salaries
    ADD CONSTRAINT fknh6u7856p9kbeyl7tlqxb52ve FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: account_mappings fknu75xv7d42anxvvnqpgw1h4p7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_mappings
    ADD CONSTRAINT fknu75xv7d42anxvvnqpgw1h4p7 FOREIGN KEY (credit_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: employees fknunfrg7sx9on0r5gwvv48vfv0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fknunfrg7sx9on0r5gwvv48vfv0 FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id);


--
-- Name: bank_transactions fknv6ikqei88653lmok0v68b5xy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT fknv6ikqei88653lmok0v68b5xy FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: pr_material_transfers fko19249sjc31s55bg7c2ixu68r; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pr_material_transfers
    ADD CONSTRAINT fko19249sjc31s55bg7c2ixu68r FOREIGN KEY (purchase_requisition_id) REFERENCES public.purchase_requisitions(id);


--
-- Name: bill_lines fko26trkuhk8t4ehp4mdvs1b6x6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_lines
    ADD CONSTRAINT fko26trkuhk8t4ehp4mdvs1b6x6 FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: hr_letters fkocs0nf73akra3u3xeyvlkcuee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_letters
    ADD CONSTRAINT fkocs0nf73akra3u3xeyvlkcuee FOREIGN KEY (approved_by_id) REFERENCES public.employees(id);


--
-- Name: candidates fkoe0856gvdr227x6x9f5n8eh4n; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fkoe0856gvdr227x6x9f5n8eh4n FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id);


--
-- Name: project_timesheets fkohj1k3hydfibp83vphq2asbhf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_timesheets
    ADD CONSTRAINT fkohj1k3hydfibp83vphq2asbhf FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: document_types fkom1e48hohq0w1r3a40njslbbl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT fkom1e48hohq0w1r3a40njslbbl FOREIGN KEY (category_id) REFERENCES public.document_categories(id);


--
-- Name: stock_transfer_lines fkootbbs01o6ttbp0phsrmll8rs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_lines
    ADD CONSTRAINT fkootbbs01o6ttbp0phsrmll8rs FOREIGN KEY (from_bin_id) REFERENCES public.bins(id);


--
-- Name: employees fkos5cvug395e7xxjlc5bx9opiq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkos5cvug395e7xxjlc5bx9opiq FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: items fkow3cnyigcyx84c9mbihqjcm2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT fkow3cnyigcyx84c9mbihqjcm2c FOREIGN KEY (group_id) REFERENCES public.item_groups(id);


--
-- Name: employee_education fkp4wlgwluyoknphmwhgn2o5pks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_education
    ADD CONSTRAINT fkp4wlgwluyoknphmwhgn2o5pks FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: users fkp56c1712k691lhsyewcssf40f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fkp56c1712k691lhsyewcssf40f FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: payroll_runs fkpmqrmknm71nqllpur8uvpbq2s; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT fkpmqrmknm71nqllpur8uvpbq2s FOREIGN KEY (pay_frequency_id) REFERENCES public.pay_frequencies(id);


--
-- Name: employees fkpuq5iee51npa3gies21htqsj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkpuq5iee51npa3gies21htqsj FOREIGN KEY (grade_id) REFERENCES public.grades(id);


--
-- Name: training_sessions fkq3c1yd65jlaenyblinh3i0o5c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT fkq3c1yd65jlaenyblinh3i0o5c FOREIGN KEY (program_id) REFERENCES public.training_programs(id);


--
-- Name: stock_transfer_lines fkqj7ihemc7rqm9fulth6ecuj5o; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_lines
    ADD CONSTRAINT fkqj7ihemc7rqm9fulth6ecuj5o FOREIGN KEY (stock_transfer_id) REFERENCES public.stock_transfers(id);


--
-- Name: onboarding_tasks fkqn03oohk1e4a6khpdtuf7ap29; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_tasks
    ADD CONSTRAINT fkqn03oohk1e4a6khpdtuf7ap29 FOREIGN KEY (completed_by_id) REFERENCES public.employees(id);


--
-- Name: attendance_records fkqriv0vy5jorxjivlaowbfe765; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT fkqriv0vy5jorxjivlaowbfe765 FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: departments fkqsrwrq8xt10jqu1jjwpdnvnno; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fkqsrwrq8xt10jqu1jjwpdnvnno FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: roles fkrd3iyw6bjkyc6qoddupccxe07; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT fkrd3iyw6bjkyc6qoddupccxe07 FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: expense_items fkrf7trh1khv67oix6gfh7l4yce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_items
    ADD CONSTRAINT fkrf7trh1khv67oix6gfh7l4yce FOREIGN KEY (category_id) REFERENCES public.expense_categories(id);


--
-- Name: stock_adjustments fkrqkv0el2m8rlrhy8w4wqjlvjs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT fkrqkv0el2m8rlrhy8w4wqjlvjs FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: payroll_runs fkrvj9q5cd0vjjxttm4ejrwdnaf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT fkrvj9q5cd0vjjxttm4ejrwdnaf FOREIGN KEY (created_by) REFERENCES public.employees(id);


--
-- Name: stock_adjustments fkrx0rcvfnre9vgtayn08ax20f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT fkrx0rcvfnre9vgtayn08ax20f5 FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: leave_requests fkrxff2xg1kffbjfh5maxwoqyhw; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fkrxff2xg1kffbjfh5maxwoqyhw FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: candidates fkrxn99bmyj55gkbv0bym5y19gd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fkrxn99bmyj55gkbv0bym5y19gd FOREIGN KEY (converted_employee_id) REFERENCES public.employees(id);


--
-- Name: bill_lines fks0mirwx78p5bmx6opflconlbu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_lines
    ADD CONSTRAINT fks0mirwx78p5bmx6opflconlbu FOREIGN KEY (bill_id) REFERENCES public.bills(id);


--
-- Name: offer_letters fks8wnf3g9s7mycr6kdbkgmotm8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_letters
    ADD CONSTRAINT fks8wnf3g9s7mycr6kdbkgmotm8 FOREIGN KEY (grade_id) REFERENCES public.grades(id);


--
-- Name: job_requisitions fksnx57k8861dtdplkmmk28fo9o; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT fksnx57k8861dtdplkmmk28fo9o FOREIGN KEY (approved_by_id) REFERENCES public.employees(id);


--
-- Name: designations fksoorfj7e9g402kllnqjbv3p82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT fksoorfj7e9g402kllnqjbv3p82 FOREIGN KEY (grade_id) REFERENCES public.grades(id);


--
-- Name: interviews fksq4oeytywoyigglh18vgjoo44; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fksq4oeytywoyigglh18vgjoo44 FOREIGN KEY (interviewer_id) REFERENCES public.employees(id);


--
-- Name: bills fkt0ma98lje3h8vi09f5aokmb9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT fkt0ma98lje3h8vi09f5aokmb9a FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id);


--
-- Name: chart_of_accounts fkt1046gd7mgo0v7rdnh6aa3per; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT fkt1046gd7mgo0v7rdnh6aa3per FOREIGN KEY (parent_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: onboarding_tasks fkt3t5fd9gjqxm9jrp1ykv2mpto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_tasks
    ADD CONSTRAINT fkt3t5fd9gjqxm9jrp1ykv2mpto FOREIGN KEY (assigned_to_id) REFERENCES public.employees(id);


--
-- Name: inventory_ledger fkt61h48564vae1ty6ky8dkppt9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ledger
    ADD CONSTRAINT fkt61h48564vae1ty6ky8dkppt9 FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: candidates fkt6b6cn9ry9vv0dwcogsyn2wjp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fkt6b6cn9ry9vv0dwcogsyn2wjp FOREIGN KEY (requisition_id) REFERENCES public.job_requisitions(id);


--
-- Name: job_requisitions fkt76sy6vqw7sc337vcbxguyuaa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_requisitions
    ADD CONSTRAINT fkt76sy6vqw7sc337vcbxguyuaa FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id);


--
-- Name: bill_lines fktaqul8h759sxseglp5m2ftir3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_lines
    ADD CONSTRAINT fktaqul8h759sxseglp5m2ftir3 FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: job_roles fktdmwys2oe270sn0r36faqmp6y; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT fktdmwys2oe270sn0r36faqmp6y FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: stock_transfers fktg575pm9p5bbyj3ki1ssffcpc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fktg575pm9p5bbyj3ki1ssffcpc FOREIGN KEY (to_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: timesheets fktj5il9gunb73x66obronrr75n; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT fktj5il9gunb73x66obronrr75n FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: hr_letters fktm82cv5vhuu009oq4c5cjlnhd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_letters
    ADD CONSTRAINT fktm82cv5vhuu009oq4c5cjlnhd FOREIGN KEY (generated_by_id) REFERENCES public.employees(id);


--
-- Name: goods_receipts fkwn1cuunwpj2pd38ndi4etqg6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT fkwn1cuunwpj2pd38ndi4etqg6 FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- PostgreSQL database dump complete
--

\unrestrict lCogssTcGmKhdYTdmjSwad6rXUsbaKFIPAMgKg6u53ZsBgKfdOy3o1lzZsjpLu9

