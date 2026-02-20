import type { ScenarioConfig, TimeBin } from '../types';

export const PHILADELPHIA_CENTER = {
  latitude: 39.9526,
  longitude: -75.1652,
  zoom: 12,
};

export const scenarioConfigs: ScenarioConfig[] = [
  {
    id: 'school_dismissal',
    name: 'School Dismissal',
    description: 'K-12 schools: arrival and dismissal pedestrian surges',
    icon: '🏫',
    color: '#3B82F6',
    glowRgb: '59,130,246',
    visible: false,
  },
  {
    id: 'weekend_market',
    name: 'Weekend Market',
    description: 'Farmers markets, community centres, cultural venues',
    icon: '🛒',
    color: '#F59E0B',
    glowRgb: '245,158,11',
    visible: false,
  },
  {
    id: 'dining_activation',
    name: 'Dining Activation',
    description: 'Restaurant and bar corridors for evening activation',
    icon: '🍽️',
    color: '#EF4444',
    glowRgb: '239,68,68',
    visible: false,
  },
  {
    id: 'play_street',
    name: 'Play Street',
    description: 'City-permitted summer play streets for children',
    icon: '🛝',
    color: '#10B981',
    glowRgb: '16,185,129',
    visible: false,
  },
  {
    id: 'event_spillover',
    name: 'Event Spillover',
    description: 'Major venues: pre/post event crowd management',
    icon: '🏟️',
    color: '#8B5CF6',
    glowRgb: '139,92,246',
    visible: false,
  },
  {
    id: 'transit_zone',
    name: 'Transit Zone',
    description: 'Transit hubs and multimodal access zones',
    icon: '🚇',
    color: '#6366F1',
    glowRgb: '99,102,241',
    visible: false,
  },
];

export const layerConfigs = scenarioConfigs;
export const sampleAnchors: any[] = [];

export const timeBins: TimeBin[] = [
  { id: 'morning',   label: 'Morning (6 – 12)',   startHour: 6,  endHour: 12 },
  { id: 'afternoon', label: 'Afternoon (12 – 18)', startHour: 12, endHour: 18 },
  { id: 'evening',   label: 'Evening (18 – 24)',   startHour: 18, endHour: 24 },
  { id: 'night',     label: 'Night (0 – 6)',       startHour: 0,  endHour: 6  },
];
