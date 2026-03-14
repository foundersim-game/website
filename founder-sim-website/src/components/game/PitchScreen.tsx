import { Briefcase, X } from 'lucide-react';

const PitchScreen = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '400px', margin: '0 auto', border: '8px solid #f1f5f9', fontFamily: 'sans-serif', position: 'relative' }}>
      {/* Upper header */}
      <div style={{ backgroundColor: '#4f46e5', padding: '32px', paddingTop: '48px', paddingBottom: '80px', position: 'relative' }}>
        <button style={{ position: 'absolute', top: '24px', right: '24px', color: '#c7d2fe', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#f8fafc', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transform: 'rotate(3deg)' }}>
            <Briefcase size={32} style={{ color: '#475569' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.025em', margin: 0, lineHeight: 1, marginBottom: '4px' }}>Taylor</h2>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#e0e7ff', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, lineHeight: 1 }}>
              Domain Capital · Growth VC
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div style={{ padding: '0 24px', marginTop: '-48px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #f8fafc', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
           {/* Ownership Strategy */}
           <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
               <div>
                <div style={{ fontSize: '9px', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>OWNERSHIP STRATEGY</div>
                <div style={{ width: '48px', height: '4px', backgroundColor: '#4f46e5', borderRadius: '9999px' }} />
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 4px' }}>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>FOUNDER</span>
                <span style={{ fontSize: '8px', fontWeight: 900, color: '#334155', textAlign: 'right' }}>82.0%</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>DILUTED</span>
                <span style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textAlign: 'right' }}>67.2%</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>DILUTION</span>
                <span style={{ fontSize: '8px', fontWeight: 900, color: '#ef4444', textAlign: 'right' }}>-14.8%</span>
              </div>
            </div>
            {/* Range Bar */}
            <div style={{ width: '100%', height: '32px', backgroundColor: '#eef2ff', border: '1px solid #e0e7ff', borderRadius: '9999px', overflow: 'hidden', display: 'flex', padding: '4px', position: 'relative' }}>
               <div style={{ height: '100%', backgroundColor: '#4f46e5', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#ffffff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', width: '82%' }}>
                82.0% Existing
               </div>
               <div style={{ height: '100%', backgroundColor: 'rgba(129, 140, 248, 0.2)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#818cf8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px', flex: 1 }}>
                 18% New...
               </div>
            </div>
           </div>

           {/* Sliders */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>POST-MONEY VALUATION</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#4f46e5' }}>$5.1B</span>
                </div>
                <div style={{ position: 'relative', height: '8px' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: '#f1f5f9', borderRadius: '9999px' }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: '#6366f1', borderRadius: '9999px', width: '60%' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '60%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', backgroundColor: '#ffffff', border: '4px solid #4f46e5', borderRadius: '9999px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>EQUITY TO INVESTOR</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#4f46e5' }}>18%</span>
                </div>
                <div style={{ position: 'relative', height: '8px' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: '#f1f5f9', borderRadius: '9999px' }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: '#6366f1', borderRadius: '9999px', width: '45%' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '45%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', backgroundColor: '#ffffff', border: '4px solid #4f46e5', borderRadius: '9999px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </div>
              </div>
           </div>

           {/* Investment Amount */}
           <div style={{ backgroundColor: 'rgba(238, 242, 255, 0.5)', border: '1px solid #e0e7ff', borderRadius: '24px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#312e81', textTransform: 'uppercase', letterSpacing: '0.1em' }}>INVESTMENT AMOUNT</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#4338ca' }}>$912.2M</span>
           </div>

           {/* Buttons */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <button style={{ backgroundColor: '#ffffff', border: '2px solid #f1f5f9', color: '#94a3b8', borderRadius: '16px', padding: '16px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                WALK AWAY
              </button>
              <button style={{ backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '16px', padding: '16px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)', border: 'none', cursor: 'pointer' }}>
                SUBMIT PITCH
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PitchScreen;
