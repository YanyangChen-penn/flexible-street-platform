import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Anchor, ScenarioId } from '../types';
import { PHILADELPHIA_CENTER, scenarioConfigs } from '../data/mockData';
import { supabase } from '../lib/supabase';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface MapHandle { fitToPhiladelphia: () => void; }

interface MapComponentProps {
  activeScenarios: Set<ScenarioId>;
  selectedTimeBin?: string;
  onAnchorClick?: (anchor: Anchor) => void;
  showTraffic?: boolean;
  showStreetCenterline?: boolean;
  showPOI?: boolean;
  showPlaystreets?: boolean;
}

/* ── Palettes ── */
const SCENARIO_PALETTE: Record<string, { color: string; rgb: string }> = {};
for (const s of scenarioConfigs) SCENARIO_PALETTE[s.id] = { color: s.color, rgb: s.glowRgb };

export const STREET_COLORS: [string, string][] = [
  ['CITY','#6366F1'],['STATE','#F43F5E'],['SEPTA','#F59E0B'],['PRIVATE','#8B5CF6'],
  ['FAIRMOUNT PARK','#10B981'],['PHA','#3B82F6'],['PIDC','#06B6D4'],['DRPA','#EC4899'],
  ['FAM','#14B8A6'],['AIRPORT','#A78BFA'],['BCBC','#FB923C'],['STRICKEN','#EF4444'],['TOWNSHIP','#67E8F9'],
];
export const STREET_FALLBACK = '#475569';

export const POI_COLORS: [string, string][] = [
  ['Education','#60A5FA'],['Healthcare','#F87171'],['Food & Dining','#FB923C'],['Religious','#C084FC'],
  ['Community','#34D399'],['Public Safety','#FBBF24'],['Culture','#F472B6'],['Finance','#38BDF8'],['Transport','#A78BFA'],
];
const POI_FALLBACK = '#64748B';
export const PLAYSTREETS_COLOR = '#22D3EE';

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]) as T;
}

/* ── Popup CSS ── */
let _css = false;
function injectCSS() {
  if (_css) return; _css = true;
  document.head.insertAdjacentHTML('beforeend', `<style>
.anchor-popup .mapboxgl-popup-content,.poi-popup .mapboxgl-popup-content{background:#1e1f2b;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,0.5);color:#e2e4e9;}
.anchor-popup .mapboxgl-popup-tip,.poi-popup .mapboxgl-popup-tip{border-top-color:#1e1f2b;border-bottom-color:#1e1f2b;}
</style>`);
}

/* ═══════════════════════════════════════
   MapComponent
   ═══════════════════════════════════════ */
export const MapComponent = forwardRef<MapHandle, MapComponentProps>(({
  activeScenarios, selectedTimeBin: _t, onAnchorClick,
  showTraffic = false, showStreetCenterline = false, showPOI = false, showPlaystreets = false,
}, ref) => {
  const ctr = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const loadingAnchors = useRef(false);
  const loadingPOI = useRef(false);
  const loadingPlaystreets = useRef(false);

  useImperativeHandle(ref, () => ({
    fitToPhiladelphia: () => { map.current?.flyTo({ center: [PHILADELPHIA_CENTER.longitude, PHILADELPHIA_CENTER.latitude], zoom: PHILADELPHIA_CENTER.zoom, duration: 1000 }); },
  }));

  useEffect(injectCSS, []);

  /* ── Fetch Anchors ── */
  const fetchAnchors = useCallback(async () => {
    if (!map.current || loadingAnchors.current) return;
    const active = Array.from(activeScenarios);
    if (active.length === 0) {
      const src = map.current?.getSource('anchor-data') as mapboxgl.GeoJSONSource;
      src?.setData(EMPTY_FC); return;
    }
    loadingAnchors.current = true;
    try {
      const b = map.current.getBounds(); if (!b) return;
      const { data, error } = await supabase.rpc('get_anchors_in_bounds', {
        min_lng: b.getWest(), min_lat: b.getSouth(), max_lng: b.getEast(), max_lat: b.getNorth(),
        scenario_ids: active,
      });
      if (error) { console.error('Anchor fetch error:', error); return; }
      const src = map.current?.getSource('anchor-data') as mapboxgl.GeoJSONSource;
      if (src && data) src.setData(data);
    } finally { loadingAnchors.current = false; }
  }, [activeScenarios]);

  /* ── Fetch POI ── */
  const fetchPOI = useCallback(async () => {
    if (!map.current || !showPOI || loadingPOI.current) return;
    loadingPOI.current = true;
    try {
      const b = map.current.getBounds(); if (!b) return;
      const { data, error } = await supabase.rpc('get_poi_in_bounds', {
        min_lng: b.getWest(), min_lat: b.getSouth(), max_lng: b.getEast(), max_lat: b.getNorth(),
      });
      if (error) { console.error('POI fetch error:', error); return; }
      const src = map.current?.getSource('poi-data') as mapboxgl.GeoJSONSource;
      if (src && data) src.setData(data);
    } finally { loadingPOI.current = false; }
  }, [showPOI]);

  /* ── Fetch Playstreets ── */
  const playstreetsLoaded = useRef(false);
  const fetchPlaystreets = useCallback(async () => {
    if (!map.current || !showPlaystreets || loadingPlaystreets.current || playstreetsLoaded.current) return;
    loadingPlaystreets.current = true;
    try {
      const { data, error } = await supabase.rpc('get_playstreets_lines_in_bounds', {
        min_lng: -75.35, min_lat: 39.85, max_lng: -74.95, max_lat: 40.15,
      });
      if (error) { console.error('Playstreets fetch error:', error); return; }
      const src = map.current?.getSource('playstreets-data') as mapboxgl.GeoJSONSource;
      if (src && data) { src.setData(data); playstreetsLoaded.current = true; }
    } finally { loadingPlaystreets.current = false; }
  }, [showPlaystreets]);

  const debouncedFetchAnchors = useDebouncedCallback(fetchAnchors, 300);
  const debouncedFetchPOI = useDebouncedCallback(fetchPOI, 300);

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

  /* ══════════════════════════════════════
     Setup sources & layers
     ORDER: street → playstreets → poi → ANCHORS (last = on top)
     ══════════════════════════════════════ */
  useEffect(() => {
    if (!map.current || !ready) return;

    /* ── 1. Street Centerline (bottom) ── */
    if (!map.current.getSource('street-centerline')) {
      map.current.addSource('street-centerline', { type: 'vector', url: 'mapbox://yangf0304.az4ve7hc' });
      const sm: any[] = ['match', ['get', 'responsibl']];
      for (const [v, c] of STREET_COLORS) sm.push(v, c);
      sm.push(STREET_FALLBACK);
      map.current.addLayer({
        id: 'street-centerline-lines', type: 'line', source: 'street-centerline',
        'source-layer': 'Street_Centerline-46lvna', minzoom: 12,
        layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': sm as any, 'line-width': ['interpolate',['linear'],['zoom'],12,0.8,14,1.8,18,3.5], 'line-opacity': 0.75 },
      });
    }

    /* ── 2. Playstreets ── */
    if (!map.current.getSource('playstreets-data')) {
      map.current.addSource('playstreets-data', { type: 'geojson', data: EMPTY_FC });
      map.current.addLayer({
        id: 'playstreets-glow', type: 'line', source: 'playstreets-data',
        layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': PLAYSTREETS_COLOR, 'line-width': ['interpolate',['linear'],['zoom'],10,4,14,10,18,20], 'line-opacity': 0.15, 'line-blur': 4 },
      });
      map.current.addLayer({
        id: 'playstreets-lines', type: 'line', source: 'playstreets-data',
        layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': PLAYSTREETS_COLOR, 'line-width': ['interpolate',['linear'],['zoom'],10,1.5,14,3,18,6], 'line-opacity': 0.85 },
      });
      map.current.on('mouseenter', 'playstreets-lines', (e) => {
        if (!map.current) return; map.current.getCanvas().style.cursor = 'pointer';
        const feat = e.features?.[0]; if (!feat) return;
        const props = feat.properties || {};
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: 'poi-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:2px 0;">
            <div style="font-weight:700;font-size:13px;color:#f1f5f9;margin-bottom:3px;">🛝 ${props.block_name||'Playstreet'}</div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="width:8px;height:8px;border-radius:50%;background:${PLAYSTREETS_COLOR};display:inline-block;"></span>
              <span style="font-size:11px;color:#94a3af;">Playstreet</span>
              <span style="font-size:10px;color:#64748b;">· ${props.year||''} · ${props.zip_code||''}</span>
            </div>
            ${props.street_name?`<div style="font-size:10px;color:#64748b;margin-top:2px;">Matched: ${props.street_name} (${props.responsibl||''})</div>`:''}</div>`)
          .addTo(map.current);
      });
      map.current.on('mouseleave', 'playstreets-lines', () => { if (map.current) map.current.getCanvas().style.cursor = ''; popupRef.current?.remove(); });
    }

    /* ── 3. POI ── */
    if (!map.current.getSource('poi-data')) {
      map.current.addSource('poi-data', { type: 'geojson', data: EMPTY_FC });
      const pm: any[] = ['match', ['get', 'poi_category']];
      for (const [cat, color] of POI_COLORS) pm.push(cat, color);
      pm.push(POI_FALLBACK);
      map.current.addLayer({
        id: 'poi-circles', type: 'circle', source: 'poi-data',
        layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate',['linear'],['zoom'],10,2,14,4.5,18,8], 'circle-color': pm as any, 'circle-opacity': 0.8, 'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(0,0,0,0.3)' },
      });
      map.current.on('mouseenter', 'poi-circles', (e) => {
        if (!map.current) return; map.current.getCanvas().style.cursor = 'pointer';
        const feat = e.features?.[0]; if (!feat) return;
        const props = feat.properties || {};
        const coords = (feat.geometry as any).coordinates.slice() as [number,number];
        const cat = props.poi_category || '';
        const color = POI_COLORS.find(([c]) => c === cat)?.[1] || POI_FALLBACK;
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: 'poi-popup' })
          .setLngLat(coords)
          .setHTML(`<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:2px 0;">
            <div style="font-weight:700;font-size:13px;color:#f1f5f9;margin-bottom:3px;">${props.name||'Unnamed'}</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;"></span>
              <span style="font-size:11px;color:#94a3af;">${cat}</span>
              <span style="font-size:10px;color:#64748b;">· ${props.amenity||''}</span>
            </div></div>`)
          .addTo(map.current);
      });
      map.current.on('mouseleave', 'poi-circles', () => { if (map.current) map.current.getCanvas().style.cursor = ''; popupRef.current?.remove(); });
    }

    /* ── 4. ANCHOR layers (LAST = renders on TOP) ── */
    if (!map.current.getSource('anchor-data')) {
      map.current.addSource('anchor-data', { type: 'geojson', data: EMPTY_FC });
      const cm: any[] = ['match', ['get', 'scenario_id']];
      for (const s of scenarioConfigs) cm.push(s.id, s.color);
      cm.push('#94A3B8');

      // Glow
      map.current.addLayer({
        id: 'anchor-glow', type: 'circle', source: 'anchor-data',
        paint: { 'circle-radius': ['interpolate',['linear'],['zoom'],10,6,14,14,18,24], 'circle-color': cm as any, 'circle-opacity': 0.15, 'circle-blur': 1 },
      });
      // Main dot
      map.current.addLayer({
        id: 'anchor-circles', type: 'circle', source: 'anchor-data',
        paint: {
          'circle-radius': ['interpolate',['linear'],['zoom'],10,3,14,6,18,10],
          'circle-color': cm as any, 'circle-opacity': 0.9,
          'circle-stroke-width': ['interpolate',['linear'],['zoom'],10,1,14,2,18,2.5],
          'circle-stroke-color': 'rgba(255,255,255,0.7)',
        },
      });

      // Hover popup
      map.current.on('mouseenter', 'anchor-circles', (e) => {
        if (!map.current) return; map.current.getCanvas().style.cursor = 'pointer';
        const feat = e.features?.[0]; if (!feat) return;
        const props = feat.properties || {};
        const coords = (feat.geometry as any).coordinates.slice() as [number,number];
        const sid = props.scenario_id || '';
        const pal = SCENARIO_PALETTE[sid];
        const cfg = scenarioConfigs.find(s => s.id === sid);
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: 'anchor-popup' })
          .setLngLat(coords)
          .setHTML(`<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:2px 0;">
            <div style="font-weight:700;font-size:13px;color:#f1f5f9;margin-bottom:3px;">${props.name||'Unnamed'}</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${pal?.color||'#94A3B8'};display:inline-block;"></span>
              <span style="font-size:11px;color:#94a3af;">${cfg?.icon||''} ${cfg?.name||sid}</span>
              <span style="font-size:10px;color:#64748b;">· ${props.amenity||''}</span>
            </div></div>`)
          .addTo(map.current);
      });
      map.current.on('mouseleave', 'anchor-circles', () => { if (map.current) map.current.getCanvas().style.cursor = ''; popupRef.current?.remove(); });

      // Click → detail panel
      map.current.on('click', 'anchor-circles', (e) => {
        const feat = e.features?.[0]; if (!feat || !onAnchorClick) return;
        const props = feat.properties || {};
        const coords = (feat.geometry as any).coordinates as [number,number];
        let meta = props.metadata;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch { meta = {}; } }
        onAnchorClick({
          id: props.id, name: props.name || 'Unnamed', scenarioId: props.scenario_id as any,
          amenity: props.amenity || '', longitude: coords[0], latitude: coords[1],
          sourceTable: props.source_table, metadata: meta,
        });
      });
    }
  }, [ready, onAnchorClick]);

  /* ── Map move → refetch ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    const handler = () => { if (activeScenarios.size > 0) debouncedFetchAnchors(); if (showPOI) debouncedFetchPOI(); };
    map.current.on('moveend', handler);
    return () => { map.current?.off('moveend', handler); };
  }, [ready, activeScenarios, showPOI, debouncedFetchAnchors, debouncedFetchPOI]);

  /* ── Toggle anchors ── */
  useEffect(() => { if (map.current && ready) fetchAnchors(); }, [ready, activeScenarios, fetchAnchors]);

  /* ── Toggle POI ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    if (map.current.getLayer('poi-circles')) map.current.setLayoutProperty('poi-circles', 'visibility', showPOI ? 'visible' : 'none');
    if (showPOI) fetchPOI(); else { popupRef.current?.remove(); (map.current.getSource('poi-data') as mapboxgl.GeoJSONSource)?.setData(EMPTY_FC); }
  }, [ready, showPOI, fetchPOI]);

  /* ── Toggle Streets ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    if (map.current.getLayer('street-centerline-lines')) map.current.setLayoutProperty('street-centerline-lines', 'visibility', showStreetCenterline ? 'visible' : 'none');
  }, [ready, showStreetCenterline]);

  /* ── Toggle Playstreets ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    const vis = showPlaystreets ? 'visible' : 'none';
    if (map.current.getLayer('playstreets-lines')) map.current.setLayoutProperty('playstreets-lines', 'visibility', vis);
    if (map.current.getLayer('playstreets-glow')) map.current.setLayoutProperty('playstreets-glow', 'visibility', vis);
    if (showPlaystreets) fetchPlaystreets();
    else { popupRef.current?.remove(); playstreetsLoaded.current = false; (map.current.getSource('playstreets-data') as mapboxgl.GeoJSONSource)?.setData(EMPTY_FC); }
  }, [ready, showPlaystreets, fetchPlaystreets]);

  /* ── Traffic ── */
  useEffect(() => {
    if (!map.current || !ready) return;
    if (showTraffic) {
      if (!map.current.getSource('mapbox-traffic')) map.current.addSource('mapbox-traffic', { type: 'vector', url: 'mapbox://mapbox.mapbox-traffic-v1' });
      if (!map.current.getLayer('traffic-flow')) {
        map.current.addLayer({
          id: 'traffic-flow', type: 'line', source: 'mapbox-traffic', 'source-layer': 'traffic', minzoom: 10,
          paint: {
            'line-width': ['interpolate',['linear'],['zoom'],10,2,14,4,18,8],
            'line-color': ['case',['==',['get','congestion'],'low'],'#34D399',['==',['get','congestion'],'moderate'],'#FBBF24',['==',['get','congestion'],'heavy'],'#FB923C',['==',['get','congestion'],'severe'],'#EF4444','#34D399'],
            'line-opacity': 0.75,
          },
        }, 'anchor-glow'); // ← insert BELOW anchors
      } else map.current.setLayoutProperty('traffic-flow', 'visibility', 'visible');
    } else { if (map.current?.getLayer('traffic-flow')) map.current.setLayoutProperty('traffic-flow', 'visibility', 'none'); }
  }, [ready, showTraffic]);

  /* ── Resize ── */
  useEffect(() => {
    if (!map.current || !ready || !ctr.current) return;
    const ro = new ResizeObserver(() => requestAnimationFrame(() => map.current?.resize()));
    ro.observe(ctr.current); return () => ro.disconnect();
  }, [ready]);

  return <div ref={ctr} className="w-full h-full" style={{ position:'absolute',top:0,left:0,right:0,bottom:0 }} />;
});
