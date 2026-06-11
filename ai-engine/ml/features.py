"""
Absher Neuron 2.0 — Feature engineering
Author: Abdulaziz AlAmawi

Defines the canonical behavioral + contextual feature vector consumed by every
model in the engine. Keeping this in one place guarantees train/serve parity.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import List

import numpy as np

FEATURE_NAMES: List[str] = [
    "typing_speed_cpm",
    "typing_rhythm_variance",
    "key_hold_ms",
    "flight_time_ms",
    "mouse_velocity",
    "mouse_jitter",
    "mouse_idle_ratio",
    "interaction_count",
    "device_trusted",
    "ip_reputation",
    "vpn_detected",
    "tor_detected",
    "proxy_detected",
    "geo_expected",
    "hour_of_day",
    "failed_attempts",
    "typing_deviation",
    "velocity_deviation",
]

# Population baselines used to derive deviation features at serve time.
BASELINE_TYPING_CPM = 240.0
BASELINE_MOUSE_VELOCITY = 420.0

# Threat category label space for the supervised classifier.
THREAT_CLASSES: List[str] = [
    "benign",
    "account_takeover",
    "credential_theft",
    "bot_activity",
    "location_anomaly",
    "device_anomaly",
    "brute_force",
]


@dataclass
class SessionFeatures:
    typing_speed_cpm: float = BASELINE_TYPING_CPM
    typing_rhythm_variance: float = 0.15
    key_hold_ms: float = 95.0
    flight_time_ms: float = 120.0
    mouse_velocity: float = BASELINE_MOUSE_VELOCITY
    mouse_jitter: float = 0.2
    mouse_idle_ratio: float = 0.3
    interaction_count: float = 25.0
    device_trusted: int = 1
    ip_reputation: float = 90.0
    vpn_detected: int = 0
    tor_detected: int = 0
    proxy_detected: int = 0
    geo_expected: int = 1
    hour_of_day: int = 12
    failed_attempts: int = 0

    def to_vector(self) -> np.ndarray:
        typing_dev = abs(self.typing_speed_cpm - BASELINE_TYPING_CPM) / BASELINE_TYPING_CPM
        velocity_dev = abs(self.mouse_velocity - BASELINE_MOUSE_VELOCITY) / BASELINE_MOUSE_VELOCITY
        row = [
            self.typing_speed_cpm,
            self.typing_rhythm_variance,
            self.key_hold_ms,
            self.flight_time_ms,
            self.mouse_velocity,
            self.mouse_jitter,
            self.mouse_idle_ratio,
            self.interaction_count,
            float(self.device_trusted),
            self.ip_reputation,
            float(self.vpn_detected),
            float(self.tor_detected),
            float(self.proxy_detected),
            float(self.geo_expected),
            float(self.hour_of_day),
            float(self.failed_attempts),
            typing_dev,
            velocity_dev,
        ]
        return np.asarray(row, dtype=np.float64)

    def as_dict(self) -> dict:
        return asdict(self)
