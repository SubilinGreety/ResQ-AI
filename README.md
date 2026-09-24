# ResQ AI 🚨
### AI-Powered Multi-Hazard Disaster Intelligence & Response System for Chennai
> **Tagline:** *Predict • Alert • Rescue • Recover*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

---

## 📌 Project Overview
**ResQ AI** is an Emergency Operations Center (EOC) intelligence platform purpose-built for disaster management in Chennai, Tamil Nadu. Designed for realistic urban flood and cyclone scenarios, it provides automated risk modeling, transparent explainable scoring, multi-channel citizen alerting, and interactive tactical mapping.

---

## 🚀 Implemented Modules

### 🗺️ Module 1: Disaster Data Input & Scenario Setup
- **Interactive Tactical Leaflet Map**: Real-time visualization of Chennai sectors (Saidapet, Velachery, T. Nagar, Tambaram, Adyar) with localized water depth, rainfall, road status, and casualty telemetry.
- **Scenario Lifecycle & Wizard**: Full CRUD support for creating, cloning, configuring, and monitoring disaster exercises.
- **Affected Zone Management**: Granular tracking of vulnerable demographics, hospitals, elderly homes, and critical access roads.

### 📊 Module 2: Risk Prediction & Priority Analysis
- **Transparent Multi-Hazard Scoring Engine**:
  - Flood Inundation & Depth (25%)
  - Critical Injuries & Casualties (20%)
  - Rainfall Intensity (15%)
  - Vulnerable Populations (15%)
  - Road Impassability / Access Severance (10%)
  - Total Exposed Population (10%)
  - Zone Severity Index (5%)
- **Dynamic Response Priority Classification**:
  - **Priority 1 (Critical)**: Risk Score 75–100 — Immediate rescue & evacuation
  - **Priority 2 (High)**: Risk Score 55–74 — High priority containment & staging
  - **Priority 3 (Moderate)**: Risk Score 35–54 — Advisory and preventive measures
  - **Priority 4 (Low)**: Risk Score 0–34 — Ongoing telemetry monitoring
- **Explainable Risk Inspector**: Modal breakdown detailing exact scoring contributions and actionable EOC recommendations.

### 📢 Module 3: Early Warning & Alerts
- **Automated CAP v1.2 Compliance**: Ingests risk assessments and automatically formats Common Alerting Protocol records.
- **Bilingual Broadcast Payload**: Full dual-language emergency alerts in **English and Tamil (தமிழ்)** with emergency helpline directives (`1070 / 112`).
- **Multi-Channel Distribution**:
  - Cell Broadcast / GSM SMS targeted push
  - WhatsApp Disaster Channel
  - High-Decibel Sector Sirens
  - Tactical First Responder Radio/Mobile Dispatch
- **Citizen Smartphone Simulation**: Interactive mobile phone lockscreen preview simulating emergency notifications.
- **Real-Time Map Hazard Beacons**: Dynamic pulsing hazard markers (`🚨`) on sectors under active broadcast.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Leaflet / React-Leaflet |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, CORS, Morgan |
| **Database** | MySQL 8.0 relational database with normalized schema models |
| **Standards** | OASIS Common Alerting Protocol (CAP v1.2) |

---

## 📂 Project Structure

```
ResQ AI/
├── client/                     # Vite + React + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── alerts/         # Module 3: AlertsView & Mobile Simulator
│   │   │   ├── dashboard/      # Metrics, Scenario Cards & Zone Table
│   │   │   ├── layout/         # EocHeader & StatusBar
│   │   │   ├── map/            # Tactical Leaflet Map with Beacons
│   │   │   ├── risk/           # Module 2: Risk Analysis View & Modal
│   │   │   └── scenario-builder/# Module 1: Scenario Creation Wizard
│   │   ├── services/           # Axios API Client (scenarioApi, riskApi, alertApi)
│   │   ├── types/              # TypeScript interfaces (scenario, risk, alert)
│   │   ├── App.tsx             # Main Command Center Application
│   │   └── main.tsx
├── server/                     # Express + TypeScript + Prisma Backend
│   ├── prisma/
│   │   └── schema.prisma       # Database models: Scenario, Zone, Resource, Risk, Alert
│   ├── src/
│   │   ├── controllers/        # scenarioController, riskController, alertController
│   │   ├── routes/             # scenarioRoutes, riskRoutes, alertRoutes
│   │   ├── services/           # RiskAssessmentService, AlertGenerationService, alertTemplates
│   │   └── index.ts            # Express server entry point
└── package.json
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **MySQL 8.0** running locally

### 2. Configure Environment
In `server/.env`:
```env
PORT=5000
DATABASE_URL="mysql://<user>:<password>@localhost:3306/resq_ai"
NODE_ENV=development
```

### 3. Database Migration
```bash
cd server
npm install
npx prisma db push
npx prisma generate
```

### 4. Run the Development Servers
```bash
# Terminal 1: Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend (Port 5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🗺️ Roadmap
- [x] **Module 1**: Disaster Data Input & Scenario Setup
- [x] **Module 2**: Risk Prediction & Analysis
- [x] **Module 3**: Early Warning & Alerts
- [ ] **Module 4**: Multi-Agent AI (Logistics, Medical, Communication)
- [ ] **Module 5**: Dynamic Resource Allocation & Staging
- [ ] **Module 6**: Real-Time Rescue Tracking & Field Operations

---

## 📜 License
MIT License. Developed for Chennai EOC Disaster Intelligence.
