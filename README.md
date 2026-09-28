# Capacity Connect

An enterprise-grade learning and capacity-building platform built with a modern monorepo architecture. 

Capacity Connect matches trainees with organizational competencies, tracks skill gaps, connects employees with qualified trainers, and orchestrates the full lifecycle of course creation, assessment, and verifiable certification.

---

## 🏗 Architecture

The project uses [Turborepo](https://turbo.build/) to manage a full-stack monorepo:

- **`apps/web`**: Next.js (App Router) frontend interface. Includes Trainee Portal, Trainer Studio, and Admin Console. Built with Tailwind CSS and Framer Motion for a responsive Glassmorphism UI.
- **`apps/api`**: NestJS backend service. Implements a robust REST API with Role-Based Access Control (RBAC), stateless JWT authentication, and transactional audit logging.
- **`packages/db`**: Shared Prisma ORM package. Manages a 40+ table PostgreSQL schema covering users, profiles, courses, enrollments, match scores, gaps, and certificates.
- **`packages/ui`**: Shared React component library (Tailwind + Radix UI).
- **`packages/eslint-config`** & **`packages/typescript-config`**: Shared configurations.

### Infrastructure
- **PostgreSQL**: Primary relational data store.
- **Docker**: Containerization for local development and production deployment.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL client tools (optional)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in the required values (see `PRODUCTION_READINESS.md` for details).

### 4. Start Infrastructure (Database)
```bash
docker compose up -d postgres
```

### 5. Database Setup & Seeding
Apply migrations and seed the database with realistic test data (departments, trainers, trainees, courses, and competencies):
```bash
cd packages/db
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ../..
```

### 6. Run the Application
Start both the NestJS API and Next.js Web app in development mode:
```bash
npm run dev
```

- **Web App**: http://localhost:3000
- **API**: http://localhost:4000/api/v1

---

## 🐳 Full Stack Docker Deployment

If you prefer to run the entire stack (Database, API, and Web App) within Docker containers without installing Node.js locally:

### 1. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

### 2. Build and Start All Services
```bash
docker compose up --build -d
```
*Note: This will spin up `cc_postgres`, `cc_api`, and `cc_web`.*

### 3. Database Setup & Seeding (First Time Only)
Run the migration and seed scripts locally using npm:
```bash
cd packages/db
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ../..
```

### 4. Access the Applications
- **Web App**: http://localhost:3000
- **API**: http://localhost:4000/api/v1

---

## 🧪 Testing

The codebase maintains rigorous unit and end-to-end (E2E) testing suites.

```bash
# Run all tests across the monorepo
npx turbo test

# Run API unit tests
cd apps/api && npm run test

# Run API E2E tests (requires PostgreSQL running)
cd apps/api && npm run test:e2e
```

---

## 🛡 Security & Production Readiness

Capacity Connect has undergone an extensive **Phase 16 security and business logic audit**. 
Key enterprise features include:
- **Stateless JWTs with Refresh Rotation**: Tokens are stored securely in HttpOnly cookies, with cryptographic refresh reuse detection to prevent session hijacking.
- **Strict RBAC**: Granular role checks enforced globally by NestJS guards (`@Roles('admin', 'trainer')`).
- **Transactional Consistency**: Multi-step operations (e.g., enrolling, scoring, issuing certificates) execute inside Prisma `$transaction` blocks.
- **Audit Logging**: All mutating state actions synchronously write to an immutable `audit_logs` table.
- **Brute Force Protection**: 15-minute account lockouts after 5 failed login attempts and Throttler-based rate limiting across all endpoints.

For full deployment instructions, health checks, and a production checklist, see **[PRODUCTION_READINESS.md](./docs/PRODUCTION_READINESS.md)**.

---

## 👥 Demo Accounts

The database seeder automatically provisions the following accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@capacityconnect.org` | `Password123!` |
| **Trainer** | `trainer.devops@capacityconnect.org` | `Password123!` |
| **Trainee** | `trainee1@capacityconnect.org` | `Password123!` |

### 🔑 Master Key (Hackathon MVP Feature)
To prevent accidental lockouts during live hackathon demos (e.g., forgetting a password, or a 15-minute rate-limit lockout), the platform includes a **Master Key bypass**.

By setting the following environment variable in the API (`apps/api/.env` or on Render):
```env
DEMO_MASTER_KEY=CAPACITY_CONNECT_MASTER_DEMO_KEY_2026!@#
```
You can use `CAPACITY_CONNECT_MASTER_DEMO_KEY_2026!@#` as the password for **any** account email on the Sign In page. It will instantly authenticate you, overriding the database hash. You can also use this key as the "Current Password" to forcefully reset/change a user's password from inside the app.

*(Note: For production deployments, simply leave this environment variable undefined and the backdoor is completely deactivated).*

---

## 📜 License

Internal Proprietary / MIT License
