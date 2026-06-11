/**
 * Absher Neuron 2.0 — Server-side data access (shared with REST API routes)
 * Author: Abdulaziz AlAmawi
 *
 * Pages and API handlers both use this layer so the UI always reflects
 * the same Prisma-backed data (with generator fallback when DB is offline).
 */
export {
  getThreats,
  getAlerts,
  getIncidents,
  getIdentities,
  getSessions,
  getAuditLogs,
  getVerifications,
  getPolicies,
  getKpisFromDb,
} from "@/lib/db/repositories";

import { generateKpis, timeSeries } from "@/lib/data/generate";
import { getKpisFromDb } from "@/lib/db/repositories";
import type { KpiSnapshot } from "@/lib/types";

/** KPIs from DB when available, otherwise the static snapshot. */
export async function getKpis(): Promise<KpiSnapshot> {
  const db = await getKpisFromDb();
  if (db) {
    return {
      ...generateKpis(),
      identitiesProtected: db.identitiesProtected,
      threatsBlockedToday: db.threatsBlockedToday,
      activeIncidents: db.activeIncidents,
      avgTrustScore: db.avgTrustScore,
      liveSessions: db.liveSessions,
    };
  }
  return generateKpis();
}

export { timeSeries, severityDistribution, geoAggregate } from "@/lib/data/generate";
