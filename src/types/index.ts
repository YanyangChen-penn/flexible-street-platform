// 锚点类型定义
export type AnchorType = 
  | 'education' 
  | 'food-beverage' 
  | 'cultural' 
  | 'community' 
  | 'recreation' 
  | 'events' 
  | 'health' 
  | 'transit' 
  | 'commercial' 
  | 'religious' 
  | 'entertainment';

// 锚点接口
export interface Anchor {
  id: string;
  name: string;
  type: AnchorType;
  latitude: number;
  longitude: number;
  subtype?: string;
  metadata?: Record<string, any>;
}

// 街道路段
export interface StreetSegment {
  id: string;
  name: string;
  geometry: GeoJSON.LineString;
  classification: 'state' | 'city' | 'local' | 'alley';
  fsiScore?: number;
  anchorCount?: number;
}

// 时间段
export interface TimeBin {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

// FSI分数
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

// 图层配置
export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  icon?: string;
}