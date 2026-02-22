# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Build backend only (from backend/)
mvn clean package -DskipTests

# Run backend in dev mode (port 8080)
java -jar target/erp-backend-1.0.0.jar --server.port=8080

# Run in production mode (serves both API and Angular frontend on port 5000)
java -jar target/erp-backend-1.0.0.jar --server.port=5000

# Full production build (frontend + backend, from project root)
# Note: build.sh uses /home/runner/workspace paths (Replit); adapt paths for local dev
bash build.sh
```

There are **no tests** in this project. The `src/test/` directory does not exist. Builds always use `-DskipTests`.

## Project Overview

Hao System is a multi-tenant ERP application. The backend is a Spring Boot 3.2 REST API (Java 17) with PostgreSQL. The Angular frontend lives in `../frontend/` and in production is served as static files from the Spring Boot JAR.

## Architecture

**Layered architecture**: Controller → Service → Repository → Entity (JPA)

- **38 controllers** under `com.erp.controller` — all API endpoints are under `/api/`
- **41 services** under `com.erp.service`
- **110 repositories** under `com.erp.repository` — Spring Data JPA interfaces
- **115 entity models** under `com.erp.model`
- **3 DTOs** under `com.erp.dto` — only for auth (`LoginRequest`, `RegisterRequest`, `AuthResponse`). All other endpoints accept/return entities directly.

Some controllers bypass the service layer and use repositories directly.

## Multi-Tenancy (Branch Scoping)

The application implements soft multi-tenancy via "branches" (companies). Each data entity belongs to a branch. Controllers manually extract `branchId` and `isSuperAdmin` from the JWT token via `JwtUtil.extractBranchId(request)`. Super admins see all data; regular users see only their branch's data. There is no centralized interceptor — this pattern is repeated in each controller.

## Authentication & Security

- JWT-based stateless auth (`com.erp.security.JwtUtil`, `com.erp.security.JwtAuthFilter`)
- JWT claims include: `username`, `role`, `isSuperAdmin`, `branchId`, `employeeId`, `userId`
- Token expiry: 24 hours
- Passwords: BCrypt via Spring Security
- Public endpoints: `/api/auth/**`, `/api/branches/active`, `/api/branches/by-slug/**`, `/api/health`, `/ws/**`
- Roles: SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER (scoped per branch)
- Default admin created on startup: `admin` / `admin123` (via `AuthService.createDefaultAdmin()`)

## Database

- PostgreSQL connected via env vars: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` (defaults to `localhost:5432/postgres`)
- Schema managed by Hibernate `ddl-auto=update` — no migration framework (no Flyway/Liquibase)
- `DataSeeder.java` (`@Order(2)` CommandLineRunner) seeds sample data on startup if tables are empty

## Key Controllers

- **`ApiController`** — Large catch-all at `/api/` handling customers, contracts, items, inventory, suppliers, goods receipt/issue, stock transfers, settings, dashboard stats
- **`AuthController`** — `/api/auth/**` for login, register, init
- **`EmployeeController`** — `/api/employees` with auto-generated employee codes (branch prefix + sequential number)
- **`PayrollController`**, **`LeaveController`**, **`AttendanceController`** — HR operations
- **`AccountingController`**, **`AccountingReportsController`** — Finance/accounting
- **`ChatController`** — Real-time messaging (HTTP polling, 3s interval)
- **`HealthController`** — Health checks at `/api/health`, `/health`, `/healthz`

## ERP Modules

HR (employees, attendance, leaves, payroll, loans, training, onboarding, HR letters, final settlement), Finance (accounting, chart of accounts, journal entries, banking, bills, budgets, expenses), Inventory (items, warehouses, bins, goods receipt/issue, stock transfers, purchase requisitions), Projects (tasks, milestones, timesheets), CRM (customers, contracts), Recruitment (job postings, candidates, interviews).

## Patterns & Conventions

- Entity PKs use `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- Relationships use `@ManyToOne(fetch = FetchType.LAZY)` with `@JsonIgnoreProperties` to prevent circular serialization
- Timestamp fields use `@PrePersist`/`@PreUpdate` lifecycle callbacks (no shared base entity)
- Services use `@Autowired` field injection
- Controllers return `ResponseEntity<>` with try-catch blocks returning error maps — no global `@ControllerAdvice` exception handler
- CORS is wide open (`*`) in both REST and WebSocket configs
- Lombok is a dependency but most entities use manual getters/setters
