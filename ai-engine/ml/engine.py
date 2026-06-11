"""
Absher Neuron 2.0 — Inference engine
Author: Abdulaziz AlAmawi

Loads the trained ensemble and produces an explainable risk assessment:
Trust / Risk / Confidence scores, an adaptive-MFA decision and the predicted
threat category with per-feature contributions.
"""
from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Dict, List, Optional

import joblib
import numpy as np

from .features import SessionFeatures, FEATURE_NAMES, THREAT_CLASSES

MODEL_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_VERSION = "neuron-ensemble-2.0.0"

_LOCK = Lock()


class ThreatEngine:
    def __init__(self) -> None:
        self.iforest = None
        self.rf = None
        self.gb = None
        self.scaler = None
        self.metrics: Dict = {}
        self.ready = False

    def load(self) -> bool:
        with _LOCK:
            try:
                self.iforest = joblib.load(MODEL_DIR / "isolation_forest.joblib")
                self.rf = joblib.load(MODEL_DIR / "random_forest.joblib")
                self.gb = joblib.load(MODEL_DIR / "gradient_boosting.joblib")
                self.scaler = joblib.load(MODEL_DIR / "scaler.joblib")
                mp = MODEL_DIR / "metrics.json"
                self.metrics = json.loads(mp.read_text()) if mp.exists() else {}
                self.ready = True
            except Exception:
                self.ready = False
        return self.ready

    def ensure(self) -> None:
        if not self.ready:
            if not self.load():
                from .train import train
                train()
                self.load()

    def assess(self, feats: SessionFeatures) -> Dict:
        self.ensure()
        x = feats.to_vector().reshape(1, -1)
        xs = self.scaler.transform(x)

        # Anomaly score -> normalize to 0..100 risk
        raw_anomaly = float(self.iforest.score_samples(xs)[0])  # higher = normal
        anomaly_norm = float(np.clip((0.15 - raw_anomaly) / 0.6, 0, 1))

        # Supervised probabilities (RF + GB soft-vote)
        rf_proba = self.rf.predict_proba(xs)[0]
        gb_proba = self._gb_proba(xs)
        proba = (rf_proba + gb_proba) / 2.0

        benign_p = float(proba[0])
        threat_idx = int(np.argmax(proba))
        threat_p = float(proba[threat_idx])
        predicted = THREAT_CLASSES[threat_idx]

        malicious_mass = float(1.0 - benign_p)
        risk = float(np.clip(100 * (0.55 * malicious_mass + 0.45 * anomaly_norm), 0, 100))
        confidence = float(np.clip(100 * abs(threat_p - benign_p) * 0.6 + 40, 0, 100))
        trust = float(np.clip(100 - risk, 0, 100))

        decision = self._decide(risk, confidence)
        return {
            "model_version": MODEL_VERSION,
            "trust_score": round(trust),
            "risk_score": round(risk),
            "confidence_score": round(confidence),
            "anomaly_score": round(raw_anomaly, 4),
            "predicted_threat": predicted if predicted != "benign" else None,
            "decision": decision,
            "required_verification": self._verification(decision),
            "class_probabilities": {THREAT_CLASSES[i]: round(float(p), 4) for i, p in enumerate(proba)},
            "feature_importance": self._importance(),
        }

    def _gb_proba(self, xs: np.ndarray) -> np.ndarray:
        proba = self.gb.predict_proba(xs)[0]
        # Align width with class space if model saw fewer classes
        if len(proba) != len(THREAT_CLASSES):
            full = np.zeros(len(THREAT_CLASSES))
            classes = getattr(self.gb, "classes_", np.arange(len(proba)))
            for p, c in zip(proba, classes):
                full[int(c)] = p
            return full
        return proba

    def _importance(self) -> List[Dict]:
        if self.rf is None:
            return []
        imp = self.rf.feature_importances_
        pairs = sorted(zip(FEATURE_NAMES, imp), key=lambda kv: kv[1], reverse=True)
        return [{"feature": f, "weight": round(float(w), 4)} for f, w in pairs[:8]]

    @staticmethod
    def _decide(risk: float, confidence: float) -> str:
        adj = risk + (10 if confidence < 50 else 0)
        if adj >= 80:
            return "block"
        if adj >= 55:
            return "challenge"
        if adj >= 32:
            return "step_up"
        return "allow"

    @staticmethod
    def _verification(decision: str) -> List[str]:
        return {
            "allow": [],
            "step_up": ["otp"],
            "challenge": ["otp", "face", "phone_call"],
            "block": ["otp", "live_camera", "voice", "phone_call"],
        }[decision]


ENGINE = ThreatEngine()
