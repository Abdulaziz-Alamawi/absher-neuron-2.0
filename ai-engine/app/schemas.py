"""
Absher Neuron 2.0 — API schemas
Author: Abdulaziz AlAmawi
"""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class AssessRequest(BaseModel):
    typing_speed_cpm: float = Field(240, ge=0, le=2000)
    typing_rhythm_variance: float = Field(0.15, ge=0, le=1)
    key_hold_ms: float = Field(95, ge=0, le=1000)
    flight_time_ms: float = Field(120, ge=0, le=2000)
    mouse_velocity: float = Field(420, ge=0, le=5000)
    mouse_jitter: float = Field(0.2, ge=0, le=1)
    mouse_idle_ratio: float = Field(0.3, ge=0, le=1)
    interaction_count: float = Field(25, ge=0)
    device_trusted: int = Field(1, ge=0, le=1)
    ip_reputation: float = Field(90, ge=0, le=100)
    vpn_detected: int = Field(0, ge=0, le=1)
    tor_detected: int = Field(0, ge=0, le=1)
    proxy_detected: int = Field(0, ge=0, le=1)
    geo_expected: int = Field(1, ge=0, le=1)
    hour_of_day: int = Field(12, ge=0, le=23)
    failed_attempts: int = Field(0, ge=0, le=50)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "typing_speed_cpm": 95, "device_trusted": 0, "geo_expected": 0,
                    "ip_reputation": 35, "tor_detected": 1, "failed_attempts": 4,
                }
            ]
        }
    }


class FeatureImportance(BaseModel):
    feature: str
    weight: float


class AssessResponse(BaseModel):
    model_version: str
    trust_score: int
    risk_score: int
    confidence_score: int
    anomaly_score: float
    predicted_threat: Optional[str]
    decision: str
    required_verification: List[str]
    class_probabilities: Dict[str, float]
    feature_importance: List[FeatureImportance]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    owner: str
    models_ready: bool


class MetricsResponse(BaseModel):
    metrics: Dict
