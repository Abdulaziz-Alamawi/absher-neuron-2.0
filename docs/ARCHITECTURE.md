# Absher Neuron 2.0 — Architecture

**Author:** Abdulaziz AlAmawi

## 1. System context

Absher Neuron is a three-tier, service-oriented platform:

1. **Command Center (Next.js 15)** — the analyst-facing UI, REST API surface and an in-process, explainable TypeScript risk-scoring engine used inline and as a resilient fallback.
2. **AI Engine (FastAPI)** — the predictive ML service exposing REST inference and a native WebSocket live-event gateway.
3. **Data Layer (PostgreSQL + Prisma)** — the system of record for identities, sessions, threats, incidents, audit and policies.

Each tier degrades gracefully: the UI runs standalone with deterministic intelligence data and a simulated live stream when the AI engine or database are absent.

## 2. Behavioral Identity Engine

Captured locally in the browser (`frontend/src/lib/scoring/capture.ts`):

- **Keystroke dynamics** — characters/min, rhythm variance, key hold (dwell) and flight times.
- **Pointer dynamics** — velocity, jitter (direction-change entropy), idle ratio.
- **Device/browser fingerprint** — canvas, WebGL, audio entropy, platform, screen, timezone, hardware.

Fused with network (IP reputation, VPN/TOR/proxy), geo (expected region) and temporal/credential context into **Trust / Risk / Confidence** scores via a transparent weighted model with full per-feature breakdown (`frontend/src/lib/scoring/engine.ts`).

## 3. Predictive Threat Engine (`ai-engine/`)

- **Features** — 18-dimensional vector (`ml/features.py`), shared between training and serving for parity.
- **Models** — Isolation Forest (anomaly), Random Forest (classifier), XGBoost/HistGB (boosted ensemble), soft-voted.
- **Training** — `ml/train.py` builds a labeled synthetic corpus with realistic overlap & label noise, evaluates (accuracy, macro-F1, AUC-OvR) and persists artifacts with joblib.
- **Serving** — `ml/engine.py` loads artifacts (auto-trains on first boot if missing) and returns explainable assessments.

## 4. Risk-Based Authentication

| Risk | Decision | Required verification |
| --- | --- | --- |
| < 32 | `allow` | none |
| 32–54 | `step_up` | OTP |
| 55–79 | `challenge` | OTP + Face (+ phone on device anomaly) |
| ≥ 80 | `block` | OTP + Live Camera + Voice + Phone callback |

## 5. Real-time pipeline

`FastAPI /ws/stream` scores synthetic sessions through the live ensemble and pushes events; the browser `RealtimeProvider` connects via WebSocket, falling back to SSE (`/api/stream`) then an in-browser simulator. Events hydrate a Zustand store consumed by the live feed, threat map and counters.

## 6. Data model

See `database/prisma/schema.prisma`: `Identity`, `BehavioralProfile`, `Device`, `Session`, `ThreatEvent`, `SecurityAlert`, `Incident` (+ `IncidentEvent`, `ResponseAction`), `Verification`, `AuditLog` (hash-chained), `SecurityPolicy`.

## 7. Deployment

`docker-compose.yml` orchestrates `db` (Postgres 16), `ai-engine` (pre-trained image) and `frontend` (Next.js standalone). CI (`.github/workflows/ci.yml`) lints/typechecks/builds the frontend, trains & tests the AI engine, and builds both Docker images.
