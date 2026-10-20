# Final Exam: Internet Programming (2026)
## Topic: HR Manager & Salary Analytics System

- **Course:** Internet Programming (2026)
- **Student ID:** 6730251174
- **Repository Name:** Std6730251174IPFinal2026

---

## 📁 Project Directory Structure
```
Std6730251174IPFinal2026/
├── backend/       # Express.js REST API Server
│   ├── package.json
│   └── server.js  # In-Memory Array storage, CRUD & K-Means Analytics
└── frontend/      # React Native (Expo) Application
    ├── App.js
    ├── app.json
    ├── config.js  # API URL configuration (http://localhost:3089)
    ├── package.json
    └── screens/
        ├── LoginScreen.js      # Auth screen with validation
        └── DashboardScreen.js  # CRUD UI & K-Means Summary Cards
```

---

## 🌐 Cloud Deployment & Database Details
- **Assigned Cloud Server:** `http://119.59.102.161:3089`
- **Assigned MySQL Database:** `ip_std6730251174`
- **Database Table:** `PhongBoon_Employ` (Fields: `PhongBoon_ID_Employ`, `PhongBoon_Name_Employ`, `PhongBoon_Position_Employ`, `PhongBoon_Status_Employ`, `PhongBoon_Salary_Employ`)
- **Compatibility View:** `NinSom_Employ` (Aliases to teacher's specified initials)
- **API Response:** Returns standard fields (`id`, `name`, `position`, `salary`, `status`) along with `PhongBoon_*` and `NinSom_*` aliases for complete compatibility.

---

## 🚀 How to Run the Application

The frontend has built-in **Resilient Fallback**: it automatically connects to the deployed Cloud Server (`119.59.102.161:3089`). If testing offline, it seamlessly falls back to `localhost:3089`.

### 1. Start Backend Server (Optional if testing local)
Open **Terminal 1**:
```bash
cd backend
npm install
npm start
```
- Server will listen at: `http://localhost:3089` (or `http://119.59.102.161:3089` on cloud)
- Connects to MySQL on cloud with automatic In-Memory fallback mode.

---

### 2. Start Frontend Application
Open **Terminal 2**:
```bash
cd frontend
npm install
npm run web
```
*(Or run `npx expo start` to run on Android / iOS via Expo Go)*

The web browser will open at `http://localhost:8081` and connect automatically.

---

## 🔑 Login Credentials
As specified in the exam requirements:
- **Username:** `admin`
- **Password:** `password123`
*(Or click the **Create Account** tab on the login screen to register and test any custom account)*

---

## 📋 Features Implemented (Grading Rubric Checklist)

### Phase 1: Authentication & Employee Management (60 Points)
- [x] **[15 pts] Login System:** `POST /api/login` verifies credentials (`admin` / `password123`), returns Status 200 with mock token, blocks unauthorized access with Status 401.
- [x] **[20 pts] Backend API (CRUD):** 
  - `GET /api/employees` returns all employee records.
  - `POST /api/employees` validates `name`, `position`, `salary` and responds with `400 Bad Request` if any field is empty.
  - `PUT /api/employees/:id/status` toggles employee status between `Active` and `On Leave`.
  - `DELETE /api/employees/:id` removes the employee from the system.
- [x] **[15 pts] Frontend Dashboard:** Full integration with API, UI automatically updates upon adding, toggling status, and deleting.
- [x] **[10 pts] Client-Side Validation & Confirmation:**
  - Form validation blocks empty inputs and shows warning alert.
  - Delete button triggers confirmation alert ("Are you sure?") before issuing API request.

### Phase 2: Automated Salary Clustering (K-Means Analytics) (30 Points)
- [x] **[15 pts] Backend K-Means Clustering:** `GET /api/employees/salary-clusters` groups salaries into 3 tiers ($k=3$), returns centroid and count for each cluster without crashing.
- [x] **[15 pts] Frontend Analytics UI:** "Analyze Salary Structure" button, displays loading indicator while computing, and renders clean Summary Cards (Tier 1, Tier 2, Tier 3).

### Project Management & Architecture (10 Points)
- [x] **[10 pts] Folder Structure & Naming:** Correct directory structure (`backend/` and `frontend/`), repository naming (`Std6730251174IPFinal2026`), and both servers start smoothly.
