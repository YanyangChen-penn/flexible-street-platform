import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Clock, Layers, ArrowRight, TrendingUp, Users, BarChart3, Map, Zap, Shield } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const handleHomeClick = () => {
    if (location.pathname === '/') scrollToTop();
    else { navigate('/'); setTimeout(scrollToTop, 100); }
  };

  /* Accent: #6366F1 (indigo) */
  const accent = '#6366F1';
  const accentHover = '#818CF8';
  const accentBg = 'rgba(99,102,241,0.12)';
  const accentBorder = 'rgba(99,102,241,0.2)';
  const accentText = '#A5B4FC';
  const accentShadow = 'rgba(99,102,241,0.25)';

  return (
    <div className="w-full bg-[#0c0d12] text-gray-200">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 bg-[#0c0d12]/80 backdrop-blur-xl border-b border-white/[0.06] z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent }}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-extrabold text-gray-100 tracking-wide">Flexible Streets</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={handleHomeClick} className="text-gray-400 hover:text-gray-100 transition-colors text-sm font-medium">Home</button>
              <a href="#features" className="text-gray-400 hover:text-gray-100 transition-colors text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-gray-100 transition-colors text-sm font-medium">How It Works</a>
              <a href="#insights" className="text-gray-400 hover:text-gray-100 transition-colors text-sm font-medium">Insights</a>
              <button onClick={() => navigate('/dashboard')} className="px-5 py-2 text-white rounded-lg transition-colors text-sm font-semibold" style={{ background: accent }}>
                Launch Platform
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(99,102,241,0.08)' }} />
        <div className="absolute top-[100px] right-[-150px] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(147,51,234,0.06)' }} />

        <div className="container mx-auto px-6 pt-36 pb-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-8" style={{ background: accentBg, color: accentText, border: `1px solid ${accentBorder}` }}>
                  Philadelphia Pilot Project
                </div>
                <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-wide">
                  Reimagining Urban<br />Streets for People
                </h1>
                <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
                  Interactive platform for analyzing and visualizing flexible street
                  opportunities across Philadelphia. Explore anchor points, time-based
                  patterns, and street suitability scores.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigate('/map')} className="group px-8 py-4 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold" style={{ background: accent, boxShadow: `0 8px 24px ${accentShadow}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = accentHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = accent)}
                  >
                    Explore Map
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="px-8 py-4 text-gray-300 rounded-lg border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all font-semibold">
                    View Dashboard
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-[#15161e] rounded-2xl p-8 border border-white/[0.06] shadow-2xl shadow-black/30">
                  <div className="aspect-[4/3] rounded-xl mb-6 flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1b26, #12131a)' }}>
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute w-32 h-32 rounded-full blur-[40px]" style={{ background: 'rgba(99,102,241,0.2)' }} />
                    <MapPin className="w-16 h-16 relative z-10" style={{ color: 'rgba(99,102,241,0.4)' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-extrabold mb-1" style={{ color: accentText }}>13</div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Anchors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-purple-400 mb-1">11</div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-emerald-400 mb-1">4</div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Time Periods</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div id="features" className="py-24 border-t border-white/[0.04]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-wide">Powerful Features for Urban Planning</h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto">Everything you need to analyze, visualize, and optimize flexible street opportunities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { Icon: MapPin, bg: 'rgba(99,102,241,0.15)', ic: '#A5B4FC', t: 'Interactive Mapping', d: 'Explore 13 anchor points across Philadelphia with detailed information, real-time traffic data, and customizable layers' },
                { Icon: Clock, bg: 'rgba(147,51,234,0.15)', ic: '#C4B5FD', t: 'Time-Based Analysis', d: 'Analyze street activity patterns across morning, afternoon, evening, and night to optimize flexible street schedules' },
                { Icon: Layers, bg: 'rgba(16,185,129,0.15)', ic: '#6EE7B7', t: 'Multi-Layer View', d: 'Toggle between 11 different anchor categories including education, food & beverage, cultural sites, and more' },
                { Icon: TrendingUp, bg: 'rgba(245,158,11,0.15)', ic: '#FCD34D', t: 'FSI Scoring', d: 'Flexible Street Index (FSI) scores help identify the best candidates for street transformation initiatives' },
                { Icon: BarChart3, bg: 'rgba(244,63,94,0.15)', ic: '#FDA4AF', t: 'Data Insights', d: 'Comprehensive analytics and visualizations help you make data-driven decisions for urban planning' },
                { Icon: Zap, bg: 'rgba(99,102,241,0.15)', ic: '#A5B4FC', t: 'Real-Time Traffic', d: 'Live traffic conditions overlay helps you understand current street usage and congestion patterns' },
              ].map(({ Icon, bg, ic, t, d }) => (
                <div key={t} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color: ic }} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-100 mb-2">{t}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div id="how-it-works" className="py-24 border-t border-white/[0.04]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-wide">How It Works</h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto">Three simple steps to start analyzing flexible street opportunities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { n: '1', bg: 'rgba(99,102,241,0.15)', c: '#A5B4FC', bd: 'rgba(99,102,241,0.2)', t: 'Select Time Period', d: 'Choose from morning, afternoon, evening, or night to see how anchor activity patterns change throughout the day' },
                { n: '2', bg: 'rgba(147,51,234,0.15)', c: '#C4B5FD', bd: 'rgba(147,51,234,0.2)', t: 'Toggle Layers', d: 'Customize your view by selecting which anchor categories to display: education, food, cultural sites, and more' },
                { n: '3', bg: 'rgba(16,185,129,0.15)', c: '#6EE7B7', bd: 'rgba(16,185,129,0.2)', t: 'Analyze Results', d: 'Click on any anchor point to view detailed information, FSI scores, and make informed decisions about street transformations' },
              ].map(({ n, bg, c, bd, t, d }) => (
                <div key={n} className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold mx-auto mb-6" style={{ background: bg, color: c, border: `1px solid ${bd}` }}>{n}</div>
                  <h3 className="text-lg font-bold text-gray-100 mb-3">{t}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Insights ── */}
      <div id="insights" className="py-24 border-t border-white/[0.04]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-6 tracking-wide">Data-Driven Urban Planning</h2>
                <p className="text-lg text-gray-400 mb-10 leading-relaxed">Our platform combines multiple data sources to provide comprehensive insights into flexible street opportunities across Philadelphia.</p>
                <div className="space-y-6">
                  {[
                    { Icon: Map, bg: 'rgba(99,102,241,0.15)', ic: '#A5B4FC', bd: 'rgba(99,102,241,0.2)', t: 'Anchor Point Analysis', d: '13 carefully selected anchor points representing key activity generators across 11 different categories' },
                    { Icon: Users, bg: 'rgba(147,51,234,0.15)', ic: '#C4B5FD', bd: 'rgba(147,51,234,0.2)', t: 'Pedestrian Activity', d: 'Time-based analysis helps identify peak hours and optimal scheduling for flexible street programs' },
                    { Icon: Shield, bg: 'rgba(16,185,129,0.15)', ic: '#6EE7B7', bd: 'rgba(16,185,129,0.2)', t: 'Safety & Accessibility', d: 'FSI scores consider pedestrian safety, accessibility, and community benefit in street transformation recommendations' },
                  ].map(({ Icon, bg, ic, bd, t, d }) => (
                    <div key={t} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg, border: `1px solid ${bd}` }}>
                        <Icon className="w-5 h-5" style={{ color: ic }} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-100 mb-1">{t}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#15161e] rounded-2xl p-10 border border-white/[0.06] text-center">
                <div className="mb-8">
                  <div className="text-6xl font-extrabold mb-2" style={{ color: accentText }}>7.8</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Average FSI Score</div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div><div className="text-3xl font-extrabold text-gray-100 mb-1">100%</div><div className="text-xs text-gray-500 uppercase tracking-wide">Coverage</div></div>
                  <div><div className="text-3xl font-extrabold text-gray-100 mb-1">24/7</div><div className="text-xs text-gray-500 uppercase tracking-wide">Monitoring</div></div>
                  <div><div className="text-3xl font-extrabold text-gray-100 mb-1">11</div><div className="text-xs text-gray-500 uppercase tracking-wide">Categories</div></div>
                  <div><div className="text-3xl font-extrabold text-gray-100 mb-1">4</div><div className="text-xs text-gray-500 uppercase tracking-wide">Time Periods</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Use Cases ── */}
      <div className="py-24 border-t border-white/[0.04]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-wide">Real-World Applications</h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto">See how Flexible Streets Platform is being used in Philadelphia</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { e: '🚶', t: 'Pedestrian-Friendly Streets', d: 'Identify streets with high pedestrian activity near schools, markets, and cultural venues for temporary pedestrianization programs', s: '6 active implementations', sc: '#A5B4FC' },
                { e: '🍽️', t: 'Outdoor Dining Zones', d: 'Analyze food & beverage anchor clusters to support outdoor dining programs and street cafe initiatives', s: '12 restaurant partners', sc: '#C4B5FD' },
                { e: '🎨', t: 'Cultural Events', d: 'Plan temporary street closures around museums, theaters, and cultural institutions for special events and festivals', s: '8 annual events', sc: '#6EE7B7' },
                { e: '🏫', t: 'School Safety Zones', d: 'Create safer drop-off and pick-up areas around educational institutions with time-based street closures', s: '4 pilot schools', sc: '#FCD34D' },
              ].map(({ e, t, d, s, sc }) => (
                <div key={t} className="bg-white/[0.02] rounded-xl p-6 border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
                  <div className="text-3xl mb-4">{e}</div>
                  <h3 className="text-xl font-bold text-gray-100 mb-2">{t}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{d}</p>
                  <div className="text-sm font-semibold" style={{ color: sc }}>{s} →</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-24 relative overflow-hidden border-t border-white/[0.04]">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.08), rgba(147,51,234,0.08))' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(99,102,241,0.1)' }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-wide">Ready to Transform Philadelphia's Streets?</h2>
            <p className="text-lg text-gray-400 mb-10">Start exploring flexible street opportunities with our interactive platform</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/map')} className="group px-8 py-4 text-white rounded-lg transition-all font-semibold inline-flex items-center justify-center gap-2" style={{ background: accent, boxShadow: `0 8px 24px ${accentShadow}` }}
                onMouseEnter={e => (e.currentTarget.style.background = accentHover)}
                onMouseLeave={e => (e.currentTarget.style.background = accent)}
              >
                Launch Interactive Map <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/dashboard')} className="px-8 py-4 text-gray-300 rounded-lg border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all font-semibold">
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-white/[0.06] bg-[#0a0b10]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent }}><MapPin className="w-4 h-4 text-white" /></div>
                  <span className="text-gray-100 font-extrabold text-sm">Flexible Streets</span>
                </div>
                <p className="text-sm text-gray-600">Making Philadelphia's streets more flexible, accessible, and people-friendly.</p>
              </div>
              <div>
                <h3 className="text-gray-300 font-bold text-sm mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><button onClick={() => navigate('/map')} className="hover:text-gray-300 transition-colors">Interactive Map</button></li>
                  <li><button onClick={() => navigate('/dashboard')} className="hover:text-gray-300 transition-colors">Dashboard</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-gray-300 font-bold text-sm mb-4">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#features" className="hover:text-gray-300 transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-gray-300 transition-colors">How It Works</a></li>
                  <li><a href="#insights" className="hover:text-gray-300 transition-colors">Insights</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-gray-300 font-bold text-sm mb-4">About</h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="https://github.com/FANYANG0304/flexible-street-platform" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">GitHub</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-8 text-xs text-center text-gray-600">
              <p>© {currentYear} Flexible Streets Platform. Philadelphia Pilot Project.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};