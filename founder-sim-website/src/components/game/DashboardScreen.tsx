import { 
  Zap, Users, DollarSign, Flame, Clock, 
  ChevronRight, Wrench, TrendingUp, Swords, 
  UserPlus, Wallet, BarChart3, User, Diamond, Menu
} from 'lucide-react';

const DashboardScreen = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '400px', margin: '0 auto', border: '8px solid #f1f5f9', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '9999px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} style={{ color: '#4f46e5' }} fill="currentColor" />
          </div>
          <div>
            <h4 style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '-0.025em', margin: 0, lineHeight: 1 }}>Blitzscale AI</h4>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', display: 'block' }}>MONTH 62 · DEV TOOLS</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 900, border: '1px solid #d1fae5' }}>
            $58.0M
          </div>
          <button style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', maxHeight: '500px', overflowY: 'auto' }}>
        {/* Focus Energy */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '9999px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} style={{ color: '#eab308' }} fill="currentColor" />
            </div>
            <div>
              <h4 style={{ fontWeight: 900, fontSize: '12px', color: '#312e81', margin: 0, lineHeight: 1 }}>Focus Energy</h4>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', display: 'block' }}>AVAILABLE TO SPEND</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '30px', fontWeight: 900, color: '#4338ca' }}>108h</span>
            <span style={{ color: '#a5b4fc', fontWeight: 700, marginLeft: '4px' }}>/ 120</span>
          </div>
        </div>

        {/* Mini Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: '#94a3b8' }}><Users size={16} /></div>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>760.3K</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Users</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: '#94a3b8' }}><DollarSign size={16} /></div>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>$12.9M</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MRR</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: '#f97316' }}><Flame size={16} fill="currentColor" /></div>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>0%</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Burnout</div>
          </div>
        </div>

        <div style={{ paddingTop: '8px' }}>
           <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: '9999px', display: 'inline-block', margin: '16px 0' }}>
            Month 62 · Now
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Events */}
            {[
              { type: 'EVENT', title: 'Monthly Investor Updates 🔥 applied', color: '#4f46e5' },
              { type: 'TEAM', title: 'Angel Syndicate Membership 🔥 applied', color: '#06b6d4' },
            ].map((ev, i) => (
              <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderLeftWidth: '4px', borderLeftColor: '#4f46e5' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} style={{ color: ev.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{ev.type}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{ev.title}</div>
                </div>
              </div>
            ))}
          </div>

           <div style={{ backgroundColor: '#e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: '9999px', display: 'inline-block', margin: '16px 0' }}>
            Month 61
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
             <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderLeftWidth: '4px', borderLeftColor: '#818cf8' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} style={{ color: '#4f46e5' }} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>EVENT</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Monthly Investor Updates applied</div>
                </div>
              </div>
              <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderLeftWidth: '4px', borderLeftColor: '#f97316' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Swords size={18} style={{ color: '#ea580c' }} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>MARKET</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>RIVAL MOVE: Gavin Belson Corp 2 launched a new platform feature you don't have yet!</div>
                </div>
              </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '24px 0' }}>
          <button style={{ width: '100%', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '16px', padding: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)', border: 'none', cursor: 'pointer' }}>
            ADVANCE TO MONTH 63 <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ padding: '16px', backgroundColor: '#f8fafc', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', rowGap: '24px' }}>
        {[
          { icon: <Wrench size={20} />, label: 'Product', color: '#4f46e5' },
          { icon: <TrendingUp size={20} />, label: 'Growth', color: '#10b981' },
          { icon: <Swords size={20} />, label: 'Rivals', color: '#f59e0b' },
          { icon: <UserPlus size={20} />, label: 'Hire', color: '#eab308' },
          { icon: <Wallet size={20} />, label: 'Funding', color: '#d946ef' },
          { icon: <BarChart3 size={20} />, label: 'Stats', color: '#06b6d4' },
          { icon: <User size={20} />, label: 'Founder', color: '#f43f5e' },
          { icon: <Diamond size={20} />, label: 'Lifestyle', color: '#4f46e5' },
        ].map((btn, i) => (
          <button key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', border: 'none', background: 'none', cursor: 'pointer' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              {btn.icon}
            </div>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', color: '#94a3b8' }}>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardScreen;
