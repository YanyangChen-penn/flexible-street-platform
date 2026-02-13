import { useState, useCallback, useEffect, useRef } from 'react';
import type { LayerConfig, TimeBin } from '../types';
import { Layers, Clock, Radio, ChevronDown, GitBranch, MapPin } from 'lucide-react';
import { STREET_COLORS, STREET_FALLBACK, POI_COLORS } from './MapComponent';

interface SidebarProps {
  layers: LayerConfig[];
  timeBins: TimeBin[];
  selectedTimeBin: string;
  onLayerToggle: (layerId: string) => void;
  onTimeBinChange: (timeBinId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  showTraffic?: boolean;
  onTrafficToggle?: (show: boolean) => void;
  showStreetCenterline?: boolean;
  onStreetCenterlineToggle?: (show: boolean) => void;
  showPOI?: boolean;
  onPOIToggle?: (show: boolean) => void;
  width: number;
  onWidthChange: (w: number) => void;
}

const MIN_W = 260;
const MAX_W = 480;

export const Sidebar = ({
  layers, timeBins, selectedTimeBin, onLayerToggle, onTimeBinChange,
  onSelectAll, onDeselectAll,
  isCollapsed, showTraffic = false, onTrafficToggle,
  showStreetCenterline = false, onStreetCenterlineToggle,
  showPOI = false, onPOIToggle,
  width, onWidthChange,
}: SidebarProps) => {
  const accent = '#6366F1';

  const [timeOpen, setTimeOpen] = useState(false);
  const [overlaysOpen, setOverlaysOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [streetLegendOpen, setStreetLegendOpen] = useState(false);
  const [poiLegendOpen, setPoiLegendOpen] = useState(false);

  const allSelected = layers.every(l => l.visible);
  const noneSelected = layers.every(l => !l.visible);

  /* drag resize */
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(width);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      onWidthChange(Math.min(MAX_W, Math.max(MIN_W, startW.current + (e.clientX - startX.current))));
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [onWidthChange]);

  const SectionHeader = ({ icon, label, open, onToggle }: { icon: React.ReactNode; label: string; open: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</h2>
      </div>
      <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
    </button>
  );

  const SubLegend = ({ open, onToggle, count, items, fallbackLabel, fallbackColor }: {
    open: boolean; onToggle: () => void; count: number;
    items: [string, string][]; fallbackLabel?: string; fallbackColor?: string;
  }) => (
    <div className="ml-7 animate-fadeIn">
      <button onClick={onToggle} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1 ml-4">
        <ChevronDown className="w-3 h-3 transition-transform duration-150" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
        <span>Legend ({count} types)</span>
      </button>
      <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: open ? '600px' : '0px', opacity: open ? 1 : 0 }}>
        <div className="ml-4 mt-1 space-y-1.5 pb-1">
          {items.map(([name, color]) => (
            <div key={name} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="truncate">{name}</span>
            </div>
          ))}
          {fallbackLabel && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fallbackColor || '#475569' }} />
              <span className="truncate italic">{fallbackLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute top-0 left-0 h-full transition-all duration-300 z-10" style={{ width: isCollapsed ? 0 : width, overflow: 'hidden' }}>
      <div className="flex h-full p-4" style={{ width }}>
        <div className="flex flex-col h-full flex-1 bg-[#16171e]/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/[0.06]">

          {/* Header */}
          <div className="px-6 py-6 border-b border-white/[0.06]">
            <h1 className="text-xl font-extrabold text-gray-100 mb-1 tracking-wide">Flexible Streets</h1>
            <p className="text-sm text-gray-500">Philadelphia Pilot Project</p>
          </div>

          {/* Scrollable */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Time Period ── */}
            <div className="border-b border-white/[0.06]">
              <SectionHeader icon={<Clock className="w-4 h-4" style={{ color: '#A5B4FC' }} />} label="Time Period" open={timeOpen} onToggle={() => setTimeOpen(!timeOpen)} />
              <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: timeOpen ? '400px' : '0px', opacity: timeOpen ? 1 : 0 }}>
                <div className="px-6 pb-5 grid grid-cols-1 gap-2">
                  {timeBins.map(bin => (
                    <button key={bin.id} onClick={() => onTimeBinChange(bin.id)}
                      className={`px-4 py-3 text-left rounded-xl transition-all duration-150 ${selectedTimeBin === bin.id ? 'text-white shadow-md' : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.06]'}`}
                      style={selectedTimeBin === bin.id ? { background: accent, boxShadow: '0 4px 12px rgba(99,102,241,0.25)' } : {}}
                    >
                      <span className="text-sm font-semibold">{bin.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Map Overlays ── */}
            <div className="border-b border-white/[0.06]">
              <SectionHeader icon={<Radio className="w-4 h-4" style={{ color: '#A5B4FC' }} />} label="Map Overlays" open={overlaysOpen} onToggle={() => setOverlaysOpen(!overlaysOpen)} />
              <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: overlaysOpen ? '900px' : '0px', opacity: overlaysOpen ? 1 : 0 }}>
                <div className="px-6 pb-5 space-y-1">

                  {/* Traffic */}
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all duration-150 group">
                    <input type="checkbox" checked={showTraffic} onChange={(e) => onTrafficToggle?.(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 focus:ring-offset-0" style={{ accentColor: accent }} />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Real-time Traffic</span>
                    </div>
                  </label>
                  {showTraffic && (
                    <div className="ml-11 mb-2 space-y-1.5 animate-fadeIn">
                      {[['#34D399','Free Flow'],['#FBBF24','Moderate'],['#FB923C','Heavy'],['#EF4444','Severe']].map(([c,t]) => (
                        <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="w-4 h-[3px] rounded-full" style={{ background: c }} /><span>{t}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Street Centerline */}
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all duration-150 group">
                    <input type="checkbox" checked={showStreetCenterline} onChange={(e) => onStreetCenterlineToggle?.(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 focus:ring-offset-0" style={{ accentColor: accent }} />
                    <div className="flex items-center gap-2 flex-1">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Street Centerline</span>
                    </div>
                  </label>
                  {showStreetCenterline && (
                    <SubLegend open={streetLegendOpen} onToggle={() => setStreetLegendOpen(!streetLegendOpen)}
                      count={STREET_COLORS.length} items={STREET_COLORS} fallbackLabel="Other" fallbackColor={STREET_FALLBACK} />
                  )}

                  {/* POI */}
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all duration-150 group">
                    <input type="checkbox" checked={showPOI} onChange={(e) => onPOIToggle?.(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 focus:ring-offset-0" style={{ accentColor: accent }} />
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Points of Interest</span>
                    </div>
                  </label>
                  {showPOI && (
                    <SubLegend open={poiLegendOpen} onToggle={() => setPoiLegendOpen(!poiLegendOpen)}
                      count={POI_COLORS.length} items={POI_COLORS} />
                  )}

                </div>
              </div>
            </div>

            {/* ── Anchor Layers ── */}
            <div>
              <SectionHeader icon={<Layers className="w-4 h-4" style={{ color: '#A5B4FC' }} />} label="Anchor Layers" open={layersOpen} onToggle={() => setLayersOpen(!layersOpen)} />
              <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: layersOpen ? '900px' : '0px', opacity: layersOpen ? 1 : 0 }}>
                <div className="px-6 pb-5">
                  {/* Select all / Deselect all */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={onSelectAll}
                      disabled={allSelected}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                      style={{
                        background: allSelected ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.15)',
                        color: allSelected ? '#4b5563' : '#A5B4FC',
                        cursor: allSelected ? 'default' : 'pointer',
                      }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={onDeselectAll}
                      disabled={noneSelected}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                      style={{
                        background: noneSelected ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                        color: noneSelected ? '#4b5563' : '#9ca3af',
                        cursor: noneSelected ? 'default' : 'pointer',
                      }}
                    >
                      Deselect All
                    </button>
                    <span className="ml-auto text-xs text-gray-600">
                      {layers.filter(l => l.visible).length}/{layers.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {layers.map(layer => (
                      <label key={layer.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all duration-150 group">
                        <input type="checkbox" checked={layer.visible} onChange={() => onLayerToggle(layer.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 focus:ring-offset-0" style={{ accentColor: accent }} />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: layer.color, boxShadow: `0 0 6px ${layer.color}40` }} />
                          <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">{layer.icon} {layer.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Active</p>
                <p className="text-2xl font-extrabold text-gray-100">{layers.filter(l => l.visible).length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Total</p>
                <p className="text-2xl font-extrabold text-gray-100">{layers.length * 2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Drag handle */}
        {!isCollapsed && (
          <div onMouseDown={onMouseDown} className="flex-shrink-0 w-2 cursor-col-resize group flex items-center justify-center" title="Drag to resize">
            <div className="w-[3px] h-12 rounded-full bg-white/[0.08] group-hover:bg-indigo-500/60 group-active:bg-indigo-500 transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
};