'use client';

import { useState } from 'react';
import { runEvaluation, FullEvaluation } from '../../lib/api';
import Link from 'next/link';

const LABEL_COLORS: Record<string, string> = {
  CYBERBULLYING: '#ef4444',
  OFFENSIVE: '#f97316',
  SAFE: '#22c55e',
};

function MetricBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444';
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: '#cbd5e1' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ background: '#1e293b', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function StarRatingDisplay({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span style={{ color: '#facc15', fontSize: '1.1rem' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i}>{i < Math.round(value) ? '★' : '☆'}</span>
      ))}
      <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '6px' }}>{value.toFixed(1)}</span>
    </span>
  );
}

export default function EvaluatePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FullEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const result = await runEvaluation();
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  }

  const m = data?.detection_metrics;
  const s = data?.survey_stats;
  const f = data?.feedback_stats;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f1f5f9',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      padding: '2rem',
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Dashboard
          </Link>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          System Evaluation Report
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Precision · Recall · F1 · User Satisfaction — In fulfilment of Research Objective 4 (RO4)
        </p>

        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '2.5rem',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '⏳ Running Evaluation...' : '▶ Run Full Evaluation'}
        </button>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: '12px', padding: '1rem', color: '#fca5a5', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ─── Detection Metrics ─────────────────────────────────────────────── */}
        {m && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Overall Summary */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#a78bfa' }}>🎯 Overall Detection</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                {[
                  { label: 'Accuracy', value: `${(m.accuracy * 100).toFixed(1)}%` },
                  { label: 'F1 (Macro)', value: `${(m.macro_f1 * 100).toFixed(1)}%` },
                  { label: 'Precision', value: `${(m.macro_precision * 100).toFixed(1)}%` },
                  { label: 'Recall', value: `${(m.macro_recall * 100).toFixed(1)}%` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '10px', padding: '0.8rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {m.correct_predictions}/{m.total_samples} correct on gold test set
              </div>
            </div>

            {/* Per-Class Metrics */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#a78bfa' }}>📊 Per-Class Breakdown</h2>
              {(['CYBERBULLYING', 'OFFENSIVE', 'SAFE'] as const).map((cls) => {
                const c = m.per_class[cls];
                if (!c) return null;
                return (
                  <div key={cls} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: LABEL_COLORS[cls], display: 'inline-block' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cls}</span>
                    </div>
                    <MetricBar value={c.precision} label="Precision" />
                    <MetricBar value={c.recall} label="Recall" />
                    <MetricBar value={c.f1} label="F1 Score" />
                  </div>
                );
              })}
            </div>

            {/* Feedback Stats */}
            {f && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#a78bfa' }}>👍 Feedback Analysis</h2>
                {f.total_feedback === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No user feedback collected yet. Thumbs up/down will appear here after users provide feedback in the chat.</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1, background: 'rgba(34,197,94,0.1)', borderRadius: '10px', padding: '0.8rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e' }}>👍 {f.helpful_count}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Helpful</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', borderRadius: '10px', padding: '0.8rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>👎 {f.unhelpful_count}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Not Helpful</div>
                      </div>
                    </div>
                    <MetricBar value={f.helpful_rate} label={`Overall Helpful Rate (${Math.round(f.helpful_rate * 100)}%)`} />
                    {(['CYBERBULLYING', 'OFFENSIVE', 'SAFE'] as const).map((cls) => {
                      const bl = f.by_label[cls];
                      if (!bl || bl.total_feedback === 0) return null;
                      return (
                        <MetricBar key={cls} value={bl.helpful_rate} label={`${cls} helpful rate`} />
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Survey Stats */}
            {s ? (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#a78bfa' }}>📋 User Satisfaction Survey</h2>
                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#818cf8' }}>{s.sus_score}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>SUS Score (out of 100)</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Based on {s.total_responses} response{s.total_responses !== 1 ? 's' : ''}</div>
                </div>
                {[
                  { label: 'Overall Satisfaction', val: s.avg_overall },
                  { label: 'Chatbot Understanding', val: s.avg_understanding },
                  { label: 'Detection Accuracy', val: s.avg_detection },
                  { label: 'Support Quality', val: s.avg_support },
                  { label: 'Would Use Again', val: s.avg_return },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#cbd5e1' }}>{label}</span>
                    <StarRatingDisplay value={val} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#a78bfa' }}>📋 Satisfaction Survey</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  No survey responses yet. Users can submit ratings after their chat sessions.
                  Results will appear here automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Detailed Test Results ─────────────────────────────────────────── */}
        {m && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div
              style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowDetails(!showDetails)}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa', margin: 0 }}>
                📝 Gold Test Set Results ({m.total_samples} examples)
              </h2>
              <span style={{ color: '#94a3b8' }}>{showDetails ? '▲ Hide' : '▼ Show'}</span>
            </div>
            {showDetails && (
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {['#', 'Text', 'Expected', 'Predicted', 'Result'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#64748b', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {m.detailed_results.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: r.correct ? 'rgba(34,197,94,0.03)' : 'rgba(239,68,68,0.05)' }}>
                        <td style={{ padding: '8px', color: '#64748b' }}>{i + 1}</td>
                        <td style={{ padding: '8px', color: '#cbd5e1', maxWidth: '300px' }}>{r.text}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ background: `${LABEL_COLORS[r.expected]}22`, color: LABEL_COLORS[r.expected], borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {r.expected}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ background: `${LABEL_COLORS[r.predicted]}22`, color: LABEL_COLORS[r.predicted], borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {r.predicted}
                          </span>
                        </td>
                        <td style={{ padding: '8px', fontSize: '1rem' }}>{r.correct ? '✅' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!m && !loading && (
          <div style={{ textAlign: 'center', color: '#475569', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <p>Click <strong>Run Full Evaluation</strong> to compute precision, recall, F1, and feedback analysis.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>This runs detection on 50 curated gold-standard examples and aggregates real user feedback and survey data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
