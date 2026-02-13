import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Users, Calendar, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const accent = '#6366F1';
  const accentHover = '#818CF8';
  const accentShadow = 'rgba(99,102,241,0.25)';

  return (
    <div className="min-h-screen bg-[#0c0d12]">
      <div className="border-b border-white/[0.06] bg-[#0c0d12]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent }}><MapPin className="w-5 h-5 text-white" /></div>
              <span className="text-lg font-extrabold text-gray-100 tracking-wide">Flexible Streets</span>
            </div>
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">← Back to Home</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Philadelphia Pilot Project</h1>
        <p className="text-gray-500 mb-12">Overview of flexible street opportunities and anchor analysis</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { Icon: MapPin, bg: 'rgba(99,102,241,0.15)', ic: '#A5B4FC', label: 'Total', val: '13', sub: 'Anchor Points' },
            { Icon: TrendingUp, bg: 'rgba(16,185,129,0.15)', ic: '#6EE7B7', label: '+12%', val: '7.8', sub: 'Avg FSI Score' },
            { Icon: Users, bg: 'rgba(147,51,234,0.15)', ic: '#C4B5FD', label: 'Active', val: '11', sub: 'Categories' },
            { Icon: Calendar, bg: 'rgba(245,158,11,0.15)', ic: '#FCD34D', label: 'Analyzed', val: '4', sub: 'Time Periods' },
          ].map(({ Icon, bg, ic, label, val, sub }) => (
            <div key={sub} className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06] hover:bg-white/[0.05] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: bg }}><Icon className="w-5 h-5" style={{ color: ic }} /></div>
                <span className="text-xs font-semibold" style={{ color: ic }}>{label}</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-100 mb-1">{val}</div>
              <div className="text-sm text-gray-500">{sub}</div>
            </div>
          ))}
        </div>

        <div className="relative rounded-2xl p-12 text-center overflow-hidden border border-white/[0.06]">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(147,51,234,0.1))' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full blur-[80px]" style={{ background: 'rgba(99,102,241,0.12)' }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Explore?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">Dive into the interactive map to analyze anchor points, toggle layers, and explore flexible street opportunities across different time periods.</p>
            <button onClick={() => navigate('/map')} className="group px-8 py-4 text-white rounded-lg transition-all font-semibold inline-flex items-center gap-2" style={{ background: accent, boxShadow: `0 8px 24px ${accentShadow}` }}
              onMouseEnter={e => (e.currentTarget.style.background = accentHover)}
              onMouseLeave={e => (e.currentTarget.style.background = accent)}
            >
              Open Interactive Map <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};