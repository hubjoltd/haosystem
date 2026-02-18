# Hao System - ERP Application

## Overview
The Hao System is an enterprise resource planning (ERP) web application built with Angular 21 frontend and Spring Boot 3.2 backend. It provides comprehensive business management capabilities including inventory, customer, contract, HR, payroll, and administrative settings management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: Angular 21 with TypeScript 5.9
- **Port**: 5000 (dev server with `ng serve --host 0.0.0.0 --port 5000`)
- **Proxy**: `/api` requests proxied to backend at `http://127.0.0.1:8080`
- **Config**: `frontend/angular.json` with `allowedHosts: true` for Replit proxy compatibility
- **Styling**: SCSS with dark navy/blue theme on login, teal (#008080) theme on dashboard

### Backend
- **Framework**: Spring Boot 3.2.0 with Java 17+ (runs on Java 19)
- **Port**: 8080 (localhost only)
- **Database**: PostgreSQL (Replit built-in, connected via PGHOST/PGPORT/PGUSER/PGPASSWORD env vars)
- **ORM**: Hibernate 6.3.1 with JPA
- **Auth**: JWT-based authentication with Spring Security
- **Build**: Maven (`mvn clean package -DskipTests`)

### Key Files
- `start.sh` - Startup script that launches backend JAR then Angular dev server
- `build.sh` - Build script that builds frontend, copies to backend static resources, then builds backend JAR
- `frontend/proxy.conf.json` - Proxy config routing `/api` to backend
- `backend/src/main/resources/application.properties` - Backend configuration
- `backend/src/main/java/com/erp/config/DataSeeder.java` - Sample data seeder (wrapped in try-catch for resilience)

### Deployment
- **Target**: Autoscale
- **Build**: Frontend built and copied to backend static resources, then backend packaged as JAR
- **Run**: `java -jar backend/target/erp-backend-1.0.0.jar --server.port=5000`
- In production, the Spring Boot JAR serves both the API and the static Angular frontend on port 5000

## Recent Changes
- **Login page redesign**: HAO logo with dark blue/navy gradient, service category cards (Electrical, Access Control, CCTV, Networking, Servers, Communications), "Welcome Back" heading, "Email Address" label, "Sign in to Dashboard" button, removed company logos and "Remember Me" checkbox
- **Employee list columns reordered**: Employee Code, Name, Designation, Department, Project, Email, Status, Actions
- **Employee code auto-generation**: Uses branch code as prefix (or "EMP" default), generates sequential 4-digit codes via native SQL query
- **Employee delete fix**: Cascade deletes related records (bank details, salary, education, experience, assets) before deleting employee
- **Employee list sorting**: Changed from DESC to ASC order
- **Onboarding assets**: Added asset endpoints to OnboardingController (GET /assets/employee/{id}, POST /assets, POST /assets/{id}/return)
- **Leave date fix**: Timezone-safe date parsing using component parts instead of new Date(string)
- **completeTask endpoint**: Made request body optional (@RequestBody(required = false))
- Wrapped DataSeeder.run() in try-catch to prevent Hibernate compatibility issues from crashing the application
- Created start.sh for development workflow (backend on 8080 + frontend dev server on 5000)
- Created .gitignore for Java and Node.js artifacts
- Configured deployment for autoscale with build step
