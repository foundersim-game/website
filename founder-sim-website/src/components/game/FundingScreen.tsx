import { Building2, Zap, CheckCircle2, TrendingUp, Users } from 'lucide-react';

const FundingScreen = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '400px', margin: '0 auto', border: '8px solid #f1f5f9', fontFamily: 'sans-serif', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', backgroundColor: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
           <Building2 size={28} style={{ color: '#475569' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0, lineHeight: 1, marginBottom: '4px' }}>FUNDING</h2>
          <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, lineHeight: 1 }}>
            STAGE: IPO READY · 82% FOUNDER EQUITY
          </p>
        </div>
      </div>

      {/* Emergency Grant */}
      <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '12px', color: '#d97706' }}><Zap size={20} fill="currentColor" /></div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>EMERGENCY GRANT</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>WATCH AD FOR +$3.5M</div>
          </div>
        </div>
        <button style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '8px 16px', borderRadius: '9999px', fontSize: '10px', fontWeight: 900, border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
          CLAIM (ADS)
        </button>
      </div>

      <div style={{ fontSize: '10px', fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>INSTANT ACTION (COSTS ENERGY)</div>

      {/* Pitch Action */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '20px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9', color: '#f43f5e' }}><TrendingUp size={24} /></div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '14px' }}>Pitch Series B</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>$15M–$50M · 15–25% equity</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase', marginBottom: '4px' }}>-10 Tech Boost</div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}><Zap size={14} fill="currentColor" /> 40h</div>
        </div>
      </div>

      {/* Cap Table */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CAP TABLE</div>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pool: 0%</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Founder', val: 82, color: '#4f46e5' },
            { label: 'Seed Round Investor', val: 10, color: '#eab308' },
            { label: 'Series A Investor', val: 18, color: '#fbbf24' },
          ].map((item, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9999px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={14} style={{ color: '#94a3b8' }} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a' }}>{item.val}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: item.color, borderRadius: '9999px', width: `${item.val}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fundraising Pipeline */}
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '32px', padding: '24px', marginBottom: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start', marginBottom: '24px' }}>
          <TrendingUp size={16} style={{ color: '#f97316' }} />
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FUNDRAISING PIPELINE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
           <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#c2410c' }}>0</div>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase' }}>LEADS</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#c2410c' }}>0</div>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase' }}>MEETINGS</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#c2410c' }}>0</div>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase' }}>TERM SHEETS</div>
          </div>
        </div>
        <p style={{ fontSize: '9px', fontWeight: 700, color: '#fb923c', marginTop: '16px', fontStyle: 'italic', margin: 0 }}>
          Pitch investors to grow your pipeline. Term sheets take 2-4 months to generate.
        </p>
      </div>

      {/* IPO Readiness */}
      <div style={{ backgroundColor: '#eef2ff', border: '1px solid #e0e7ff', borderRadius: '32px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} style={{ color: '#4f46e5' }} />
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.1em' }}>IPO READINESS</span>
          </div>
          <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '9px', fontWeight: 900, padding: '4px 12px', borderRadius: '9999px' }}>5/5</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', rowGap: '12px', columnGap: '16px' }}>
          {[
            '$50M ARR', '10K+ Users', 'PMF Score ≥ 60', 'Tech Debt < 40%', 'Series A+ Raised'
          ].map((check, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#312e81' }}>{check}</span>
            </div>
          ))}
        </div>
      </div>

      <button style={{ width: '100%', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '16px', padding: '20px', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)', border: 'none', cursor: 'pointer' }}>
        FILE S-1 & BEGIN IPO PROCESS →
      </button>
    </div>
  );
};

export default FundingScreen;
