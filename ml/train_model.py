"""
train_model.py
Step 2: Train 4 XGBoost models (one per anchor type), evaluate, save scores + SHAP plots.
"""

import pandas as pd
import numpy as np
import xgboost as xgb
import shap
import joblib
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import roc_auc_score

# ─── Paths ─────────────────────────────────────────────────────────────────────
ML_DIR = Path(__file__).parent
df     = pd.read_csv(ML_DIR / "dataset.csv")

print(f"Dataset loaded: {df.shape}")
print(f"  Positive (1): {(df['label']==1).sum()}")
print(f"  Negative (0): {(df['label']==0).sum()}")

# ─── Feature Groups ─────────────────────────────────────────────────────────────
BASE_FEATURES = [
    'f_is_local', 'f_speedlim', 'f_sidewalk_width',
    'f_walk_zone', 'f_is_twoway', 'f_phase2',
    'f_has_bike', 'f_length_miles'
]

ANCHOR_FEATURES = {
    'school':   ['f_dist_school',   'f_count_school_500m'],
    'hospital': ['f_dist_hospital', 'f_count_hospital_500m'],
    'landmark': ['f_dist_landmark', 'f_count_landmark_500m'],
    'historic': ['f_dist_historic', 'f_count_historic_500m'],
}

# Class imbalance weight
neg = (df['label'] == 0).sum()
pos = (df['label'] == 1).sum()
scale_pos_weight = neg / pos
print(f"\nscale_pos_weight: {scale_pos_weight:.2f}")

# ─── XGBoost Config ─────────────────────────────────────────────────────────────
XGB_PARAMS = dict(
    objective        = 'binary:logistic',
    n_estimators     = 300,
    max_depth        = 4,
    learning_rate    = 0.05,
    subsample        = 0.8,
    colsample_bytree = 0.8,
    scale_pos_weight = scale_pos_weight,
    random_state     = 42,
    eval_metric      = 'auc',
)

# ─── Train & Evaluate ───────────────────────────────────────────────────────────
scores_df  = df[['SEG_ID', 'STNAME']].copy()
models     = {}
cv         = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
y          = df['label'].astype(int)

print("\n" + "="*50)

for anchor, anchor_feats in ANCHOR_FEATURES.items():
    features  = BASE_FEATURES + anchor_feats
    X         = df[features].fillna(0)

    print(f"\nTraining model: {anchor.upper()}")
    print(f"  Features: {features}")

    model = xgb.XGBClassifier(**XGB_PARAMS)

    # 5-fold cross-validation AUC
    auc_scores = cross_val_score(model, X, y, cv=cv, scoring='roc_auc')
    print(f"  CV AUC: {auc_scores.mean():.3f} ± {auc_scores.std():.3f}")

    # Train final model on full dataset
    model.fit(X, y)
    models[anchor] = model

    # Save model to disk
    model_path = ML_DIR / f"model_{anchor}.pkl"
    joblib.dump({'model': model, 'features': features}, model_path)
    print(f"  Model saved → ml/model_{anchor}.pkl")

    # Predict probability scores → scale to 0-100
    proba = model.predict_proba(X)[:, 1]
    scores_df[f'{anchor}_score'] = (proba * 100).round(1)

    # ── SHAP Feature Importance ──────────────────────────────────────────────
    explainer  = shap.TreeExplainer(model)
    shap_vals  = explainer.shap_values(X)

    fig, ax = plt.subplots(figsize=(8, 5))
    shap.summary_plot(shap_vals, X, plot_type='bar', show=False)
    plt.title(f'Feature Importance — {anchor.capitalize()} Model')
    plt.tight_layout()
    fig.savefig(ML_DIR / f'shap_{anchor}.png', dpi=150)
    plt.close()
    print(f"  SHAP plot saved → ml/shap_{anchor}.png")

# ─── Save Scores ────────────────────────────────────────────────────────────────
out_path = ML_DIR / "scores.csv"
scores_df.to_csv(out_path, index=False)

print("\n" + "="*50)
print(f"Scores saved → {out_path}")
print(f"Shape: {scores_df.shape}")
print("\nSample scores:")
print(scores_df.head(10).to_string(index=False))
print("\nScore statistics:")
score_cols = [c for c in scores_df.columns if c.endswith('_score')]
print(scores_df[score_cols].describe().round(1))
print("\nDone.")
