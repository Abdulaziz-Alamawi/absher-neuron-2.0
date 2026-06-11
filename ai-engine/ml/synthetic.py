"""
Absher Neuron 2.0 — Synthetic identity-behavior corpus
Author: Abdulaziz AlAmawi

Generates a labeled dataset that mimics genuine vs. malicious authentication
sessions across multiple attack archetypes. Used to fit the Isolation Forest,
Random Forest and gradient-boosted ensemble.
"""
from __future__ import annotations

from typing import Tuple

import numpy as np

from .features import (
    FEATURE_NAMES,
    THREAT_CLASSES,
    BASELINE_TYPING_CPM,
    BASELINE_MOUSE_VELOCITY,
)


def _benign(rng: np.random.Generator, n: int) -> np.ndarray:
    typing = rng.normal(BASELINE_TYPING_CPM, 35, n).clip(60, 480)
    velocity = rng.normal(BASELINE_MOUSE_VELOCITY, 70, n).clip(80, 900)
    return np.column_stack([
        typing,
        rng.normal(0.16, 0.05, n).clip(0, 1),
        rng.normal(95, 18, n).clip(40, 220),
        rng.normal(120, 25, n).clip(50, 300),
        velocity,
        rng.normal(0.2, 0.07, n).clip(0, 1),
        rng.normal(0.3, 0.12, n).clip(0, 1),
        rng.normal(28, 8, n).clip(3, 80),
        np.ones(n),  # device trusted
        rng.normal(92, 5, n).clip(40, 100),  # ip reputation
        np.zeros(n), np.zeros(n), np.zeros(n),  # vpn/tor/proxy
        np.ones(n),  # geo expected
        rng.integers(7, 23, n),  # hour
        np.zeros(n),  # failed attempts
        np.abs(typing - BASELINE_TYPING_CPM) / BASELINE_TYPING_CPM,
        np.abs(velocity - BASELINE_MOUSE_VELOCITY) / BASELINE_MOUSE_VELOCITY,
    ])


def _attack(rng: np.random.Generator, n: int, kind: str) -> np.ndarray:
    base = _benign(rng, n)
    idx = {name: i for i, name in enumerate(FEATURE_NAMES)}

    if kind == "account_takeover":
        base[:, idx["typing_speed_cpm"]] = rng.normal(120, 60, n).clip(20, 500)
        base[:, idx["device_trusted"]] = 0
        base[:, idx["geo_expected"]] = 0
        base[:, idx["ip_reputation"]] = rng.normal(45, 20, n).clip(0, 90)
    elif kind == "credential_theft":
        base[:, idx["device_trusted"]] = 0
        base[:, idx["ip_reputation"]] = rng.normal(30, 18, n).clip(0, 70)
        base[:, idx["proxy_detected"]] = (rng.random(n) > 0.4).astype(float)
        base[:, idx["failed_attempts"]] = rng.integers(0, 3, n)
    elif kind == "bot_activity":
        base[:, idx["mouse_jitter"]] = rng.normal(0.02, 0.02, n).clip(0, 1)
        base[:, idx["mouse_idle_ratio"]] = rng.normal(0.95, 0.04, n).clip(0, 1)
        base[:, idx["interaction_count"]] = rng.normal(2, 1.5, n).clip(0, 10)
        base[:, idx["typing_speed_cpm"]] = rng.normal(700, 150, n).clip(400, 1200)
        base[:, idx["typing_rhythm_variance"]] = rng.normal(0.02, 0.01, n).clip(0, 1)
    elif kind == "location_anomaly":
        base[:, idx["geo_expected"]] = 0
        base[:, idx["vpn_detected"]] = (rng.random(n) > 0.3).astype(float)
        base[:, idx["ip_reputation"]] = rng.normal(55, 20, n).clip(0, 95)
    elif kind == "device_anomaly":
        base[:, idx["device_trusted"]] = 0
        base[:, idx["mouse_velocity"]] = rng.normal(900, 200, n).clip(80, 1600)
        base[:, idx["typing_speed_cpm"]] = rng.normal(150, 80, n).clip(20, 500)
    elif kind == "brute_force":
        base[:, idx["failed_attempts"]] = rng.integers(3, 12, n)
        base[:, idx["ip_reputation"]] = rng.normal(35, 18, n).clip(0, 80)
        base[:, idx["tor_detected"]] = (rng.random(n) > 0.5).astype(float)

    # recompute deviation features after perturbation
    base[:, idx["typing_deviation"]] = np.abs(base[:, idx["typing_speed_cpm"]] - BASELINE_TYPING_CPM) / BASELINE_TYPING_CPM
    base[:, idx["velocity_deviation"]] = np.abs(base[:, idx["mouse_velocity"]] - BASELINE_MOUSE_VELOCITY) / BASELINE_MOUSE_VELOCITY
    return base


def make_dataset(n_benign: int = 6000, n_attack_each: int = 900, seed: int = 2026) -> Tuple[np.ndarray, np.ndarray]:
    """Return (X, y) where y is the integer index into THREAT_CLASSES."""
    rng = np.random.default_rng(seed)
    blocks = [_benign(rng, n_benign)]
    labels = [np.zeros(n_benign, dtype=int)]

    for ci, kind in enumerate(THREAT_CLASSES[1:], start=1):
        blocks.append(_attack(rng, n_attack_each, kind))
        labels.append(np.full(n_attack_each, ci, dtype=int))

    X = np.vstack(blocks)
    y = np.concatenate(labels)

    # Inject realistic overlap so the decision boundary is non-trivial:
    # (1) additive measurement noise, (2) a fraction of "ambiguous" sessions
    # that partially regress toward the benign centroid, and (3) light label
    # noise to mimic mislabeled ground truth in production telemetry.
    X = X + rng.normal(0, 1.0, X.shape) * X.std(axis=0) * 0.06

    benign_centroid = X[y == 0].mean(axis=0)
    ambiguous = rng.random(len(y)) < 0.18
    blend = rng.uniform(0.25, 0.6, ambiguous.sum())[:, None]
    X[ambiguous] = (1 - blend) * X[ambiguous] + blend * benign_centroid

    flip = rng.random(len(y)) < 0.03
    y[flip] = rng.integers(0, len(THREAT_CLASSES), flip.sum())

    perm = rng.permutation(len(y))
    return X[perm], y[perm]
