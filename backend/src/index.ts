/**
 * Absher Neuron 2.0 — Node.js REST API Gateway
 * Author: Abdulaziz AlAmawi
 *
 * Enterprise API layer for identity, threat and incident operations.
 * Proxies to PostgreSQL via Prisma; complements the FastAPI AI engine.
 */
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "Absher Neuron 2.0 — API Gateway",
    owner: "Abdulaziz AlAmawi",
    version: "2.0.0",
    endpoints: ["/health", "/api/threats", "/api/alerts", "/api/incidents", "/api/identities", "/api/sessions", "/api/audit"],
  });
});

app.get("/health", async (_req, res) => {
  let db = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "connected";
  } catch { /* noop */ }
  res.json({ status: "operational", owner: "Abdulaziz AlAmawi", database: db });
});

app.get("/api/threats", async (req, res) => {
  try {
    const limit = Math.min(200, Number(req.query.limit) || 60);
    const rows = await prisma.threatEvent.findMany({
      include: { identity: true },
      orderBy: { detectedAt: "desc" },
      take: limit,
    });
    res.json({ count: rows.length, threats: rows });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/alerts", async (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 24);
    const rows = await prisma.securityAlert.findMany({
      include: { identity: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json({ count: rows.length, alerts: rows });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/incidents", async (_req, res) => {
  try {
    const rows = await prisma.incident.findMany({
      include: { timeline: true, actions: true },
      orderBy: { openedAt: "desc" },
      take: 20,
    });
    res.json({ count: rows.length, incidents: rows });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/identities", async (_req, res) => {
  try {
    const rows = await prisma.identity.findMany({
      include: { devices: true },
      orderBy: { riskScore: "desc" },
      take: 50,
    });
    res.json({ count: rows.length, identities: rows });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/sessions", async (_req, res) => {
  try {
    const rows = await prisma.session.findMany({
      where: { active: true },
      include: { identity: true, device: true },
      orderBy: { riskScore: "desc" },
      take: 50,
    });
    res.json({ count: rows.length, sessions: rows });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/audit", async (_req, res) => {
  try {
    const rows = await prisma.auditLog.findMany({ orderBy: { at: "desc" }, take: 100 });
    res.json({ count: rows.length, logs: rows });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.listen(PORT, () => {
  console.log(`[Neuron API] Gateway listening on :${PORT} — Abdulaziz AlAmawi`);
});
