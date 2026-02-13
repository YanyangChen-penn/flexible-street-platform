import type { LayerConfig, TimeBin } from '../types';
import { Layers, Clock, Radio } from 'lucide-react';

interface SidebarProps {
  layers: LayerConfig[];
  timeBins: TimeBin[];
  selectedTimeBin: string;
  onLayerToggle: (layerId: string) => void;
  onTimeBinChange: (timeBinId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  showTraffic?: boolean;
  onTrafficToggle?: (show: boolean) => void;
}

export const Sidebar = ({
  layers, timeBins, selectedTimeBin, onLayerToggle, onTimeBinChange,
  isCollapsed, showTraffic = false, onTrafficToggle,
}: SidebarProps) => {
  const accent = '#6366F1';

  return (
    <div className={`absolute top-0 left-0 h-full transition-all duration-300 z-10 ${isCollapsed ? 'w-0' : 'w-80'}`} style={{ overflow: 'hidden' }}>
      <div className="flex flex-col h-full w-80 p-4">
        <div className="flex flex-col h-full bg-[#16171e]/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/[0.06]">

          <div className="px-6 py-6 border-b border-white/[0.06]">
            <h1 className="text-xl font-extrabold text-gray-100 mb-1 tracking-wide">Flexible Streets</h1>
            <p className="text-sm text-gray-500">Philadelphia Pilot Project</p>
          </div>

          <div className="px-6 py-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" style={{ color: '#A5B4FC' }} />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Time Period</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {timeBins.map(bin => (
                <button
                  key={bin.id}
                  onClick={() => onTimeBinChange(bin.id)}
                  className={`px-4 py-3 text-left rounded-xl transition-all duration-150 ${
                    selectedTimeBin === bin.id
                      ? 'text-white shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.06]'
                  }`}
                  style={selectedTimeBin === bin.id ? { background: accent, boxShadow: '0 4px 12px rgba(99,102,241,0.25)' } : {}}
                >
                  <span className="text-sm font-semibold">{bin.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4" style={{ color: '#A5B4FC' }} />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Map Overlays</h2>
            </div>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all duration-150 group">
              <input type="checkbox" checked={showTraffic} onChange={(e) => onTrafficToggle?.(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 focus:ring-offset-0"
                style={{ accentColor: accent }}
              />
              <div className="flex items-center gap-2 flex-1">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Real-time Traffic</span>
              </div>
            </label>
            {showTraffic && (
              <div className="ml-7 mt-3 space-y-2 animate-fadeIn">
                {[['bg-green-400','Free Flow'],['bg-yellow-400','Moderate'],['bg-orange-400','Heavy'],['bg-red-400','Severe']].map(([bg,t]) => (
                  <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${bg}`} /><span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4" style={{ color: '#A5B4FC' }} />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Anchor Layers</h2>
            </div>
            <div className="space-y-2">
              {layers.map(layer => (
                <label key={layer.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all duration-150 group">
                  <input type="checkbox" checked={layer.visible} onChange={() => onLayerToggle(layer.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 focus:ring-offset-0"
                    style={{ accentColor: accent }}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: layer.color, boxShadow: `0 0 6px ${layer.color}40` }} />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">{layer.icon} {layer.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

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
      </div>
    </div>
  );
};