import { X, TrendingUp, ShoppingBag, Users, Leaf, Star, Sparkles } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StreetScore {
  featureId:  number;
  streetName: string;
  responsibl: string;
  commercial: number;
  social:     number;
  ecological: number;
  total:      number;
  // AI sensory fields — present only when the street has been analysed
  aiScore?:   number;
  keywords?:  string[];
}

interface StreetScorePanelProps {
  score:   StreetScore | null;
  onClose: () => void;
}

// ── Pseudo-random FSI generator (UNCHANGED) ────────────────────────────────────

export function generateStreetScores(featureId: number, streetName?: string): StreetScore {
  const hash = (seed: number): number => {
    let h = Math.abs(seed) | 0;
    h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
    h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
    h = (h >> 16) ^ h;
    return Math.abs(h) % 101;
  };
  const commercial = hash(featureId * 7 + 1);
  const social     = hash(featureId * 7 + 3);
  const ecological = hash(featureId * 7 + 5);
  const total      = Math.round((commercial + social + ecological) / 3);
  return {
    featureId,
    streetName: streetName || '',
    responsibl: '',
    commercial,
    social,
    ecological,
    total,
  };
}

// ── Score utilities (UNCHANGED) ───────────────────────────────────────────────

export function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 65) return '#22C55E';
  if (score >= 50) return '#EAB308';
  if (score >= 35) return '#F97316';
  return '#EF4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Moderate';
  if (score >= 35) return 'Fair';
  return 'Low';
}

// ── Bar config (UNCHANGED) ────────────────────────────────────────────────────

const BAR_CONFIG = [
  { key: 'commercial' as const, label: 'Commercial Value', sub: 'Business activity & economic potential',      Icon: ShoppingBag, accent: '#818CF8' },
  { key: 'social'     as const, label: 'Social Value',     sub: 'Community engagement & pedestrian activity',  Icon: Users,       accent: '#F472B6' },
  { key: 'ecological' as const, label: 'Ecological Value', sub: 'Green infrastructure & environmental benefit', Icon: Leaf,        accent: '#34D399' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolve display name: DB name > props name > Street #ID */
function resolveDisplayName(score: StreetScore): string {
  const n = (score.streetName || '').trim();
  if (n && n.toLowerCase() !== 'unnamed street') return n;
  return `Street #${score.featureId}`;
}

function getAIScoreLabel(s: number): string {
  if (s >= 80) return 'Excellent';
  if (s >= 65) return 'Good';
  if (s >= 50) return 'Moderate';
  if (s >= 35) return 'Fair';
  return 'Low';
}

// ── Component ─────────────────────────────────────────────────────────────────

export const StreetScorePanel = ({ score, onClose }: StreetScorePanelProps) => {
  if (!score) return null;

  const totalColor  = getScoreColor(score.total);
  const recommended = score.total >= 80;
  const displayName = resolveDisplayName(score);

  const hasAI       = typeof score.aiScore === 'number';
  const hasKeywords = hasAI && Array.isArray(score.keywords) && score.keywords.length > 0;
  const aiColor     = hasAI ? getScoreColor(score.aiScore!) : '#6B7280';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[560px] max-w-[calc(100vw-48px)] animate-fadeIn">
      <div className="bg-[#16171e]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-lg font-extrabold text-gray-100 truncate tracking-wide">
                  {displayName}
                </h3>
                {recommended && (
                  <span
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.25)' }}
                  >
                    <Star className="w-3 h-3" /> RECOMMENDED
                  </span>
                )}
              </div>

              {score.responsibl && (
                <p className="text-xs text-gray-500">
                  Managed by <span className="text-gray-400 font-semibold">{score.responsibl}</span>
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5">

          {/* ── AI Sensory Score (NEW) ── */}
          <div
            className="rounded-xl p-4 border"
            style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.15)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: '#818CF8' }} />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">AI Street Vibe</span>
              <span className="text-[10px] text-gray-600 ml-auto">Claude Vision analysis</span>
            </div>

            {hasAI ? (
              <div className="flex items-center gap-4">
                {/* Score number */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-3xl font-extrabold" style={{ color: aiColor }}>
                    {score.aiScore}
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: aiColor }}>
                    {getAIScoreLabel(score.aiScore!)}
                  </span>
                </div>
                {/* Score bar */}
                <div className="flex-1">
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${score.aiScore}%`,
                        background: `linear-gradient(90deg, ${aiColor}80, ${aiColor})`,
                      }}
                    />
                  </div>
                  {/* Keywords */}
                  {hasKeywords && (
                    <div className="flex gap-2 flex-wrap">
                      {score.keywords!.map(kw => (
                        <span
                          key={kw}
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: 'rgba(99,102,241,0.14)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.25)',
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 italic">Pending analysis — run analyze-streets.mjs to generate</p>
            )}
          </div>

          {/* ── Existing FSI Score (UNCHANGED) ── */}
          <div className="flex gap-6">

            {/* Total ring */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-28">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={totalColor} strokeWidth="6"
                    strokeDasharray={`${score.total * 2.64} 264`}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dasharray 0.6s ease-out',
                      filter: `drop-shadow(0 0 6px ${totalColor}40)`,
                    }}
                  />
                </svg>
                <span className="text-3xl font-extrabold" style={{ color: totalColor }}>
                  {score.total}
                </span>
              </div>
              <span className="text-xs font-bold mt-2" style={{ color: totalColor }}>
                {getScoreLabel(score.total)}
              </span>
              <span className="text-[10px] text-gray-600 mt-0.5">Flexibility Score</span>
            </div>

            {/* Sub-score bars */}
            <div className="flex-1 space-y-3.5">
              {BAR_CONFIG.map(({ key, label, sub, Icon, accent }) => {
                const val      = score[key];
                const valColor = getScoreColor(val);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                        <span className="text-xs font-semibold text-gray-300">{label}</span>
                      </div>
                      <span className="text-sm font-extrabold" style={{ color: valColor }}>{val}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${val}%`,
                          background: `linear-gradient(90deg, ${accent}90, ${accent})`,
                          boxShadow: `0 0 8px ${accent}30`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended callout */}
          {recommended && (
            <div
              className="px-4 py-3 rounded-xl border"
              style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.15)' }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-300/80">
                  <span className="font-bold text-emerald-300">High flexibility potential.</span>{' '}
                  This street segment scores above 80 and is recommended for flexible use activation.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
