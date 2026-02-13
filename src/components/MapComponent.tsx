import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Anchor } from '../types';
import { PHILADELPHIA_CENTER } from '../data/mockData';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapComponentProps {
  anchors: Anchor[];
  visibleLayers: Set<string>;
  selectedTimeBin?: string;
  onAnchorClick?: (anchor: Anchor) => void;
  showTraffic?: boolean;
}

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

.am {
  width: 0; height: 0;
  position: relative;
  overflow: visible;
  cursor: pointer;
}
.am > div {
  position: absolute;
  border-radius: 50%;
}

/* Core dot: 14x14 */
.am .dt {
  width: 14px; height: 14px;
  top: -7px; left: -7px;
  background: var(--c);
  border: 2.5px solid rgba(255,255,255,0.85);
  animation: a-glow 2.8s ease-in-out infinite;
  z-index: 4;
  transition: all 0.15s ease;
}

/* Halo: 28x28 */
.am .hl {
  width: 28px; height: 28px;
  top: -14px; left: -14px;
  background: radial-gradient(circle, rgba(var(--g),0.3) 0%, transparent 70%);
  z-index: 2;
  pointer-events: none;
  transition: all 0.15s ease;
}

/* Pulse ring: 16x16 */
.am .rp {
  width: 16px; height: 16px;
  top: -8px; left: -8px;
  background: rgba(var(--g),0.2);
  opacity: 0;
  animation: a-pulse 3s ease-out infinite;
  z-index: 1;
  pointer-events: none;
}
.am .rp.b { animation-delay: 1s; }
.am .rp.c { animation-delay: 2s; }

/* Click hitbox: 40x40 */
.am .hit {
  width: 40px; height: 40px;
  top: -20px; left: -20px;
  z-index: 5;
  background: transparent;
}

/* Hover */
.am:hover .dt {
  width: 18px; height: 18px;
  top: -9px; left: -9px;
  box-shadow: 0 0 20px 6px rgba(var(--g),0.7);
  border-color: #fff;
}
.am:hover .hl {
  width: 36px; height: 36px;
  top: -18px; left: -18px;
  background: radial-gradient(circle, rgba(var(--g),0.45) 0%, transparent 70%);
}
</style>`);
}

function mkEl(type: string): HTMLDivElement {
  const p = PAL[type] || FB;
  const w = document.createElement('div');
  w.className = 'am';
  w.style.setProperty('--c', p.c);
  w.style.setProperty('--g', p.g);

  for (const cls of ['rp', 'rp b', 'rp c']) {
    const r = document.createElement('div'); r.className = cls; w.appendChild(r);
  }
  const hl = document.createElement('div'); hl.className = 'hl'; w.appendChild(hl);
  const dt = document.createElement('div'); dt.className = 'dt'; w.appendChild(dt);
  const hit = document.createElement('div'); hit.className = 'hit'; w.appendChild(hit);
  return w;
}

export const MapComponent = ({
  anchors, visibleLayers, selectedTimeBin: _t, onAnchorClick, showTraffic = false,
}: MapComponentProps) => {
  const ctr = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mrs = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(injectCSS, []);

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
    map.current.on('error', (e: any) => console.error('Map error:', e));
    return () => { map.current?.remove(); map.current = null; };
  }, []);

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
      if (map.current.getLayer('traffic-flow'))
        map.current.setLayoutProperty('traffic-flow','visibility','none');
    }
  }, [ready, showTraffic]);

  useEffect(() => {
    if (!map.current || !ready || !ctr.current) return;
    const ro = new ResizeObserver(() => requestAnimationFrame(() => map.current?.resize()));
    ro.observe(ctr.current);
    return () => ro.disconnect();
  }, [ready]);

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
    <div ref={ctr} className="w-full h-full"
      style={{ position:'absolute', top:0, left:0, right:0, bottom:0 }} />
  );
};