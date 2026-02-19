import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Anchor } from '../types';
import { PHILADELPHIA_CENTER } from '../data/mockData';
import { supabase } from '../lib/supabase';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapComponentProps {
  anchors: Anchor[];
  visibleLayers: Set<string>;
  selectedTimeBin?: string;
  onAnchorClick?: (anchor: Anchor) => void;
  showTraffic?: boolean;
  showStreetCenterline?: boolean;
  showPOI?: boolean;
}

/* ── Anchor marker palette ── */
const PAL: Record<string, { c: string; g: string }> = {
  'education':     { c: '#6B9BF7', g: '107,155,247' },
  'food-beverage': { c: '#F06B5B', g: '240,107,91'  },
  'cultural':      { c: '#A87EF2', g: '168,126,242' },
  'community':     { c: '#34D399', g: '52,211,153'  },
  'recreation':    { c: '#3DD68C', g: '61,214,140'  },
  'events':        { c: '#FBBF24', g: '251,191,36'  },
  'health':        { c: '#F472B6', g: '244,114,182' },
  'transit':       { c: '#818CF8', g: '129,140,248' },
  'commercial':    { c: '#FB923C', g: '251,146,60'  },
  'religious':     { c: '#C084FC', g: '192,132,252' },
  'entertainment': { c: '#F472B6', g: '244,114,182' },
};
const FB = { c: '#94A3B8', g: '148,163,184' };

/* ── Street Centerline color palette ── */
export const STREET_COLORS: [string, string][] = [
  ['CITY',           '#6366F1'],
  ['STATE',          '#F43F5E'],
  ['SEPTA',          '#F59E0B'],
  ['PRIVATE',        '#8B5CF6'],
  ['FAIRMOUNT PARK', '#10B981'],
  ['PHA',            '#3B82F6'],
  ['PIDC',           '#06B6D4'],
  ['DRPA',           '#EC4899'],
  ['FAM',            '#14B8A6'],
  ['AIRPORT',        '#A78BFA'],
  ['BCBC',           '#FB923C'],
  ['STRICKEN',       '#EF4444'],
  ['TOWNSHIP',       '#67E8F9'],
];
export const STREET_FALLBACK = '#475569';

/* ── POI category palette ── */
export const POI_COLORS: [string, string][] = [
  ['Education',     '#60A5FA'],
  ['Healthcare',    '#F87171'],
  ['Food & Dining', '#FB923C'],
  ['Religious',     '#C084FC'],
  ['Community',     '#34D399'],
  ['Public Safety', '#FBBF24'],
  ['Culture',       '#F472B6'],
  ['Finance',       '#38BDF8'],
  ['Transport',     '#A78BFA'],
];
const POI_FALLBACK = '#64748B';

/* Empty GeoJSON */
const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

/* ── CSS injection for anchor markers ── */
let _inj = false;
function injectCSS() {
  if (_inj) return;
  _inj = true;
  document.head.insertAdjacentHTML('beforeend', `<style id="anch-css">
@keyframes a-pulse {
  0%   { opacity: 0;    transform: scale(1);   }
  10%  { opacity: 0.45; }
  100% { opacity: 0;    transform: scale(3.2);  }
}
@keyframes a-glow {
  0%, 100% { box-shadow: 0 0 5px 2px rgba(var(--g),0.4); }
  50%      { box-shadow: 0 0 14px 4px rgba(var(--g),0.6); }
}
.am { width:0;height:0;position:relative;overflow:visible;cursor:pointer; }
.am > div { position:absolute;border-radius:50%; }
.am .dt { width:14px;height:14px;top:-7px;left:-7px;background:var(--c);border:2.5px solid rgba(255,255,255,0.85);animation:a-glow 2.8s ease-in-out infinite;z-index:4;transition:all .15s ease; }
.am .hl { width:28px;height:28px;top:-14px;left:-14px;background:radial-gradient(circle,rgba(var(--g),0.3) 0%,transparent 70%);z-index:2;pointer-events:none;transition:all .15s ease; }
.am .rp { width:16px;height:16px;top:-8px;left:-8px;background:rgba(var(--g),0.2);opacity:0;animation:a-pulse 3s ease-out infinite;z-index:1;pointer-events:none; }
.am .rp.b { animation-delay:1s; }
.am .rp.c { animation-delay:2s; }
.am .hit { width:40px;height:40px;top:-20px;left:-20px;z-index:5;background:transparent; }
.am:hover .dt { width:18px;height:18px;top:-9px;left:-9px;box-shadow:0 0 20px 6px rgba(var(--g),0.7);border-color:#fff; }
.am:hover .hl { width:36px;height:36px;top:-18px;left:-18px;background:radial-gradient(circle,rgba(var(--g),0.45) 0%,transparent 70%); }
</style>`);
}

function mkEl(type: string): HTMLDivElement {
  const p = PAL[type] || FB;
  const w = document.createElement('div');
  w.className = 'am';
  w.style.setProperty('--c', p.c);
  w.style.setProperty('--g', p.g);
  for (const cls of ['rp', 'rp b', 'rp c']) { const r = document.createElement('div'); r.className = cls; w.appendChild(r); }
  const hl = document.createElement('div'); hl.className = 'hl'; w.appendChild(hl);
  const dt = document.createElement('div'); dt.className = 'dt'; w.appendChild(dt);
  const hit = document.createElement('div'); hit.className = 'hit'; w.appendChild(hit);
  return w;
}

/* ── Debounce helper ── */
function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]) as T;
}

export const MapComponent = ({
  anchors, visibleLayers, selectedTimeBin: _t, onAnchorClick,
  showTraffic = false, showStreetCenterline = false, showPOI = false,
}: MapComponentProps) => {
  const ctr = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mrs = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [ready, setReady] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const loadingPOI = useRef(false);
  const loadingStreets = useRef(false);

  useEffect(injectCSS, []);

  /* ── Fetch POI from Supabase ── */
  const fetchPOI = useCallback(async () => {
    if (!map.current || !showPOI || loadingPOI.current) return;
    loadingPOI.current = true;
    try {
      const bounds = map.current.getBounds();
      if (!bounds) return;
      const { data, error } = await supabase.rpc('get_poi_in_bounds', {
        min_lng: bounds.getWest(),
        min_lat: bounds.getSouth(),
        max_lng: bounds.getEast(),
        max_lat: bounds.getNorth(),
      });
      if (error) { console.error('POI fetch error:', error); return; }
      const source = map.current?.getSource('poi-data') as mapboxgl.GeoJSONSource;
      if (source && data) source.setData(data);
    } finally { loadingPOI.current = false; }
  }, [showPOI]);

  /* ── Fetch Streets from Supabase ── */
  // 
  const fetchStreets = useCallback(async () => {
    if (!map.current || !showStreetCenterline || loadingStreets.current) return;
    loadingStreets.current = true;
    try {
      const bounds = map.current.getBounds();
      if (!bounds) return;
      const { data, error } = await supabase.rpc('get_streets_in_bounds', {
        min_lng: bounds.getWest(),
        min_lat: bounds.getSouth(),
        max_lng: bounds.getEast(),
        max_lat: bounds.getNorth(),
      });
      if (error) { console.error('Streets fetch error:', error); return; }
      const source = map.current?.getSource('street-centerline') as mapboxgl.GeoJSONSource;
      if (source && data) source.setData(data);
    } finally { loadingStreets.current = false; }
  }, [showStreetCenterline]);

  /* ── Debounced fetch on map move ── */
  const debouncedFetchPOI = useDebouncedCallback(fetchPOI, 300);
  const debouncedFetchStreets = useDebouncedCallback(fetchStreets, 300);

  /* ── Init map ── */
  useEffect(() => {
    if (!ctr.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: ctr.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [PHILADELPHIA_CENTER.longitude, PHILADELPHIA_CENTER.latitude],
      zoom: PHILADELPHIA_CENTER.zoom, pitch: 0, bearing: 0,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-right');
    map.current.on('load', () => setReady(true));
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  /* ── Setup data sources & layers (once on ready) ── */
  useEffect(() => {
    if (!map.current || !ready) return;

    // POI source + layer
    if (!map.current.getSource('poi-data')) {
      map.current.addSource('poi-data', { type: 'geojson', data: EMPTY_FC });

      const poiMatchExpr: any[] = ['match', ['get', 'poi_category']];
      for (const [cat, color] of POI_COLORS) poiMatchExpr.push(cat, color);
      poiMatchExpr.push(POI_FALLBACK);

      map.current.addLayer({
        id: 'poi-circles', type: 'circle', source: 'poi-data',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 4.5, 18, 8],
          'circle-color': poiMatchExpr as any,
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(0,0,0,0.3)',
        },
      });

      // POI hover popup
      map.current.on('mouseenter', 'poi-circles', (e) => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
        const feat = e.features?.[0];
        if (!feat) return;
        const props = feat.properties || {};
        const coords = (feat.geometry as any).coordinates.slice() as [number, number];
        const name = props.name || 'Unnamed';
        const amenity = props.amenity || '';
        const cat = props.poi_category || '';
        const color = POI_COLORS.find(([c]) => c === cat)?.[1] || POI_FALLBACK;

        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: 'poi-popup' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:2px 0;">
              <div style="font-weight:700;font-size:13px;color:#f1f5f9;margin-bottom:3px;">${name}</div>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;"></span>
                <span style="font-size:11px;color:#94a3af;">${cat}</span>
                <span style="font-size:10px;color:#64748b;">· ${amenity}</span>
              </div>
            </div>
          `)
          .addTo(map.current);
      });
      map.current.on('mouseleave', 'poi-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });
    }

    // Street Centerline source + layer
    if (!map.current.getSource('street-centerline')) {
      map.current.addSource('street-centerline', { type: 'geojson', data: EMPTY_FC });

      const streetMatchExpr: any[] = ['match', ['get', 'responsibl']];
      for (const [val, color] of STREET_COLORS) streetMatchExpr.push(val, color);
      streetMatchExpr.push(STREET_FALLBACK);

      map.current.addLayer({
        id: 'street-centerline-lines', type: 'line', source: 'street-centerline',
        layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': streetMatchExpr as any,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 1.8, 18, 3.5],
          'line-opacity': 0.75,
        },
      });

      map.current.on('mouseenter', 'street-centerline-lines', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'street-centerline-lines', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }
  }, [ready]);

  /* ── Map move → refetch data ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    const handler = () => {
      if (showPOI) debouncedFetchPOI();
      if (showStreetCenterline) debouncedFetchStreets();
    };
    map.current.on('moveend', handler);
    return () => { map.current?.off('moveend', handler); };
  }, [ready, showPOI, showStreetCenterline, debouncedFetchPOI, debouncedFetchStreets]);

  /* ── Toggle POI visibility + initial fetch ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    if (map.current.getLayer('poi-circles')) {
      map.current.setLayoutProperty('poi-circles', 'visibility', showPOI ? 'visible' : 'none');
    }
    if (showPOI) fetchPOI();
    else {
      popupRef.current?.remove();
      const source = map.current.getSource('poi-data') as mapboxgl.GeoJSONSource;
      if (source) source.setData(EMPTY_FC);
    }
  }, [ready, showPOI, fetchPOI]);

  /* ── Toggle Street Centerline visibility + initial fetch ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    if (map.current.getLayer('street-centerline-lines')) {
      map.current.setLayoutProperty('street-centerline-lines', 'visibility', showStreetCenterline ? 'visible' : 'none');
    }
    if (showStreetCenterline) fetchStreets();
    else {
      const source = map.current.getSource('street-centerline') as mapboxgl.GeoJSONSource;
      if (source) source.setData(EMPTY_FC);
    }
  }, [ready, showStreetCenterline, fetchStreets]);

  /* ── Traffic layer ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    if (showTraffic) {
      if (!map.current.getSource('mapbox-traffic'))
        map.current.addSource('mapbox-traffic', { type: 'vector', url: 'mapbox://mapbox.mapbox-traffic-v1' });
      if (!map.current.getLayer('traffic-flow')) {
        map.current.addLayer({
          id: 'traffic-flow', type: 'line', source: 'mapbox-traffic',
          'source-layer': 'traffic', minzoom: 10,
          paint: {
            'line-width': ['interpolate',['linear'],['zoom'],10,2,14,4,18,8],
            'line-color': ['case',
              ['==',['get','congestion'],'low'],'#34D399',
              ['==',['get','congestion'],'moderate'],'#FBBF24',
              ['==',['get','congestion'],'heavy'],'#FB923C',
              ['==',['get','congestion'],'severe'],'#EF4444','#34D399'],
            'line-opacity': 0.75,
          },
        });
      } else map.current.setLayoutProperty('traffic-flow','visibility','visible');
    } else {
      if (map.current?.getLayer('traffic-flow'))
        map.current.setLayoutProperty('traffic-flow','visibility','none');
    }
  }, [ready, showTraffic]);

  /* ── Resize observer ── */
  useEffect(() => {
    if (!map.current || !ready || !ctr.current) return;
    const ro = new ResizeObserver(() => requestAnimationFrame(() => map.current?.resize()));
    ro.observe(ctr.current);
    return () => ro.disconnect();
  }, [ready]);

  /* ── Anchor markers ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    mrs.current.forEach(m => m.remove());
    mrs.current.clear();
    anchors.forEach(a => {
      if (!visibleLayers.has(a.type)) return;
      const el = mkEl(a.type);
      el.addEventListener('click', e => { e.stopPropagation(); onAnchorClick?.(a); });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([a.longitude, a.latitude]).addTo(map.current!);
      mrs.current.set(a.id, marker);
    });
  }, [anchors, visibleLayers, ready, onAnchorClick]);

  return (
    <div ref={ctr} className="w-full h-full" style={{ position:'absolute',top:0,left:0,right:0,bottom:0 }} />
  );
};
