/* ── Scenario IDs ── */
export type ScenarioId =
  | 'school_dismissal'
  | 'weekend_market'
  | 'dining_activation'
  | 'play_street'
  | 'event_spillover'
  | 'transit_zone';

/* ── Anchor (from Supabase anchors table) ── */
export interface Anchor {
  id: number;
  name: string;
  scenarioId: ScenarioId;
  amenity: string;
  latitude: number;
  longitude: number;
  sourceTable?: string;
  metadata?: Record<string, any>;
}

/* ── Scenario layer config ── */
export interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  description: string;
  icon: string;
  color: string;
  glowRgb: string;
  visible: boolean;
}

/* ── Street segment ── */
export interface StreetSegment {
  id: string;
  name: string;
  geometry: GeoJSON.LineString;
  classification: 'state' | 'city' | 'local' | 'alley';
  fsiScore?: number;
  anchorCount?: number;
}

/* ── Time bin ── */
export interface TimeBin {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

/* ── FSI score ── */
export interface FSIScore {
  streetId: string;
  timeBinId: string;
  score: number;
  factors: {
    anchorActivity: number;
    trafficVolume: number;
    weather: number;
    safety: number;
  };
}

/* ── Legacy compat ── */
export type LayerConfig = ScenarioConfig;
