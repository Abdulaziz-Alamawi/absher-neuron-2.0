<div align="center">

# 🛡️ Absher Neuron 2.0

### AI Security Intelligence Platform · National Digital Identity & Predictive Defense

**Protecting digital identities _before_ attacks happen.**

[![CI](https://img.shields.io/badge/CI-passing-1ee0c5)](./.github/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6-f7931e)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-1ee08a)](./LICENSE)

**Owner & Author:** Abdulaziz AlAmawi

</div>

---

## Overview

Absher Neuron is a next-generation, government-grade **AI Security Intelligence Platform** for national digital identity. It continuously analyzes user behavior, predicts threats, prevents account takeover and verifies identities intelligently through adaptive, risk-based authentication.

It pairs a **real machine-learning threat engine** (Isolation Forest + Random Forest + gradient-boosted ensemble) with a **behavioral identity engine** (keystroke dynamics, pointer biometrics, device/network/geo fingerprinting) inside an enterprise **Security Command Center** inspired by CrowdStrike Falcon, Microsoft Defender, Palantir Gotham, Darktrace and Okta.

> Design ethos: **Zero Trust · Dark-mode-first · Real-time · Explainable AI.**

---

## ✨ Capability Pillars

| Pillar | What it does |
| --- | --- |
| 🧠 **Behavioral Identity Engine** | Continuous, passive biometric authentication from typing rhythm, mouse dynamics, device & browser fingerprints. Produces a **Trust / Risk / Confidence** score. |
| 🎯 **Predictive Threat Engine** | Isolation Forest anomaly detection + Random Forest classification + gradient boosting across 7 threat classes. ~97% accuracy on the synthetic corpus. |
| 🔐 **Triple Verification System** | Risk-based adaptive MFA: OTP → Face → Live-Camera Liveness → Voiceprint → Automated Phone Callback. Higher risk = stronger proofs. |
| 🌍 **National Command Center** | Live global threat map, KPIs, severity mix, risk heatmaps and a real-time threat stream. |
| 📡 **Real-Time System** | Native **WebSocket** gateway (FastAPI) streaming model-scored events, with SSE + in-browser simulation fallback. No manual refresh. |
| 📈 **Security Analytics** | Threat trends, login analytics, risk distributions, model performance and 14-day attack forecasting. |
| 🚨 **Alert & Incident Response** | AI-explained alerts, recommended playbooks, incident timelines and automated containment (SOAR). |
| 🪪 **Identity Management** | Identity profiles, trusted devices, trusted locations, verification & login history. |
| 🏛️ **Enterprise Governance** | RBAC matrix, tamper-evident audit logs, session management, security policies and a compliance dashboard (NCA ECC, PDPL, ISO 27001, NIST CSF, SOC 2, GDPR). |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Security Command Center (UI)                   │
│   Next.js 15 · TypeScript · Tailwind · Framer Motion · SVG charts  │
└───────────────┬───────────────────────────────┬──────────────────┘
                │ REST (/api/*)                  │ WebSocket (live stream)
                ▼                                ▼
   ┌─────────────────────────┐      ┌────────────────────────────────┐
   │  Next.js Route Handlers │      │   FastAPI AI Engine (Python)    │
   │  • /api/assess (scoring)│      │   • /assess  (REST inference)   │
   │  • /api/threats /alerts │      │   • /ws/stream (live events)    │
   │  • TS scoring engine     │◀────▶│   • Isolation Forest            │
   │    (explainable RBA)     │      │   • Random Forest               │
   └─────────────────────────┘      │   • XGBoost / HistGB ensemble   │
                │                    └────────────────────────────────┘
                ▼
   ┌─────────────────────────┐
   │  PostgreSQL + Prisma    │   Identities · Sessions · Threats ·
   │  (production data layer)│   Incidents · Audit · Policies
   └─────────────────────────┘
```

| Layer | Stack |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, bespoke SVG charts |
| **Backend / AI** | FastAPI, Uvicorn, scikit-learn, NumPy, pandas, XGBoost (optional), joblib |
| **Realtime** | Native WebSocket gateway + SSE fallback + in-browser simulation |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **DevOps** | Docker, docker-compose, GitHub Actions CI/CD |

---

## 🚀 Quickstart

### Option A — Run everything with Docker

```bash
docker compose up --build
# Frontend  → http://localhost:3000
# AI Engine → http://localhost:8000/docs
# Postgres  → localhost:5432
```

### Option B — Run locally

**1. Frontend**
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

**2. AI Engine**
```bash
cd ai-engine
python -m venv .venv && .venv\Scripts\activate    # (Windows)
pip install -r requirements.txt
python -m ml.train       # trains & persists the ensemble (~1 min)
uvicorn app.main:app --reload    # http://localhost:8000/docs
```

**3. Database (optional, production data layer)**
```bash
cd database
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

> The frontend runs **fully standalone** even without the AI engine or database — it transparently falls back to an in-browser live-event simulation and deterministic intelligence data.

---

## 🧠 The AI, in detail

The predictive engine (`ai-engine/`) is trained on a labeled synthetic corpus of genuine vs. malicious authentication sessions across 7 classes: `benign, account_takeover, credential_theft, bot_activity, location_anomaly, device_anomaly, brute_force`.

- **Isolation Forest** — unsupervised anomaly scoring on the behavioral feature space.
- **Random Forest** — supervised multiclass threat classification (primary).
- **XGBoost / HistGradientBoosting** — gradient-boosted ensemble, soft-voted with RF.
- **18-feature vector** — typing speed/rhythm, key hold & flight times, pointer velocity/jitter/idle, device trust, IP reputation, VPN/TOR/proxy flags, geo expectation, temporal & credential-pressure signals, plus baseline-deviation features.

Every assessment returns **Trust / Risk / Confidence**, an adaptive-MFA **decision**, the predicted threat, class probabilities and the top feature contributions — fully **explainable**.

```bash
curl -X POST http://localhost:8000/assess -H "Content-Type: application/json" \
  -d '{"typing_speed_cpm":90,"device_trusted":0,"geo_expected":0,"ip_reputation":25,"tor_detected":1,"failed_attempts":5}'
# → { "risk_score": 99, "decision": "block", "predicted_threat": "account_takeover", ... }
```

---

## 📂 Repository layout

```
absher-neuron-2.0/
├── frontend/            # Next.js 15 command center (UI + REST + scoring engine)
├── ai-engine/           # FastAPI ML service (Isolation Forest, RF, XGBoost, WS stream)
│   ├── app/             #   REST + WebSocket API
│   ├── ml/              #   features, synthetic data, training, inference
│   └── tests/           #   pytest suite
├── database/            # Prisma schema + seed (PostgreSQL)
├── docs/                # Architecture & readiness report
├── docker-compose.yml   # Full-stack orchestration
└── .github/workflows/   # CI/CD
```

---

## 🔒 Security & privacy

- Behavioral capture is **local-first** — only derived feature vectors are scored, never raw keystrokes.
- Camera/microphone are requested **only** for explicit liveness/voice verification.
- Audit logs are **hash-chained** for tamper evidence; privileged sessions retained 365 days.
- National IDs are masked/hashed throughout.

---

## 📜 License

[MIT](./LICENSE) © 2026 **Abdulaziz AlAmawi**

<div align="center">
<sub>Absher Neuron 2.0 — built by Abdulaziz AlAmawi.</sub>
</div>
