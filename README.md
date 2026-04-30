# CollegeCollab

**Plan Together. Stay Organized. Achieve More.**

A production-ready Student Task Management & Academic Collaboration Platform built with React, Node.js, and MySQL.

---

## Tech Stack

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **TailwindCSS v4** — design system built on CollegeCollab brand colors
- **Framer Motion** — smooth page transitions and micro-interactions
- **React Router v7** — client-side routing with role guards
- **Zustand** — lightweight global state management
- **TanStack Query** — server state, caching, background refetching
- **Recharts** — analytics charts and dashboards
- **React Hook Form** + **Zod** — type-safe form validation
- **Lucide React** — icon library

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** — type-safe database access
- **MySQL** — relational database
- **Socket.IO** — real-time messaging
- **JWT** — access + refresh token auth
- **bcryptjs** — password hashing
- **Multer** — file upload handling

---

## Features

| Feature | Student | Lecturer | Admin |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Task Management | View & track | Create & assign | Full control |
| Submissions | Submit work | Review & grade | Monitor |
| Messaging | ✅ | ✅ | ✅ |
| Calendar | ✅ | ✅ | — |
| Analytics | Personal | Course-level | Platform-wide |
| Notifications | ✅ | ✅ | ✅ |
| User Management | — | — | ✅ |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or pnpm

### 1. Clone and install

```bash
git clone <repo-url>
cd CollegeCollab

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL credentials

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Set up database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data
npm run prisma:seed
```

### 4. Start the application

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@collegecollab.rw | admin123 |
| Lecturer | lecturer@collegecollab.rw | lecturer123 |
| Student | student@collegecollab.rw | student123 |

---

## Project Structure

```
CollegeCollab/
├── frontend/
│   └── src/
│       ├── components/     # UI components (Button, Card, Modal, etc.)
│       ├── features/       # Feature-specific components
│       ├── layouts/        # Page layouts (Auth, Dashboard)
│       ├── pages/          # Route pages by role
│       ├── hooks/          # Custom React hooks
│       ├── store/          # Zustand state stores
│       ├── services/       # API service functions
│       ├── types/          # TypeScript types
│       └── utils/          # Helper utilities
├── backend/
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, tasks, etc.)
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # JWT, response helpers
│   │   └── config/         # App configuration
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── seed.ts         # Demo data seeder
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Sign in |
| POST | /api/auth/logout | Cookie | Sign out |
| POST | /api/auth/refresh | Cookie | Refresh access token |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/tasks | JWT | List tasks |
| GET | /api/tasks/my | JWT | My tasks |
| POST | /api/tasks | Lecturer | Create task |
| PUT | /api/tasks/:id | Lecturer | Update task |
| DELETE | /api/tasks/:id | Lecturer | Delete task |
| POST | /api/submissions | Student | Submit work |
| GET | /api/submissions/my | Student | My submissions |
| POST | /api/submissions/:id/grade | Lecturer | Grade submission |
| GET | /api/courses | JWT | List courses |
| POST | /api/courses/:id/enroll | Student | Enroll in course |
| GET | /api/notifications | JWT | Get notifications |
| PUT | /api/notifications/read-all | JWT | Mark all read |
| GET | /api/users | Admin | List users |

---

## Contact

**WhatsApp:** +250 780 605 880

For support, questions, or partnership inquiries, visit [/contact](/contact) or message us on WhatsApp.

---

## License

MIT License — Built by Ange Aurele TUYISENGE
