import type { Anchor, LayerConfig, TimeBin } from '../types';

// 费城中心坐标
export const PHILADELPHIA_CENTER = {
  latitude: 39.9526,
  longitude: -75.1652,
  zoom: 12
};

// 示例锚点数据（费城市中心区域）
export const sampleAnchors: Anchor[] = [
  // 教育设施
  {
    id: 'edu-1',
    name: 'Central High School',
    type: 'education',
    latitude: 39.9286,
    longitude: -75.1452,
    subtype: 'K-12 School'
  },
  {
    id: 'edu-2',
    name: 'University of Pennsylvania',
    type: 'education',
    latitude: 39.9522,
    longitude: -75.1932,
    subtype: 'University'
  },
  // 餐饮
  {
    id: 'food-1',
    name: 'Reading Terminal Market',
    type: 'food-beverage',
    latitude: 39.9533,
    longitude: -75.1581,
    subtype: 'Food Market'
  },
  {
    id: 'food-2',
    name: 'DiNardo\'s Famous Seafood',
    type: 'food-beverage',
    latitude: 39.9478,
    longitude: -75.1467,
    subtype: 'Restaurant'
  },
  // 文化机构
  {
    id: 'cult-1',
    name: 'Philadelphia Museum of Art',
    type: 'cultural',
    latitude: 39.9656,
    longitude: -75.1810,
    subtype: 'Museum'
  },
  {
    id: 'cult-2',
    name: 'Free Library of Philadelphia',
    type: 'cultural',
    latitude: 39.9584,
    longitude: -75.1712,
    subtype: 'Library'
  },
  // 社区服务
  {
    id: 'comm-1',
    name: 'Philly Community Center',
    type: 'community',
    latitude: 39.9445,
    longitude: -75.1598,
    subtype: 'Community Center'
  },
  // 公园娱乐
  {
    id: 'rec-1',
    name: 'Rittenhouse Square',
    type: 'recreation',
    latitude: 39.9495,
    longitude: -75.1719,
    subtype: 'Park'
  },
  {
    id: 'rec-2',
    name: 'Love Park',
    type: 'recreation',
    latitude: 39.9540,
    longitude: -75.1652,
    subtype: 'Park'
  },
  // 交通枢纽
  {
    id: 'trans-1',
    name: '30th Street Station',
    type: 'transit',
    latitude: 39.9566,
    longitude: -75.1818,
    subtype: 'Train Station'
  },
  {
    id: 'trans-2',
    name: 'City Hall Station',
    type: 'transit',
    latitude: 39.9526,
    longitude: -75.1652,
    subtype: 'Subway Station'
  },
  // 娱乐旅游
  {
    id: 'ent-1',
    name: 'Liberty Bell Center',
    type: 'entertainment',
    latitude: 39.9496,
    longitude: -75.1503,
    subtype: 'Tourist Attraction'
  },
  {
    id: 'ent-2',
    name: 'Wells Fargo Center',
    type: 'entertainment',
    latitude: 39.9012,
    longitude: -75.1720,
    subtype: 'Arena'
  }
];

// 图层配置
export const layerConfigs: LayerConfig[] = [
  { id: 'education', name: 'Education', visible: true, color: '#3B82F6', icon: '🎓' },
  { id: 'food-beverage', name: 'Food & Beverage', visible: true, color: '#EF4444', icon: '🍴' },
  { id: 'cultural', name: 'Cultural', visible: true, color: '#8B5CF6', icon: '🎨' },
  { id: 'community', name: 'Community', visible: true, color: '#10B981', icon: '🏘️' },
  { id: 'recreation', name: 'Recreation', visible: true, color: '#22C55E', icon: '🌳' },
  { id: 'events', name: 'Events', visible: true, color: '#F59E0B', icon: '🎪' },
  { id: 'health', name: 'Health', visible: true, color: '#EC4899', icon: '🏥' },
  { id: 'transit', name: 'Transit', visible: true, color: '#6366F1', icon: '🚇' },
  { id: 'commercial', name: 'Commercial', visible: true, color: '#F97316', icon: '🏪' },
  { id: 'religious', name: 'Religious', visible: true, color: '#A855F7', icon: '⛪' },
  { id: 'entertainment', name: 'Entertainment', visible: true, color: '#EC4899', icon: '🎭' }
];

// 时间段
export const timeBins: TimeBin[] = [
  { id: 'morning', label: 'Morning (6-12)', startHour: 6, endHour: 12 },
  { id: 'afternoon', label: 'Afternoon (12-18)', startHour: 12, endHour: 18 },
  { id: 'evening', label: 'Evening (18-24)', startHour: 18, endHour: 24 },
  { id: 'night', label: 'Night (0-6)', startHour: 0, endHour: 6 }
];
