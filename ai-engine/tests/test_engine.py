"""
Absher Neuron 2.0 — Engine tests
Author: Abdulaziz AlAmawi
"""
from ml.engine import ENGINE
from ml.features import SessionFeatures, FEATURE_NAMES
from ml.synthetic import make_dataset


def test_dataset_shape():
    X, y = make_dataset(n_benign=500, n_attack_each=120)
    assert X.shape[1] == len(FEATURE_NAMES)
    assert len(X) == len(y)
    assert set(y.tolist()) <= set(range(7))


def test_engine_loads_and_scores():
    ENGINE.ensure()
    assert ENGINE.ready
    result = ENGINE.assess(SessionFeatures())
    for key in ("trust_score", "risk_score", "confidence_score", "decision"):
        assert key in result
    assert 0 <= result["risk_score"] <= 100
    assert 0 <= result["trust_score"] <= 100


def test_attack_scores_higher_than_benign():
    ENGINE.ensure()
    benign = ENGINE.assess(SessionFeatures(typing_speed_cpm=240, device_trusted=1, ip_reputation=95))
    attack = ENGINE.assess(
        SessionFeatures(
            typing_speed_cpm=90, device_trusted=0, geo_expected=0,
            ip_reputation=20, tor_detected=1, failed_attempts=6,
            mouse_idle_ratio=0.96, interaction_count=2,
        )
    )
    assert attack["risk_score"] > benign["risk_score"]
    assert attack["decision"] in ("challenge", "block")


def test_decision_mapping():
    assert ENGINE._decide(10, 90) == "allow"
    assert ENGINE._decide(40, 90) == "step_up"
    assert ENGINE._decide(60, 90) == "challenge"
    assert ENGINE._decide(85, 90) == "block"
