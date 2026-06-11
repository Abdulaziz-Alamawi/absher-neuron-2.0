"""
Absher Neuron 2.0 — Model training pipeline
Author: Abdulaziz AlAmawi

Trains and persists the predictive threat ensemble:
  * Isolation Forest  — unsupervised anomaly detection
  * Random Forest     — supervised threat classifier
  * Gradient Boosting — XGBoost (or sklearn HistGradientBoosting fallback)
  * StandardScaler    — shared feature scaler

Run:  python -m ml.train
"""
from __future__ import annotations

import json
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from .features import FEATURE_NAMES, THREAT_CLASSES
from .synthetic import make_dataset

MODEL_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_DIR.mkdir(exist_ok=True)

try:  # XGBoost is preferred but optional (wheels can be unavailable on some platforms)
    from xgboost import XGBClassifier  # type: ignore

    _HAS_XGB = True
except Exception:  # pragma: no cover
    _HAS_XGB = False


def train() -> dict:
    print("[Neuron] Generating synthetic identity-behavior corpus…")
    X, y = make_dataset()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    scaler = StandardScaler().fit(X_train)
    Xtr, Xte = scaler.transform(X_train), scaler.transform(X_test)

    # 1) Isolation Forest (unsupervised) — fit on benign-only feature space
    print("[Neuron] Training Isolation Forest (anomaly detection)…")
    benign = Xtr[y_train == 0]
    iforest = IsolationForest(n_estimators=200, contamination=0.12, random_state=42, n_jobs=-1)
    iforest.fit(benign)

    # 2) Random Forest (supervised multiclass)
    print("[Neuron] Training Random Forest (threat classifier)…")
    rf = RandomForestClassifier(n_estimators=300, max_depth=18, class_weight="balanced", random_state=42, n_jobs=-1)
    rf.fit(Xtr, y_train)

    # 3) Gradient-boosted ensemble
    if _HAS_XGB:
        print("[Neuron] Training XGBoost (gradient-boosted ensemble)…")
        gb = XGBClassifier(
            n_estimators=400, max_depth=6, learning_rate=0.1, subsample=0.9,
            colsample_bytree=0.9, objective="multi:softprob", num_class=len(THREAT_CLASSES),
            tree_method="hist", eval_metric="mlogloss", n_jobs=-1, random_state=42,
        )
        gb.fit(Xtr, y_train)
        gb_name = "xgboost"
    else:
        print("[Neuron] XGBoost unavailable — using HistGradientBoosting fallback…")
        gb = HistGradientBoostingClassifier(max_iter=400, learning_rate=0.1, max_depth=8, random_state=42)
        gb.fit(Xtr, y_train)
        gb_name = "hist_gradient_boosting"

    # Evaluation (Random Forest as primary classifier)
    rf_pred = rf.predict(Xte)
    gb_pred = gb.predict(Xte)
    rf_proba = rf.predict_proba(Xte)

    metrics = {
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "owner": "Abdulaziz AlAmawi",
        "samples": int(len(y)),
        "features": FEATURE_NAMES,
        "classes": THREAT_CLASSES,
        "gradient_model": gb_name,
        "random_forest": {
            "accuracy": round(float(accuracy_score(y_test, rf_pred)), 4),
            "f1_macro": round(float(f1_score(y_test, rf_pred, average="macro")), 4),
            "auc_ovr": round(float(roc_auc_score(y_test, rf_proba, multi_class="ovr")), 4),
        },
        "gradient_boosting": {
            "accuracy": round(float(accuracy_score(y_test, gb_pred)), 4),
            "f1_macro": round(float(f1_score(y_test, gb_pred, average="macro")), 4),
        },
        "binary_anomaly_separation": _anomaly_quality(iforest, Xte, y_test),
    }

    joblib.dump(iforest, MODEL_DIR / "isolation_forest.joblib")
    joblib.dump(rf, MODEL_DIR / "random_forest.joblib")
    joblib.dump(gb, MODEL_DIR / "gradient_boosting.joblib")
    joblib.dump(scaler, MODEL_DIR / "scaler.joblib")
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2))

    print("\n[Neuron] Classification report (Random Forest):")
    print(classification_report(y_test, rf_pred, target_names=THREAT_CLASSES, zero_division=0))
    print(f"[Neuron] Artifacts saved to {MODEL_DIR}")
    print(f"[Neuron] RF accuracy={metrics['random_forest']['accuracy']} "
          f"AUC={metrics['random_forest']['auc_ovr']}")
    return metrics


def _anomaly_quality(iforest: IsolationForest, X: np.ndarray, y: np.ndarray) -> float:
    """ROC-AUC of the anomaly score separating benign (0) from any attack (>0)."""
    scores = -iforest.score_samples(X)  # higher = more anomalous
    binary = (y > 0).astype(int)
    try:
        return round(float(roc_auc_score(binary, scores)), 4)
    except Exception:
        return 0.0


if __name__ == "__main__":
    train()
