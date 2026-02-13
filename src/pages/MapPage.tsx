import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { Sidebar } from '../components/Sidebar';
import { AnchorDetailPanel } from '../components/AnchorDetailPanel';
import { sampleAnchors, layerConfigs, timeBins } from '../data/mockData';
import type { Anchor, LayerConfig } from '../types';

export const MapPage = () => {
  const navigate = useNavigate();
  const [layers, setLayers] = useState<LayerConfig[]>(layerConfigs);
  const [selectedTimeBin, setSelectedTimeBin] = useState('afternoon');
  const [selectedAnchor, setSelectedAnchor] = useState<Anchor | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);

  const visibleLayers = new Set(layers.filter(l => l.visible).map(l => l.id));
  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, visible: !layer.visible } : layer));
  };
  const filteredAnchors = sampleAnchors.filter(anchor => visibleLayers.has(anchor.type));

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f1017]">
      <Sidebar
        layers={layers} timeBins={timeBins} selectedTimeBin={selectedTimeBin}
        onLayerToggle={handleLayerToggle} onTimeBinChange={setSelectedTimeBin}
        isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        showTraffic={showTraffic} onTrafficToggle={setShowTraffic}
      />

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute z-50 bg-[#1e1f2b] p-3 rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-[#282938] border border-white/[0.06]"
        style={{ top: '16px', left: sidebarCollapsed ? '16px' : '336px', transition: 'left 0.3s ease-in-out' }}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        )}
      </button>

      <div className="absolute top-0 right-0 bottom-0 transition-all duration-300" style={{ left: sidebarCollapsed ? 0 : '320px' }}>
        <MapComponent anchors={filteredAnchors} visibleLayers={visibleLayers} selectedTimeBin={selectedTimeBin} onAnchorClick={setSelectedAnchor} showTraffic={showTraffic} />
      </div>

      <AnchorDetailPanel anchor={selectedAnchor} onClose={() => setSelectedAnchor(null)} />

      <div
        className="absolute top-0 transition-all duration-300 z-40 py-4 bg-[#0f1017]/90 backdrop-blur-md border-b border-white/[0.04]"
        style={{ left: sidebarCollapsed ? 0 : '320px', right: 0, paddingLeft: sidebarCollapsed ? '70px' : '80px', paddingRight: '24px' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-100 tracking-wide">Flexible Street Platform</h2>
            <p className="text-xs text-gray-500">
              Time: <span className="font-semibold text-gray-400">{timeBins.find(t => t.id === selectedTimeBin)?.label}</span>
              {' · '}Anchors: <span className="font-semibold text-gray-400">{filteredAnchors.length}</span>
              {showTraffic && <>{' · '}<span className="text-green-400 font-semibold">🚦 Traffic Live</span></>}
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