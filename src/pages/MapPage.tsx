import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { Sidebar } from '../components/Sidebar';
import { AnchorDetailPanel } from '../components/AnchorDetailPanel';
import { sampleAnchors, layerConfigs, timeBins } from '../data/mockData';
import type { Anchor, LayerConfig } from '../types';

/* Determine current time bin based on hour */
function getCurrentTimeBin(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 24) return 'evening';
  return 'night';
}

export const MapPage = () => {
  const navigate = useNavigate();

  /* Default: all anchor layers OFF */
  const [layers, setLayers] = useState<LayerConfig[]>(() =>
    layerConfigs.map(l => ({ ...l, visible: false }))
  );

  /* Default: current time bin */
  const [selectedTimeBin, setSelectedTimeBin] = useState(getCurrentTimeBin);

  const [selectedAnchor, setSelectedAnchor] = useState<Anchor | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* Default: all overlays ON */
  const [showTraffic, setShowTraffic] = useState(false);
  const [showStreetCenterline, setShowStreetCenterline] = useState(true);
  const [showPOI, setShowPOI] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(320);

  const visibleLayers = useMemo(() => new Set(layers.filter(l => l.visible).map(l => l.id)), [layers]);
  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, visible: !layer.visible } : layer));
  };
  const handleSelectAll = () => setLayers(prev => prev.map(l => ({ ...l, visible: true })));
  const handleDeselectAll = () => setLayers(prev => prev.map(l => ({ ...l, visible: false })));

  const filteredAnchors = sampleAnchors.filter(anchor => visibleLayers.has(anchor.type));
  const effectiveLeft = sidebarCollapsed ? 0 : sidebarWidth;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f1017]">
      <Sidebar
        layers={layers} timeBins={timeBins} selectedTimeBin={selectedTimeBin}
        onLayerToggle={handleLayerToggle} onTimeBinChange={setSelectedTimeBin}
        onSelectAll={handleSelectAll} onDeselectAll={handleDeselectAll}
        isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        showTraffic={showTraffic} onTrafficToggle={setShowTraffic}
        showStreetCenterline={showStreetCenterline} onStreetCenterlineToggle={setShowStreetCenterline}
        showPOI={showPOI} onPOIToggle={setShowPOI}
        width={sidebarWidth} onWidthChange={setSidebarWidth}
      />

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute z-50 bg-[#1e1f2b] p-3 rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-[#282938] border border-white/[0.06]"
        style={{ top: '16px', left: sidebarCollapsed ? '16px' : `${sidebarWidth + 16}px`, transition: 'left 0.3s ease-in-out' }}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        )}
      </button>

      <div className="absolute top-0 right-0 bottom-0 transition-all duration-300" style={{ left: effectiveLeft }}>
        <MapComponent anchors={filteredAnchors} visibleLayers={visibleLayers} selectedTimeBin={selectedTimeBin}
          onAnchorClick={setSelectedAnchor} showTraffic={showTraffic} showStreetCenterline={showStreetCenterline} showPOI={showPOI} />
      </div>

      <AnchorDetailPanel anchor={selectedAnchor} onClose={() => setSelectedAnchor(null)} />

      <div
        className="absolute top-0 transition-all duration-300 z-40 py-4 bg-[#0f1017]/90 backdrop-blur-md border-b border-white/[0.04]"
        style={{ left: effectiveLeft, right: 0, paddingLeft: sidebarCollapsed ? '70px' : '80px', paddingRight: '24px' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-100 tracking-wide">Flexible Street Platform</h2>
            <p className="text-xs text-gray-500">
              Time: <span className="font-semibold text-gray-400">{timeBins.find(t => t.id === selectedTimeBin)?.label}</span>
              {' · '}Anchors: <span className="font-semibold text-gray-400">{filteredAnchors.length}</span>
              {showTraffic && <>{' · '}<span className="text-green-400 font-semibold">🚦 Traffic</span></>}
              {showStreetCenterline && <>{' · '}<span className="text-indigo-400 font-semibold">🛣️ Centerline</span></>}
              {showPOI && <>{' · '}<span className="text-sky-400 font-semibold">📍 POI</span></>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.12)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.2)' }}>
              Philadelphia Pilot
            </div>
            <button onClick={() => navigate('/')} className="p-2 bg-[#1e1f2b] rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-[#282938] border border-white/[0.06]" title="Back to home">
              <Home className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};