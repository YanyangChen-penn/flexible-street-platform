"""
predict.py
Step 3: Apply trained models to ALL streets in CompleteStreets → all_scores.csv
"""

import geopandas as gpd
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

# ─── Paths ─────────────────────────────────────────────────────────────────────
ML_DIR  = Path(__file__).parent
BASE    = ML_DIR.parent
GEO     = BASE / "flexible street data source"
ANCHORS = GEO / "anchors"
OUT     = ML_DIR / "all_scores.csv"

PROJ_CRS = "EPSG:32618"

ANCHOR_NAMES = ['school', 'hospital', 'landmark', 'historic']

# ─── Load Models ───────────────────────────────────────────────────────────────
print("Loading models...")
models = {}
for anchor in ANCHOR_NAMES:
    path = ML_DIR / f"model_{anchor}.pkl"
    if not path.exists():
        raise FileNotFoundError(f"Model not found: {path}\nRun train_model.py first.")
    models[anchor] = joblib.load(path)
    print(f"  Loaded model_{anchor}.pkl")

# ─── Load All Streets ──────────────────────────────────────────────────────────
print("\nLoading CompleteStreets (all streets)...")
streets = gpd.read_file(GEO / "CompleteStreets.geojson").to_crs(PROJ_CRS)
print(f"  Total streets: {len(streets):,}")

# ─── Load Anchors ──────────────────────────────────────────────────────────────
print("\nLoading anchors...")
anchor_gdfs = {
    'school':   gpd.read_file(ANCHORS / "Schools.geojson").to_crs(PROJ_CRS),
    'hospital': gpd.read_file(ANCHORS / "Hospitals.geojson").to_crs(PROJ_CRS),
    'landmark': gpd.read_file(ANCHORS / "Landmark_Poly.geojson").to_crs(PROJ_CRS),
    'historic': gpd.read_file(ANCHORS / "historic_sites_philreg.geojson").to_crs(PROJ_CRS),
}

# ─── Feature Engineering (same as build_dataset.py) ───────────────────────────
print("\nEngineering street features...")

def encode_sidewalk_width(val):
    mapping = {'12': 4, '10': 3, '8': 2, '6': 1}
    if pd.isna(val): return 0
    for k, v in mapping.items():
        if k in str(val): return v
    return 0

def encode_walk_zone(val):
    mapping = {'6': 3, '5': 2, '4': 1}
    if pd.isna(val): return 0
    for k, v in mapping.items():
        if k in str(val): return v
    return 0

streets['f_is_local']       = (streets['CLASS1'] == 'Local Residential').astype(int)
streets['f_speedlim']       = pd.to_numeric(streets['SPEEDLIM'], errors='coerce').fillna(30)
streets['f_sidewalk_width'] = streets['SIDEWLK_WD'].apply(encode_sidewalk_width)
streets['f_walk_zone']      = streets['WLK_ZN'].apply(encode_walk_zone)
streets['f_is_twoway']      = (streets['ONEWAY'] == 'B').astype(int)
streets['f_phase2']         = (streets['PHASE2_SID'] == 'Yes').astype(int)
streets['f_has_bike']       = streets['BIKENETWOR'].notna().astype(int)
streets['f_length_miles']   = streets['LENGTH_MIL'].fillna(0)

# ─── Anchor Distance & Count Features ─────────────────────────────────────────
print("\nCalculating anchor features (this may take a few minutes)...")

def to_points(gdf):
    gdf = gdf.copy()
    if gdf.geometry.geom_type.isin(['Polygon', 'MultiPolygon']).any():
        gdf['geometry'] = gdf.geometry.centroid
    return gdf[['geometry']]

def nearest_distance(streets_gdf, anchors_gdf):
    centroids = gpd.GeoDataFrame(
        geometry=streets_gdf.geometry.centroid, crs=streets_gdf.crs
    )
    anchors_pts = to_points(anchors_gdf)
    result = gpd.sjoin_nearest(centroids, anchors_pts, how='left', distance_col='dist')
    return result.groupby(result.index)['dist'].min().reindex(streets_gdf.index)

def count_within_radius(streets_gdf, anchors_gdf, radius=500):
    buffers = gpd.GeoDataFrame(
        geometry=streets_gdf.geometry.centroid.buffer(radius),
        crs=streets_gdf.crs,
        index=streets_gdf.index
    )
    anchors_pts = to_points(anchors_gdf)
    joined = gpd.sjoin(buffers, anchors_pts, how='left', predicate='contains')
    return joined.groupby(joined.index).size().reindex(streets_gdf.index, fill_value=0)

for name, gdf in anchor_gdfs.items():
    print(f"  Processing {name}...")
    streets[f'f_dist_{name}']       = nearest_distance(streets, gdf)
    streets[f'f_count_{name}_500m'] = count_within_radius(streets, gdf, radius=500)

# ─── Predict with Each Model ───────────────────────────────────────────────────
print("\nPredicting scores for all streets...")

scores_df = streets[['SEG_ID', 'STNAME']].copy().reset_index(drop=True)
X_all     = streets.reset_index(drop=True)

for anchor in ANCHOR_NAMES:
    bundle   = models[anchor]
    model    = bundle['model']
    features = bundle['features']

    X = X_all[features].fillna(0)
    proba = model.predict_proba(X)[:, 1]
    scores_df[f'{anchor}_score'] = (proba * 100).round(1)
    print(f"  {anchor}: done (max={proba.max()*100:.1f}, mean={proba.mean()*100:.1f})")

# ─── Save ──────────────────────────────────────────────────────────────────────
scores_df.to_csv(OUT, index=False)

print(f"\nAll scores saved → {OUT}")
print(f"Shape: {scores_df.shape}")
print("\nScore statistics:")
score_cols = [f'{a}_score' for a in ANCHOR_NAMES]
print(scores_df[score_cols].describe().round(1))
print("\nTop 10 streets by school_score:")
print(scores_df.nlargest(10, 'school_score')[['STNAME'] + score_cols].to_string(index=False))
print("\nDone.")
