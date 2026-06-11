import { NextRequest, NextResponse } from "next/server";
import { assessRisk, type ScoringContext } from "@/lib/scoring/engine";
import type {
  BehavioralSignals, BehavioralProfile, DeviceFingerprint, NetworkContext, GeoContext,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_PROFILE: BehavioralProfile = {
  userId: "usr_unknown",
  baselineTypingCpm: 240,
  baselineMouseVelocity: 420,
  baselineActiveHours: [8, 9, 10, 11, 13, 14, 15, 16, 20, 21, 22],
  knownDeviceIds: [],
  knownLocations: ["Riyadh, SA"],
  samples: 40,
  confidence: 80,
  lastUpdated: new Date().toISOString(),
};

/**
 * POST /api/assess
 * Body: { signals, device, network, geo, profile?, hourOfDay?, failedAttempts? }
 * Returns a full, explainable RiskAssessment from the behavioral engine.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signals = body.signals as BehavioralSignals;
    const device = body.device as DeviceFingerprint;
    const network = body.network as NetworkContext;
    const geo = body.geo as GeoContext;

    if (!signals || !device || !network || !geo) {
      return NextResponse.json({ error: "Missing required context: signals, device, network, geo." }, { status: 400 });
    }

    const ctx: ScoringContext = {
      signals,
      device,
      network,
      geo,
      profile: body.profile ?? DEFAULT_PROFILE,
      hourOfDay: body.hourOfDay ?? new Date().getHours(),
      failedAttempts: body.failedAttempts ?? 0,
    };

    return NextResponse.json(assessRisk(ctx));
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
