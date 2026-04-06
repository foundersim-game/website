import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight, Star, X,
  ExternalLink, ChevronRight, Mail, MessageSquare, ShieldCheck
} from 'lucide-react';

// ── ASSETS ────────────────────────────────────────────────────────────
const logo        = '/assets/app-logo.png';
const samImg      = '/assets/sam_mentor.png';
const chadImg     = '/assets/chad_rival.png';

// Game screens
const sHome       = '/assets/Main Home Screen.png';
const sDash       = '/assets/New Dashboard Screen.png';
const sHiring     = '/assets/Hiring Screen.png';
const sEvent      = '/assets/Event Screen.png';
const sFinancials = '/assets/Financials Screen.png';
const sPitch      = '/assets/Investor Pitch Screen.png';
const sFunding    = '/assets/Funding Screen.png';
const sMarketing  = '/assets/Markeitng Screen.png';
const sTeam       = '/assets/Team Managee.png';
const sProduct    = '/assets/Product Screen.png';
const sLifestyle  = '/assets/Founder Lifestyle Screen.png';
const sIPO        = '/assets/IPO & Acquisition Screen.png';

// ── ANIMATION HELPERS ──────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.55 } },
};

// ── InView SECTION ────────────────────────────────────────────────────
function Reveal({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref} id={id} className={`section ${className}`}
      initial="hidden" animate={inView ? 'show' : 'hidden'} variants={stagger}>
      {children}
    </motion.section>
  );
}

// ── PRIVACY POLICY ────────────────────────────────────────────────────
const PrivacyPolicy = () => (
  <div style={{ padding: '160px 0 80px', maxWidth: 820, margin: '0 auto', paddingLeft: 40, paddingRight: 40 }}>
    <div className="site-bg" />
    <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, color:'var(--brand-light)', textDecoration:'none', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:48 }}>
      <ChevronRight size={14} style={{ transform:'rotate(180deg)' }} /> Back to Home
    </Link>
    <h1 className="section-title" style={{ fontSize:44, marginBottom:8 }}>Privacy Policy</h1>
    <p style={{ color:'var(--text-subtle)', fontSize:12, letterSpacing:'0.2em', marginBottom:56, textTransform:'uppercase' }}>Last updated: March 14, 2026</p>
    {[
      { num:'01', title:'Data Collection & Safety', body:'We collect gameplay telemetry, session data, and device identifiers to power personalized experiences. We disclose that we collect: (1) Device or other IDs (such as Google Advertising ID) for advertising and analytics; (2) Performance data and crash logs for technical stability; (3) Gameplay activity to improve game balance.' },
      { num:'02', title:'Advertising ID Usage', body:'Founder Sim uses the Google Advertising ID (AAID) for providing personalized advertisements and performing internal analytics. This identifier is user-resettable. We do not link the Advertising ID to personally identifiable information without your explicit consent.' },
      { num:'03', title:'User Control & Rights', body:'You have full control over your data. You can reset or delete your Advertising ID at any time through your device settings. If you opt out of interest-based advertising, the Advertising ID will be returned as zeros. Contact our support team to request deletion of gameplay data.' },
      { num:'04', title:'Third-Party Services', body:'We integrate: (1) Google Play Services for game functionality; (2) Google AdMob for non-intrusive advertisements; (3) Firebase for crash reporting and technical analytics. Each service operates under Google\'s privacy protocols.' },
      { num:'05', title:'Data Retention & Contact', body:'We retain telemetry data only as long as necessary to provide game services. For privacy inquiries, contact foundersim.game@gmail.com. We respond to all verified requests within 48 hours.' },
    ].map(s => (
      <div key={s.num} className="glass" style={{ padding:'32px', marginBottom:20 }}>
        <div style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, color:'rgba(124,58,237,0.6)', letterSpacing:'0.3em', marginBottom:12 }}>{s.num}</div>
        <h2 className="syne" style={{ fontSize:18, fontWeight:800, marginBottom:12, color:'#fff' }}>{s.title}</h2>
        <p style={{ color:'var(--text-muted)', lineHeight:1.8, fontSize:14 }}>{s.body}</p>
      </div>
    ))}
  </div>
);

// ── LANDING PAGE ──────────────────────────────────────────────────────
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const features = [
    { c:'c-purple', icon:'🏛️', title:'Realistic IPO Mechanics', desc:'Set your face value, pick a valuation multiple, and watch the market respond. Oversubscribed or undersubscribed — every outcome reflects your startup\'s real health.', stat:'Up to 2× oversubscription demand' },
    { c:'c-emerald', icon:'📊', title:'Live Cap Table & Dilution', desc:'Navigate Seed, Series A/B/C rounds. Only your founder equity gets diluted — existing investors keep their stake, just like the real world.', stat:'Founder-accurate dilution model' },
    { c:'c-amber', icon:'🧠', title:'AI-Powered Decisions', desc:'100% AI-generated founder dilemmas — RTO debate, toxic hire, activist short-seller. Two mentors, Sam and Chad, guide (or antagonize) every call.', stat:'Infinite unique scenarios' },
    { c:'c-purple', icon:'👥', title:'Build Your Dream Team', desc:'Hire engineers, marketers, sales leads, and CXOs. Manage burnout, culture, and equity pools as you scale from 1 to 40+ people.', stat:'CFO mandatory for IPO filing' },
    { c:'c-emerald', icon:'💰', title:'Fundraising Simulator', desc:'Hire a Fundraising Consultant or activate CFO roadshows. Generate investor leads, negotiate term sheets, and close rounds under pressure.', stat:'Full 6-stage funding journey' },
    { c:'c-rose', icon:'🚀', title:'Growth Strategy Engine', desc:'GTM, viral loops, paid, or enterprise B2B — pick your growth model. Every strategy has unit economics consequences you\'ll feel months later.', stat:'84M+ peak users simulated' },
  ];

  const steps = [
    { num:'01', title:'Pick Your Vertical', desc:'Choose from 8+ startup sectors — FinTech, BioTech, AI, SaaS. Each has unique market dynamics and competitive pressures.' },
    { num:'02', title:'Manage Cash & Burn', desc:'Make monthly decisions on hiring, product, and GTM. Every choice impacts your runway. Run out of cash and the game is over.' },
    { num:'03', title:'Raise Funding', desc:'Build investor leads, pitch your metrics, negotiate valuations. Hire a CFO to unlock institutional rounds and the IPO runway.' },
    { num:'04', title:'Scale to IPO', desc:'File your S-1, run the roadshow, set your IPO price. Will the market subscribe at your valuation — or punish your ambition?' },
  ];

  const screens = [
    { img:sHome,       tag:'Launch', title:'Home & Setup', desc:'Pick your sector & co-founder' },
    { img:sDash,       tag:'Core Loop', title:'Monthly Dashboard', desc:'Decide, execute, advance' },
    { img:sHiring,     tag:'People', title:'Hiring Pipeline', desc:'Find your A-Team' },
    { img:sFinancials, tag:'Finance', title:'Unit Economics', desc:'MRR, burn, runway & P&L' },
    { img:sPitch,      tag:'Funding', title:'Investor Pitch', desc:'High-stakes negotiations' },
    { img:sFunding,    tag:'Cap Table', title:'Funding & Dilution', desc:'Manage your equity stack' },
    { img:sEvent,      tag:'AI Events', title:'Narrative Decisions', desc:'100% AI-generated scenarios' },
    { img:sMarketing,  tag:'Growth', title:'User Acquisition', desc:'GTM & growth strategy' },
    { img:sTeam,       tag:'Culture', title:'Team Management', desc:'Burnout, culture & equity' },
    { img:sProduct,    tag:'Product', title:'Product Development', desc:'Build, iterate, ship' },
    { img:sLifestyle,  tag:'Founder',  title:'Founder Balance', desc:'Health, energy & hustle' },
    { img:sIPO,        tag:'Endgame', title:'IPO & Exit', desc:'Pricing, demand & legacy' },
  ];

  const testimonials = [
    { text:'"The most realistic startup sim I\'ve ever played. The cap table mechanics and IPO pricing system are genuinely educational — I learned how dilution works playing this."', name:'Jordan K.', handle:'2× Founder · YC Alumni' },
    { text:'"Made a bad hire in month 4, burnout spiralled to 80%, then had to handle a VP threatening to quit over RTO. Sam\'s advice saved my company. Chad just laughed."', name:'Priya M.', handle:'Product Manager · Ex-Google' },
    { text:'"$200K seed to $1.6B IPO payout in 63 months. Oversubscribed 2× on IPO day. Unicorn Founder score: 98/100. This game is dangerously addictive."', name:'Alex T.', handle:'Angel Investor' },
  ];

  return (
    <div style={{ minHeight:'100vh' }}>
      <div className="site-bg" />

      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Founder Sim" />
          <span className="nav-wordmark syne">FOUNDER<span>SIM</span></span>
        </Link>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#characters">Meet the Cast</a></li>
          <li><a href="#screens">Screens</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><Link to="/privacy">Privacy</Link></li>
        </ul>

        <div className="nav-actions">
          <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer"
            className="btn btn-brand btn-sm nav-cta">
            Download <ExternalLink size={12} />
          </a>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(7,4,15,0.97)', backdropFilter:'blur(24px)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:40 }}>
            <button onClick={() => setMenuOpen(false)} style={{ position:'absolute', top:28, right:28, background:'none', border:'none', color:'rgba(255,255,255,.6)', cursor:'pointer' }}>
              <X size={28} />
            </button>
            {['Features','Characters','Screens','Contact'].map((l, i) => (
              <motion.a key={l} href={l === 'Characters' ? '#characters' : `#${l.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.08 }}
                style={{ fontFamily:'Inter,sans-serif', fontSize:28, fontWeight:800, color:'#fff', textDecoration:'none' }}>
                {l}
              </motion.a>
            ))}
            <a href="https://apps.apple.com/app/founder-sim/id6738854346" className="btn btn-brand" style={{ marginTop:8 }}>
              Download Free <ArrowRight size={15} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <div style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:120, overflow:'hidden' }}>
        <div style={{ position:'absolute', right:'-8%', top:'5%', width:780, height:780, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="section hero-inner" style={{ display:'flex', alignItems:'center', gap:80, paddingTop:40, paddingBottom:80 }}>
          {/* Left — copy */}
          <motion.div className="hero-left" style={{ flex:'0 0 52%', display:'flex', flexDirection:'column', alignItems:'flex-start' }}
            initial={{ opacity:0, x:-50 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.95, ease:'easeOut' }}>

            <motion.div className="badge-pill" style={{ marginBottom:32 }}
              initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
              <span className="badge-dot" /> 18,402 Active Founders This Week
            </motion.div>

            <motion.h1 className="hero-title" style={{ fontSize:'clamp(52px,6.5vw,94px)', marginBottom:28, color:'#fff' }}
              initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.9 }}>
              FROM ZERO<br />
              <span style={{ color:'rgba(255,255,255,0.13)' }}>TO</span>{' '}
              <span className="glow-purple">IPO.</span>
            </motion.h1>

            <motion.p style={{ fontSize:17, lineHeight:1.8, color:'var(--text-muted)', maxWidth:520, marginBottom:40 }}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
              The most realistic startup simulation. Raise funding from Seed to Series C, build your cap table, navigate AI-powered founder decisions, and take your company public — all on your phone.
            </motion.p>

            <motion.div className="store-row" style={{ marginBottom:56 }}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}>
              <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer" className="store-badge">
                <span style={{ fontSize:24 }}>🍎</span>
                <div>
                  <span className="store-badge-sub">Download on the</span>
                  <span className="store-badge-main">App Store</span>
                </div>
              </a>
              <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="store-badge">
                <span style={{ fontSize:24 }}>🤖</span>
                <div>
                  <span className="store-badge-sub">Get it on</span>
                  <span className="store-badge-main">Google Play</span>
                </div>
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div style={{ display:'flex', alignItems:'center', gap:28, paddingTop:28, borderTop:'1px solid var(--border)', flexWrap:'wrap' }}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}>
              {[
                { val:'$152.4B', lbl:'Peak Valuation' },
                { val:'99/100',  lbl:'Legacy Score' },
                { val:'84M+',    lbl:'Peak Users' },
              ].map(s => (
                <div key={s.lbl}>
                  <div className="syne" style={{ fontSize:22, fontWeight:800, color:'#fff', lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-subtle)', marginTop:5 }}>{s.lbl}</div>
                </div>
              ))}
              <div style={{ display:'flex', gap:3, alignItems:'center' }}>
                {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="var(--amber)" color="var(--amber)" />)}
                <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:6 }}>4.9 Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — phone mockups */}
          <motion.div style={{ flex:1, position:'relative', display:'flex', justifyContent:'center', alignItems:'center', minHeight:580 }}
            initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} transition={{ duration:1.1, delay:0.25, ease:'easeOut' }}>
            {/* Back phone */}
            <div className="float-slow phone-back" style={{ position:'absolute', width:210, right:0, top:30, transform:'rotate(9deg) scale(0.87)', zIndex:1, opacity:0.6 }}>
              <div className="phone"><img src={sFunding} alt="Funding" /></div>
            </div>
            {/* Front phone */}
            <div className="float phone-front" style={{ position:'relative', width:265, zIndex:2 }}>
              <div className="phone"><img src={sIPO} alt="IPO Success Screen" /></div>
              {/* Floating badges */}
              <motion.div initial={{ scale:0, rotate:-18 }} animate={{ scale:1, rotate:-8 }} transition={{ delay:1.1, type:'spring', stiffness:200 }}
                style={{ position:'absolute', top:-18, left:-52, background:'rgba(16,185,129,0.88)', backdropFilter:'blur(20px)',
                  border:'1px solid rgba(16,185,129,0.5)', borderRadius:18, padding:'13px 18px', boxShadow:'0 16px 40px rgba(16,185,129,0.25)', zIndex:10 }}>
                <div className="syne" style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1 }}>$15.2B</div>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', color:'rgba(255,255,255,0.75)', marginTop:4 }}>PERSONAL PAYOUT</div>
              </motion.div>
              <motion.div initial={{ scale:0, rotate:18 }} animate={{ scale:1, rotate:6 }} transition={{ delay:1.3, type:'spring', stiffness:200 }}
                style={{ position:'absolute', bottom:70, right:-58, background:'rgba(124,58,237,0.88)', backdropFilter:'blur(20px)',
                  border:'1px solid rgba(139,92,246,0.5)', borderRadius:16, padding:'12px 18px', boxShadow:'0 16px 40px rgba(124,58,237,0.25)', zIndex:10 }}>
                <div className="syne" style={{ fontSize:13, fontWeight:800, color:'#fff' }}>🦄 UNICORN</div>
                <div style={{ fontSize:9, fontWeight:600, letterSpacing:'0.1em', color:'rgba(255,255,255,0.65)', marginTop:4 }}>SCORE 98/100</div>
              </motion.div>
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:1.5, type:'spring', stiffness:180 }}
                style={{ position:'absolute', top:80, right:-68, background:'rgba(244,63,94,0.8)', backdropFilter:'blur(16px)',
                  border:'1px solid rgba(244,63,94,0.45)', borderRadius:14, padding:'10px 14px', boxShadow:'0 12px 32px rgba(244,63,94,0.2)', zIndex:10 }}>
                <div className="syne" style={{ fontSize:12, fontWeight:800, color:'#fff' }}>🚀 OVERSUBSCRIBED</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.7)', marginTop:2 }}>2× IPO demand</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div style={{ maxWidth:1300, margin:'0 auto', padding:'0 56px', display:'flex', flexWrap:'wrap' }}>
          {[
            { val:'$152.4B', lbl:'Peak Valuation Achieved', col:'var(--brand-light)' },
            { val:'84M+',    lbl:'Peak Users Simulated',    col:'var(--emerald)' },
            { val:'100%',   lbl:'AI Decision Events',      col:'var(--amber)' },
            { val:'Series A→IPO', lbl:'Full Funding Journey', col:'var(--brand-light)' },
            { val:'99/100', lbl:'Max Legacy Score',        col:'var(--rose)' },
          ].map(s => (
            <div key={s.lbl} className="stat-item">
              <div className="stat-val syne" style={{ color:s.col }}>{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <Reveal id="features">
        <motion.div variants={fadeUp} style={{ marginBottom:72 }}>
          <div className="section-eyebrow" style={{ marginBottom:18 }}>Core Mechanics</div>
          <h2 className="section-title" style={{ fontSize:'clamp(34px,4.5vw,60px)', maxWidth:640, marginBottom:20 }}>
            EVERY DECISION.<br /><span className="glow-purple">REAL CONSEQUENCES.</span>
          </h2>
          <p style={{ fontSize:16, color:'var(--text-muted)', maxWidth:540, lineHeight:1.75 }}>
            Built on a simulation engine that mirrors how real startups work — from pitch decks to cap tables to IPO day subscriptions.
          </p>
        </motion.div>
        <motion.div variants={stagger} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(310px,1fr))', gap:16 }}>
          {features.map(f => (
            <motion.div key={f.title} variants={fadeUp} className={`feat-card ${f.c}`}>
              <div className={`feat-icon ${f.c}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="feat-stat">{f.stat}</div>
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── HOW IT WORKS ── */}
      <Reveal id="gameplay">
        <motion.div variants={fadeUp} style={{ marginBottom:72 }}>
          <div className="section-eyebrow" style={{ marginBottom:18 }}>The Journey</div>
          <h2 className="section-title" style={{ fontSize:'clamp(34px,4.5vw,58px)', maxWidth:580, marginBottom:20 }}>
            FROM SEED CAPITAL<br /><span className="glow-amber">TO IPO GLORY</span>
          </h2>
        </motion.div>
        <motion.div variants={stagger} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:16 }}>
          {steps.map(s => (
            <motion.div key={s.num} variants={fadeUp} className="step-card">
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── SAM & CHAD ── */}
      <Reveal id="characters">
        <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:72 }}>
          <div className="section-eyebrow" style={{ marginBottom:18 }}>Meet the Cast</div>
          <h2 className="section-title" style={{ fontSize:'clamp(32px,5vw,64px)', marginBottom:24 }}>
            YOUR MENTOR. <span className="glow-purple">YOUR RIVAL.</span>
          </h2>
          <p style={{ fontSize:17, color:'var(--text-muted)', maxWidth:640, margin:'0 auto', lineHeight:1.8 }}>
            Every startup journey has two voices. One wants you to build a legacy. The other wants you to build a unicorn at any cost.
          </p>
        </motion.div>
        <motion.div variants={stagger} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:32, maxWidth:1000, margin:'0 auto' }}>
          {/* Sam */}
          <motion.div variants={fadeUp} className="feat-card" style={{ padding:0, border:'none', background:'transparent', overflow:'visible' }}>
            <div className="glass" style={{ padding:'36px 32px 32px', height:'100%', borderColor:'rgba(16,185,129,0.15)', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div className="char-chip mentor" style={{ marginBottom:20 }}>✦ Strategic Advisor</div>
              <p className="syne" style={{ fontSize:28, fontWeight:800, color:'#fff', marginBottom:12 }}>Sam</p>
              <div className="char-img-wrap">
                <div className="char-glow mentor" />
                <img src={samImg} alt="Sam — Your Mentor" />
              </div>
              <p className="char-quote" style={{ paddingBottom:28 }}>
                "Runway is oxygen, founder. A dead company builds nothing. Raise before you need it — not when you're desperate."
              </p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginTop:'auto' }}>
                {['Strategic Wisdom','Market Entry','Team Culture'].map(t => (
                  <span key={t} style={{ fontSize:10, fontWeight:700, padding:'6px 14px', borderRadius:999, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'var(--emerald)', letterSpacing:'0.08em' }}>{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
          {/* Chad */}
          <motion.div variants={fadeUp} className="feat-card" style={{ padding:0, border:'none', background:'transparent', overflow:'visible' }}>
            <div className="glass" style={{ padding:'36px 32px 32px', height:'100%', borderColor:'rgba(244,63,94,0.15)', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div className="char-chip rival" style={{ marginBottom:20 }}>⚡ Aggressive Rival</div>
              <p className="syne" style={{ fontSize:28, fontWeight:800, color:'#fff', marginBottom:12 }}>Chad</p>
              <div className="char-img-wrap">
                <div className="char-glow rival" />
                <img src={chadImg} alt="Chad — Your Rival" />
              </div>
              <p className="char-quote" style={{ paddingBottom:28 }}>
                "Bro, you're bootstrapping like it's 2005. Your burn rate is lower than my Starbucks tab. Scale or die, it's that simple."
              </p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginTop:'auto' }}>
                {['Growth Hacks','Ego Pressure','Market Dominance'].map(t => (
                  <span key={t} style={{ fontSize:10, fontWeight:700, padding:'6px 14px', borderRadius:999, background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', color:'var(--rose)', letterSpacing:'0.08em' }}>{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── SCREENSHOTS ── */}
      <Reveal id="screens">
        <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:72 }}>
          <div className="section-eyebrow" style={{ marginBottom:18 }}>In-Game Dashboards</div>
          <h2 className="section-title" style={{ fontSize:'clamp(34px,4.5vw,58px)', marginBottom:16 }}>SEE THE SIMULATION</h2>
          <p style={{ fontSize:16, color:'var(--text-muted)', maxWidth:480, margin:'0 auto' }}>Real mechanics. Real numbers. Real high-stakes decisions.</p>
        </motion.div>
        <motion.div variants={stagger} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
          {screens.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="screen-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', color:'var(--text-subtle)', textTransform:'uppercase' }}>{s.tag}</span>
              </div>
              <p className="syne" style={{ fontSize:13, fontWeight:800, color:'#fff', marginBottom:4 }}>{s.title}</p>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>{s.desc}</p>
              <img src={s.img} alt={s.title} style={{ width:'100%', borderRadius:16, display:'block', aspectRatio:'9/19.5', objectFit:'cover' }} />
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── TESTIMONIALS ── */}
      <Reveal>
        <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:64 }}>
          <div className="section-eyebrow" style={{ marginBottom:18 }}>Founder Reviews</div>
          <h2 className="section-title" style={{ fontSize:'clamp(32px,4vw,54px)' }}>
            WHAT FOUNDERS<br /><span className="glow-purple">ARE SAYING</span>
          </h2>
        </motion.div>
        <motion.div variants={stagger} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
          {testimonials.map(t => (
            <motion.div key={t.name} variants={fadeUp} className="quote-card">
              <div style={{ display:'flex', gap:3, marginBottom:18 }}>
                {[...Array(5)].map((_,i) => <Star key={i} size={13} fill="var(--amber)" color="var(--amber)" />)}
              </div>
              <p className="quote-text">{t.text}</p>
              <div className="quote-author">
                <div className="quote-avatar">{t.name[0]}</div>
                <div>
                  <div className="quote-name">{t.name}</div>
                  <div className="quote-handle">{t.handle}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── CONTACT ── */}
      <Reveal id="contact">
        <motion.div variants={fadeUp} style={{ textAlign:'center', marginBottom:72 }}>
          <div className="section-eyebrow" style={{ marginBottom:18 }}>Get in Touch</div>
          <h2 className="section-title" style={{ fontSize:'clamp(34px,4.5vw,58px)', marginBottom:20 }}>
            QUESTIONS?<br /><span className="glow-purple">PITCH US.</span>
          </h2>
          <p style={{ fontSize:16, color:'var(--text-muted)', maxWidth:440, margin:'0 auto' }}>
            Feedback, partnerships, or support — our team responds within 24–48 hours.
          </p>
        </motion.div>
        <div style={{ maxWidth:780, margin:'0 auto' }}>
          <motion.div variants={fadeUp} className="glass" style={{ padding:'48px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'40%', height:'70%', background:'radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 70%)', pointerEvents:'none' }} />
            <form action="https://formspree.io/f/xaqljavr" method="POST">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, marginBottom:20 }}>
                <div>
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" required placeholder="Steve Jobs" className="form-input" />
                </div>
                <div>
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" required placeholder="steve@apple.com" className="form-input" />
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label className="form-label" htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="_subject" required placeholder="Game Feedback / Support / Partnership" className="form-input" />
              </div>
              <div style={{ marginBottom:28 }}>
                <label className="form-label" htmlFor="message">Message</label>
                <textarea id="message" name="message" required placeholder="Your message..." className="form-input" />
              </div>
              <input type="hidden" name="_next" value={typeof window !== 'undefined' ? window.location.href : ''} />
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                type="submit" className="btn btn-brand" style={{ width:'100%', justifyContent:'center', padding:'18px' }}>
                Send Message <Mail size={15} />
              </motion.button>
            </form>
          </motion.div>
          <motion.div variants={fadeIn} style={{ display:'flex', justifyContent:'center', gap:40, marginTop:32, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text-muted)', fontSize:13 }}>
              <MessageSquare size={15} style={{ color:'var(--brand-light)' }} /> foundersim.game@gmail.com
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text-muted)', fontSize:13 }}>
              <ShieldCheck size={15} style={{ color:'var(--emerald)' }} /> Encrypted & Private
            </div>
          </motion.div>
        </div>
      </Reveal>

      {/* ── CTA STRIP ── */}
      <div className="cta-strip">
        <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.8 }} style={{ position:'relative', zIndex:1 }}>
          <div className="section-eyebrow" style={{ marginBottom:24 }}>Available Now · Free</div>
          <h2 className="section-title" style={{ fontSize:'clamp(38px,5.5vw,76px)', marginBottom:20 }}>
            YOUR LEGACY<br /><span className="glow-purple">AWAITS.</span>
          </h2>
          <p style={{ fontSize:17, color:'var(--text-muted)', maxWidth:460, margin:'0 auto 48px' }}>
            Free to play. No subscriptions. Strategic decisions, real economics, and your path to the $1.6B payout.
          </p>
          <div className="store-row" style={{ justifyContent:'center' }}>
            <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer" className="store-badge">
              <span style={{ fontSize:26 }}>🍎</span>
              <div><span className="store-badge-sub">Download on the</span><span className="store-badge-main">App Store</span></div>
            </a>
            <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="store-badge">
              <span style={{ fontSize:26 }}>🤖</span>
              <div><span className="store-badge-sub">Get it on</span><span className="store-badge-main">Google Play</span></div>
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <div className="footer">
        <div className="footer-inner" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:60, flexWrap:'wrap', marginBottom:56 }}>
          <div style={{ flex:'0 0 340px' }}>
            <Link to="/" className="nav-logo" style={{ display:'inline-flex', marginBottom:20 }}>
              <img src={logo} alt="Founder Sim" style={{ width:36, height:36, borderRadius:9 }} />
              <span className="nav-wordmark syne" style={{ marginLeft:12 }}>FOUNDER<span>SIM</span></span>
            </Link>
            <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.8, maxWidth:320 }}>
              The most realistic startup simulation. Raise funding, build your team, navigate AI-powered decisions, and take your company from zero to IPO.
            </p>
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)', textDecoration:'none', padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', transition:'all .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                🍎 App Store
              </a>
              <a href="https://play.google.com/store" target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-muted)', textDecoration:'none', padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', transition:'all .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                🤖 Google Play
              </a>
            </div>
          </div>
          <div style={{ display:'flex', gap:72, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.28em', color:'var(--text-subtle)', textTransform:'uppercase', marginBottom:20 }}>Product</div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {(['Features','Gameplay','Screens'] as const).map(l => (
                  <a key={l} href={`#${l === 'Screens' ? 'screens' : l.toLowerCase()}`}
                    style={{ fontSize:14, color:'var(--text-muted)', textDecoration:'none', transition:'color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.28em', color:'var(--text-subtle)', textTransform:'uppercase', marginBottom:20 }}>Legal</div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <Link to="/privacy" style={{ fontSize:14, color:'var(--text-muted)', textDecoration:'none' }}>Privacy Policy</Link>
                <a href="#contact" style={{ fontSize:14, color:'var(--text-muted)', textDecoration:'none' }}>Contact</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <p style={{ fontSize:12, color:'var(--text-subtle)' }}>© 2026 Founder Sim Studio. All rights reserved.</p>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:999, background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.14)' }}>
            <ShieldCheck size={13} color="var(--emerald)" />
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>App Store Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── APP ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}
