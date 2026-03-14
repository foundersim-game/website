import { Zap, FolderOpen, Info, Award, Star } from 'lucide-react';

const HomeScreen = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '400px', margin: '0 auto', border: '8px solid #f1f5f9', fontFamily: 'sans-serif', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Logo */}
      <div style={{ marginTop: '32px', marginBottom: '16px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: '#4f46e5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)' }}>
          <Zap size={32} color="white" fill="white" />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.05em', margin: 0 }}>
          FOUNDER<span style={{ color: '#4f46e5', fontStyle: 'italic' }}>SIM</span>
        </h1>
        <p style={{ fontSize: '10px', fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.4em', marginTop: '8px', margin: 0 }}>
          BUILD · GROW · EXIT
        </p>
      </div>

      <div style={{ backgroundColor: '#eef2ff', color: '#4f46e5', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: '9999px', margin: '40px 0' }}>
        V1.0.0 · THE LAUNCH
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', width: '100%', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#fbbf24' }}><Award size={24} /></div>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>EXITS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>6</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#818cf8' }}><Star size={24} /></div>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>AVAILABLE</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>64893 XP</div>
        </div>
      </div>

      {/* Hall of Fame */}
      <div style={{ width: '100%', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <Info size={14} style={{ color: '#cbd5e1' }} />
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HALL OF FAME</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { name: 'Blitzscale AI', sub: 'IPO · $3.1B', xp: '+3194 XP' },
            { name: 'Blitzscale AI', sub: 'IPO · $3.2B', xp: '+3309 XP' },
            { name: 'Blitzscale AI', sub: 'ACQUIRED · $17.4B', xp: '+17460 XP' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#1e293b' }}>{item.name}</div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#4f46e5' }}>{item.xp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button style={{ width: '100%', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '16px', padding: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)', border: 'none', cursor: 'pointer' }}>
          <Zap size={20} fill="currentColor" /> CONTINUE GAME
        </button>
        <button style={{ width: '100%', backgroundColor: '#ffffff', border: 'none', color: '#0f172a', borderRadius: '16px', padding: '16px', fontWeight: 900, outline: '2px solid #f1f5f9', cursor: 'pointer' }}>
           NEW GAME
        </button>
        <button style={{ width: '100%', backgroundColor: '#ffffff', border: 'none', color: '#0f172a', borderRadius: '16px', padding: '16px', fontWeight: 900, outline: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}>
          <FolderOpen size={20} style={{ color: '#94a3b8' }} /> LOAD GAME <span style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '9px', width: '20px', height: '20px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>6</span>
        </button>
        <button style={{ width: '100%', backgroundColor: '#ffffff', border: 'none', color: '#94a3b8', borderRadius: '16px', padding: '16px', fontWeight: 900, outline: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}>
          <Info size={20} /> HOW TO PLAY
        </button>
      </div>

      <div style={{ marginTop: '32px', fontSize: '9px', fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        FOUNDERSIM · BUILD GROW EXIT
      </div>
    </div>
  );
};

export default HomeScreen;
