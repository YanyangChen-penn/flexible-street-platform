"""
build_dataset.py
Step 1: Load all GeoJSONs, generate labels, compute features, save dataset.csv
"""

import geopandas as gpd
import pandas as pd
import numpy as np
from pathlib import Path

# ─── Paths ─────────────────────────────────────────────────────────────────────
BASE    = Path(__file__).parent.parent
DATA    = BASE / "src" / "data"
GEO     = BASE / "flexible street data source"
ANCHORS = GEO / "anchors"
OUT     = Path(__file__).parent / "dataset.csv"

# Projected CRS for distance calculations (UTM Zone 18N, meters)
PROJ_CRS = "EPSG:32618"

# ─── Load Data ─────────────────────────────────────────────────────────────────
print("Loading GeoJSONs...")

streets    = gpd.read_file(GEO / "CompleteStreets.geojson").to_crs(PROJ_CRS)
playstreets = gpd.read_file(DATA / "PPR_Playstreets_Locations.geojson").to_crs(PROJ_CRS)
snow       = gpd.read_file(DATA / "SNOW_EMERGENCY_ROUTES.geojson")
schools    = gpd.read_file(ANCHORS / "Schools.geojson").to_crs(PROJ_CRS)
hospitals  = gpd.read_file(ANCHORS / "Hospitals.geojson").to_crs(PROJ_CRS)
landmarks  = gpd.read_file(ANCHORS / "Landmark_Poly.geojson").to_crs(PROJ_CRS)
historic   = gpd.read_file(ANCHORS / "historic_sites_philreg.geojson").to_crs(PROJ_CRS)

print(f"  Streets:            {len(streets):,}")
print(f"  Play Streets:       {len(playstreets):,}")
print(f"  Snow Emerg. Routes: {len(snow):,}")
print(f"  Schools:            {len(schools):,}")
print(f"  Hospitals:          {len(hospitals):,}")
print(f"  Landmarks:          {len(landmarks):,}")
print(f"  Historic Sites:     {len(historic):,}")

# ─── Step 1: Generate Labels ───────────────────────────────────────────────────
print("\nGenerating labels...")

# Positive (label=1): Play Streets points → nearest CompleteStreets segment within 100m
joined_pos = gpd.sjoin_nearest(
    playstreets, streets[['SEG_ID', 'geometry']],
    how='left', max_distance=100, distance_col='_dist'
)
positive_ids = set(joined_pos['SEG_ID'].dropna().astype(int))

# Negative (label=0): Snow Emergency Routes via SEG_ID
negative_ids_snow = set(snow['SEG_ID'].dropna().astype(int))

# Negative (label=0): Arterial roads from CompleteStreets
arterial_mask = streets['CLASS1'].str.contains(
    'Arterial|Principal|Expressway', case=False, na=False
)
negative_ids_arterial = set(streets.loc[arterial_mask, 'SEG_ID'].dropna().astype(int))

negative_ids = negative_ids_snow | negative_ids_arterial

# Assign labels; streets in both sets stay as positive (city decision overrides)
streets['label'] = np.nan
streets.loc[streets['SEG_ID'].isin(negative_ids), 'label'] = 0
streets.loc[streets['SEG_ID'].isin(positive_ids), 'label'] = 1   # positive wins

labeled = streets[streets['label'].notna()].copy()
print(f"  Positive (label=1): {(labeled['label']==1).sum():,}")
print(f"  Negative (label=0): {(labeled['label']==0).sum():,}")
print(f"  Total labeled:      {len(labeled):,}")

# ─── Step 2: Street Feature Engineering ───────────────────────────────────────
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

labeled['f_is_local']       = (labeled['CLASS1'] == 'Local Residential').astype(int)
labeled['f_speedlim']       = pd.to_numeric(labeled['SPEEDLIM'], errors='coerce').fillna(30)
labeled['f_sidewalk_width'] = labeled['SIDEWLK_WD'].apply(encode_sidewalk_width)
labeled['f_walk_zone']      = labeled['WLK_ZN'].apply(encode_walk_zone)
labeled['f_is_twoway']      = (labeled['ONEWAY'] == 'B').astype(int)
labeled['f_phase2']         = (labeled['PHASE2_SID'] == 'Yes').astype(int)
labeled['f_has_bike']       = labeled['BIKENETWOR'].notna().astype(int)
labeled['f_length_miles']   = labeled['LENGTH_MIL'].fillna(0)

# ─── Step 3: Anchor Distance & Count Features ──────────────────────────────────
print("\nCalculating anchor features (this may take a few minutes)...")

def to_points(gdf):
    """Convert polygon anchors to centroids for distance calculations."""
    gdf = gdf.copy()
    if gdf.geometry.geom_type.isin(['Polygon', 'MultiPolygon']).any():
        gdf['geometry'] = gdf.geometry.centroid
    return gdf[['geometry']]

def nearest_distance(streets_gdf, anchors_gdf):
    """Distance from each street centroid to nearest anchor (meters)."""
    centroids = gpd.GeoDataFrame(
        geometry=streets_gdf.geometry.centroid, crs=streets_gdf.crs
    )
    anchors_pts = to_points(anchors_gdf)
    result = gpd.sjoin_nearest(centroids, anchors_pts, how='left', distance_col='dist')
    return result.groupby(result.index)['dist'].min().reindex(streets_gdf.index)

def count_within_radius(streets_gdf, anchors_gdf, radius=500):
    """Count anchors within radius meters of each street centroid."""
    buffers = gpd.GeoDataFrame(
        geometry=streets_gdf.geometry.centroid.buffer(radius),
        crs=streets_gdf.crs,
        index=streets_gdf.index
    )
    anchors_pts = to_points(anchors_gdf)
    joined = gpd.sjoin(buffers, anchors_pts, how='left', predicate='contains')
    return joined.groupby(joined.index).size().reindex(streets_gdf.index, fill_value=0)

anchors = {
    'school':   schools,
    'hospital': hospitals,
    'landmark': landmarks,
    'historic': historic,
}

for name, gdf in anchors.items():
    print(f"  Processing {name}...")
    labeled[f'f_dist_{name}']       = nearest_distance(labeled, gdf)
    labeled[f'f_count_{name}_500m'] = count_within_radius(labeled, gdf, radius=500)

# ─── Step 4: Save ──────────────────────────────────────────────────────────────
feature_cols = [c for c in labeled.columns if c.startswith('f_')]
output_cols  = ['SEG_ID', 'STNAME', 'label'] + feature_cols

OUT.parent.mkdir(exist_ok=True)
labeled[output_cols].reset_index(drop=True).to_csv(OUT, index=False)

print(f"\nDataset saved → {OUT}")
print(f"Shape: {labeled[output_cols].shape}")
print(f"\nFeature columns ({len(feature_cols)}):")
for c in feature_cols:
    print(f"  {c}")
print("\nDone.")
