"""
Absher Neuron 2.0 — Live security event stream
Author: Abdulaziz AlAmawi

Produces real-time threat events scored by the engine, broadcast over the
WebSocket gateway to the command center.
"""
from __future__ import annotations

import random
import uuid
from datetime import datetime, timezone
from typing import Dict

from ml.engine import ENGINE
from ml.features import SessionFeatures

CITIES = [
    ("Riyadh", "Saudi Arabia", "SA", 24.71, 46.68, True),
    ("Jeddah", "Saudi Arabia", "SA", 21.49, 39.18, True),
    ("Dammam", "Saudi Arabia", "SA", 26.42, 50.09, True),
    ("Dubai", "UAE", "AE", 25.2, 55.27, False),
    ("Istanbul", "Türkiye", "TR", 41.01, 28.98, False),
    ("Frankfurt", "Germany", "DE", 50.11, 8.68, False),
    ("Moscow", "Russia", "RU", 55.75, 37.62, False),
    ("Lagos", "Nigeria", "NG", 6.52, 3.38, False),
]

NAMES = [
    "Sara AlQahtani", "Mohammed AlHarbi", "Noura AlOtaibi", "Khalid AlGhamdi",
    "Reem AlDosari", "Faisal AlShehri", "Yousef AlMutairi", "Turki AlRashid",
]

CATEGORY_MAP = {
    "account_takeover": "account_takeover",
    "credential_theft": "credential_theft",
    "bot_activity": "bot_activity",
    "location_anomaly": "location_anomaly",
    "device_anomaly": "device_anomaly",
    "brute_force": "brute_force",
}


def _random_features(anomalous: bool) -> SessionFeatures:
    if anomalous:
        return SessionFeatures(
            typing_speed_cpm=random.uniform(40, 700),
            mouse_jitter=random.uniform(0.0, 0.2),
            mouse_idle_ratio=random.uniform(0.6, 0.98),
            interaction_count=random.uniform(1, 12),
            device_trusted=random.choice([0, 0, 1]),
            ip_reputation=random.uniform(10, 70),
            vpn_detected=random.choice([0, 1]),
            tor_detected=random.choice([0, 0, 1]),
            geo_expected=random.choice([0, 1]),
            hour_of_day=random.randint(0, 23),
            failed_attempts=random.randint(0, 6),
        )
    return SessionFeatures(
        typing_speed_cpm=random.uniform(200, 290),
        ip_reputation=random.uniform(85, 99),
        interaction_count=random.uniform(20, 45),
    )


def severity_from_risk(risk: int) -> str:
    if risk >= 80:
        return "critical"
    if risk >= 60:
        return "high"
    if risk >= 40:
        return "medium"
    if risk >= 20:
        return "low"
    return "info"


def generate_event() -> Dict:
    """Score a synthetic session and shape it into a command-center event."""
    anomalous = random.random() > 0.45
    feats = _random_features(anomalous)
    result = ENGINE.assess(feats)

    city, country, cc, lat, lng, expected = random.choice(CITIES)
    category = result["predicted_threat"] or "suspicious_login"
    category = CATEGORY_MAP.get(category, "suspicious_login")
    name = random.choice(NAMES)

    return {
        "id": f"thr_{uuid.uuid4().hex[:10]}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "category": category,
        "severity": severity_from_risk(result["risk_score"]),
        "userId": f"usr_{random.randint(1000, 1027)}",
        "userName": name,
        "sourceIp": f"{random.randint(37, 217)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}",
        "geo": {
            "country": country, "countryCode": cc, "city": city,
            "lat": lat, "lng": lng, "expectedRegion": expected,
        },
        "riskScore": result["risk_score"],
        "confidence": result["confidence_score"],
        "decision": result["decision"],
        "description": f"{category.replace('_', ' ').title()} scored by Neuron ensemble from {city}, {country}.",
        "status": "active",
    }
