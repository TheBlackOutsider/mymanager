**Instruction to Bolt**:
You are an expert SaaS engineer. Generate production-ready code for a **Human Resources Event & Leave Management Tool**.

---

### 🎯 Context

The app is part of an enterprise HR suite.
It must be:

* **Web + mobile compatible** (responsive & compilable into a React Native app or PWA).
* **Desktop-first design**, but fully responsive for employee access on mobile.
* Used by HR teams and employees for events (trainings, seminars, onboarding) and leave management (annual leave, sick leave, absences, permissions).

---

### 🛠️ Tech Stack

* **Frontend**: React.js + TypeScript + TailwindCSS
* **Mobile**: PWA-ready / React Native compatible
* **State**: Redux Toolkit
* **Routing**: React Router v6
* **API**: Axios with FastAPI backend (JSON endpoints)
* **Charts**: Recharts for analytics
* **Notifications**: Web push + email integration
* **Accessibility**: WCAG-compliant

---

### 📦 Features to Build

#### 👥 Employee Management

* CRUD employees (name, email, department, role, seniority).
* Search + filters.
* Assign employees to HR events.

#### 📅 HR Events

* CRUD events (title, description, type: training, seminar, onboarding, etc.).
* Multi-day + recurring events.
* Categories (color-coded).
* Registration + invitations (per employee or per group).
* Attendance tracking (check-in/check-out, QR optional).
* In-app & email reminders.

#### 🌴 Leave & Absence Management

* Employees request leaves (annual leave, sick leave, personal absence, special permissions).
* Workflow: request → manager approval → HR confirmation.
* Leave calendar integrated with events (conflict detection).
* Leave balance per employee/department.
* Export leave/absence reports.

#### 📊 Reporting Dashboard

* KPIs: number of events this month, attendance %, department participation.
* Leave stats: approvals vs rejections, absence rate trends.
* Charts with Recharts.
* Export PDF/CSV.

#### 🧠 Feedback & Notifications

* Post-event survey (rating + comments).
* Push + email notifications: event reminders, leave status updates.

---

### 🚀 Directives for Bolt

1. **Generate frontend code**:

   * Pages: Employees, Events, Leaves, Dashboard
   * Components: CRUD forms, tables, modals, calendars
   * Responsive Tailwind layouts
   * Redux Toolkit slices for state
   * Axios hooks for API calls

2. **Generate backend endpoints (FastAPI)**:

   * `/employees` → CRUD employees
   * `/events` → CRUD HR events
   * `/leaves` → leave requests + approval workflow
   * `/reports` → analytics data (aggregated)
   * `/notifications` → send reminders + emails

3. **Add documentation**:

   * README.md with setup (web + mobile build)
   * API schema description (JSON examples)

---

⚡ **Now generate the full codebase (frontend + backend) for this HR Event & Leave Management Tool.**
