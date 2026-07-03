import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight, Star, X,
  ExternalLink, ChevronRight, Mail, MessageSquare, ShieldCheck, Instagram, Sparkles, Zap, Trophy, TrendingUp
} from 'lucide-react';

// ── ASSETS ────────────────────────────────────────────────────────────
const logo = '/assets/app-logo.png';
const samImg = '/assets/sam_mentor.png';
const chadImg = '/assets/chad_rival.png';

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
    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--brand-light)', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 48 }}>
      <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Home
    </Link>
    <h1 className="section-title" style={{ fontSize: 44, marginBottom: 8 }}>Privacy Policy</h1>
    <p style={{ color: 'var(--text-subtle)', fontSize: 12, letterSpacing: '0.2em', marginBottom: 56, textTransform: 'uppercase' }}>Last updated: March 14, 2026</p>
    {[
      { num: '01', title: 'Data Collection & Safety', body: 'We collect gameplay telemetry, session data, and device identifiers to power personalized experiences. We disclose that we collect: (1) Device or other IDs (such as Google Advertising ID) for advertising and analytics; (2) Performance data and crash logs for technical stability; (3) Gameplay activity to improve game balance.' },
      { num: '02', title: 'Advertising ID Usage', body: 'Founder Sim uses the Google Advertising ID (AAID) for providing personalized advertisements and performing internal analytics. This identifier is user-resettable. We do not link the Advertising ID to personally identifiable information without your explicit consent.' },
      { num: '03', title: 'User Control & Rights', body: 'You have full control over your data. You can reset or delete your Advertising ID at any time through your device settings. If you opt out of interest-based advertising, the Advertising ID will be returned as zeros. Contact our support team to request deletion of gameplay data.' },
      { num: '04', title: 'Third-Party Services', body: 'We integrate: (1) Google Play Services for game functionality; (2) Google AdMob for non-intrusive advertisements; (3) Firebase for crash reporting and technical analytics. Each service operates under Google\'s privacy protocols.' },
      { num: '05', title: 'Data Retention & Contact', body: 'We retain telemetry data only as long as necessary to provide game services. For privacy inquiries, contact foundersim.game@gmail.com. We respond to all verified requests within 48 hours.' },
    ].map(s => (
      <div key={s.num} className="glass" style={{ padding: '32px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(124,58,237,0.6)', letterSpacing: '0.3em', marginBottom: 12 }}>{s.num}</div>
        <h2 className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: '#fff' }}>{s.title}</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 14 }}>{s.body}</p>
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
    { c: 'c-purple', icon: '🏛️', title: 'Full IPO & Acquisition Path', desc: 'File your S-1, set your valuation multiple, run roadshows, and watch the market react. Go public or get acquired — every path to exit is simulated in full detail.', stat: 'Up to 2× oversubscription demand' },
    { c: 'c-emerald', icon: '📊', title: 'Live Cap Table & Dilution', desc: 'Navigate Seed, Series A/B/C rounds with real dilution mechanics. Existing investors keep their stake — only your founder equity gets diluted, just like the real world.', stat: 'Founder-accurate dilution model' },
    { c: 'c-amber', icon: '🧠', title: 'AI-Powered Decisions', desc: '100% AI-generated founder dilemmas — RTO debate, toxic hire, activist short-seller, viral scandal. Sam and Chad guide (or antagonize) every call you make.', stat: 'Infinite unique scenarios' },
    { c: 'c-purple', icon: '👥', title: 'Build Your Dream Team', desc: 'Hire engineers, marketers, sales leads, and CXOs. Manage burnout, culture fit, and equity pools as you scale from 1 to 40+ people across departments.', stat: 'CFO mandatory for IPO filing' },
    { c: 'c-emerald', icon: '💰', title: 'Fundraising Simulator', desc: 'Generate investor leads, negotiate term sheets, and close rounds under pressure. Hire a Fundraising Consultant or activate CFO roadshows for institutional capital.', stat: 'Full 6-stage funding journey' },
    { c: 'c-rose', icon: '🚀', title: 'Growth Strategy Engine', desc: 'GTM, viral loops, paid acquisition, or enterprise B2B — pick your growth playbook. Every strategy has unit economics consequences you\'ll feel months down the line.', stat: '84M+ peak users simulated' },
    { c: 'c-amber', icon: '⚔️', title: 'Competitor Intelligence', desc: 'Watch rival startups grow, hire, and fundraise in real-time. Launch market attacks, undercut pricing, or poach their talent before they poach yours.', stat: 'Dynamic AI competitor engine' },
    { c: 'c-rose', icon: '🏦', title: 'Advanced Corporate Finance', desc: 'Trade stocks, issue venture debt, execute share buybacks, set up subsidiary companies, and even lobby regulators. True CFO-level mechanics in your pocket.', stat: 'Executive stock options & margin loans' },
    { c: 'c-purple', icon: '📈', title: 'Real Unit Economics', desc: 'MRR, ARR, burn rate, CAC, LTV, churn — every metric matters. Every hire, campaign, and product decision flows through your P&L and runway in real time.', stat: '15+ financial metrics tracked' },
  ];

  const v2Features = [
    { icon: '🏆', label: 'Global Leaderboards', desc: 'Compete against founders worldwide to claim the top spot' },
    { icon: '🎬', label: 'Story Mode', desc: 'Vote on upcoming cinematic campaigns of iconic founders' },
    { icon: '🧠', label: 'Founder Burnout', desc: 'Balance your mental health or face severe attribute penalties' },
    { icon: '🤝', label: 'True Team Morale', desc: 'Morale is a real-time reflection of your active team' },
    { icon: '🧙‍♂️', label: 'On-Demand Mentor', desc: 'Sam is always a tap away on your dashboard' },
    { icon: '✨', label: 'Strategic Actions', desc: 'Bribe senators, run viral TikTok campaigns, and poach 10x talent' },
    { icon: '🦈', label: 'M&A Acquisitions', desc: 'Acquire rival companies and integrate them as subsidiaries' },
    { icon: '📉', label: 'Executive Stock Options', desc: 'Grant yourself options and use margin loans against your equity' },
    { icon: '💳', label: 'Margin Loans', desc: 'Borrow against your founder equity for personal leverage' },
    { icon: '💸', label: 'Share Buybacks', desc: 'Deploy treasury cash to boost your stock price' },
    { icon: '🎙️', label: 'Earnings Calls', desc: 'Present quarterly results to Wall Street analysts' },
    { icon: '⚖️', label: 'Crisis Engine', desc: 'Navigate lawsuits, scandals, and regulatory crackdowns' },
  ];

  const steps = [
    { num: '01', emoji: '🎯', title: 'Pick Your Vertical', desc: 'Choose from 8+ startup sectors — FinTech, BioTech, AI, SaaS, E-Commerce, HealthTech. Each has unique market dynamics and competitive pressures.' },
    { num: '02', emoji: '🔥', title: 'Manage Cash & Burn', desc: 'Make monthly decisions on hiring, product, and GTM. Every choice impacts your runway. Run out of cash and the game is over.' },
    { num: '03', emoji: '💼', title: 'Raise Funding', desc: 'Build investor leads, pitch your metrics, negotiate valuations. Hire a CFO to unlock institutional rounds and the IPO runway.' },
    { num: '04', emoji: '🏛️', title: 'Scale to IPO or Exit', desc: 'File your S-1, run the roadshow, set your IPO price. Or accept an acquisition offer. Your legacy score awaits.' },
  ];

  const testimonials = [
    { text: '"The most realistic startup sim I\'ve ever played. The cap table mechanics and IPO pricing system are genuinely educational — I learned how dilution works playing this."', name: 'Jordan K.', handle: '2× Founder · YC Alumni' },
    { text: '"Made a bad hire in month 4, burnout spiralled to 80%, then had to handle a VP threatening to quit over RTO. Sam\'s advice saved my company. Chad just laughed."', name: 'Priya M.', handle: 'Product Manager · Ex-Google' },
    { text: '"$200K seed to $1.6B IPO payout in 63 months. Oversubscribed 2× on IPO day. Unicorn Founder score: 98/100. This game is dangerously addictive."', name: 'Alex T.', handle: 'Angel Investor' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="site-bg" />

      {/* ── V2 ANNOUNCEMENT BANNER ── */}
      <div className="v2-banner">
        <Sparkles size={13} style={{ color: 'var(--amber)' }} />
        <span className="v2-banner-text">🎉 VERSION 2.1.0 — LEADERBOARDS & STORY MODE — IS NOW LIVE</span>
        <span className="v2-banner-sub">Compete globally, manage burnout, and vote on upcoming cinematic campaigns</span>
        <a href="#v2" className="v2-banner-cta">See What's New <ArrowRight size={11} /></a>
      </div>

      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} style={{ marginTop: 40 }}>
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Founder Sim" />
          <span className="nav-wordmark syne">FOUNDER<span>SIM</span></span>
        </Link>

        <ul className="nav-links">
          <li><a href="#v2">V2 Update</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#characters">Meet the Cast</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><Link to="/privacy">Privacy</Link></li>
        </ul>

        <div className="nav-actions">
          <a href="https://instagram.com/foundersim" target="_blank" rel="noreferrer"
            className="nav-instagram" aria-label="Follow on Instagram">
            <Instagram size={16} />
          </a>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(7,4,15,0.97)', backdropFilter: 'blur(24px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40
            }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 28, right: 28, background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            {['V2 Update', 'Features', 'Characters', 'Contact'].map((l, i) => (
              <motion.a key={l} href={l === 'Characters' ? '#characters' : l === 'V2 Update' ? '#v2' : `#${l.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ fontFamily: 'Inter,sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
                {l}
              </motion.a>
            ))}
            <a href="https://instagram.com/foundersim" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,100,150,0.9)', textDecoration: 'none', fontWeight: 700 }}>
              <Instagram size={18} /> @foundersim
            </a>
            <a href="https://apps.apple.com/app/founder-sim/id6738854346" className="btn btn-brand" style={{ marginTop: 8 }}>
              Download Free <ArrowRight size={15} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 160, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', right: '-8%', top: '5%', width: 780, height: 780, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', left: '-5%', bottom: '10%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none'
        }} />

        <div className="section hero-inner" style={{ display: 'flex', alignItems: 'center', gap: 80, paddingTop: 40, paddingBottom: 80 }}>
          {/* Left — copy */}
          <motion.div className="hero-left" style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.95, ease: 'easeOut' }}>

            <motion.div className="badge-pill" style={{ marginBottom: 32 }}
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span className="badge-dot" /> 10,200 Active Founders This Week
            </motion.div>

            <motion.h1 className="hero-title" style={{ fontSize: 'clamp(44px,5.5vw,82px)', marginBottom: 28, color: '#fff' }}
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.9 }}>
              THE STARTUP SIM<br />
              <span className="glow-purple">THAT DOESN'T LIE.</span>
            </motion.h1>

            <motion.p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--text-muted)', maxWidth: 520, marginBottom: 40 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              The most realistic startup simulation on mobile. Raise funding from Seed to Series C, build your cap table, navigate AI-powered founder dilemmas — and take your company all the way to a billion-dollar exit.
            </motion.p>

            <motion.div className="store-row" style={{ marginBottom: 56 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer" className="store-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43Zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-1.089-.058-2.254.969-2.741.969-.487 0-1.432-.979-2.261-.979-1.254 0-2.584.87-3.411 2.155-1.674 2.582-1.272 5.617.387 8.01 1.01 1.464 2.285 3.12 3.86 3.064 1.575-.058 2.059-.971 3.86-.971 1.8 0 2.285.971 3.86.971 1.575 0 2.85-1.59 3.86-3.053.847-1.226 1.14-2.428 1.14-2.428s-1.89-1.745-1.89-3.84c0-2.095 1.705-2.99 1.705-2.99Z" />
                </svg>
                <div>
                  <span className="store-badge-sub">Download on the</span>
                  <span className="store-badge-main">App Store</span>
                </div>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.foundersim.app&pli=1" target="_blank" rel="noreferrer" className="store-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14.316 7.332 2.628 1.139C2.086.85 1.401 1.252 1.401 1.87v12.261c0 .618.685 1.02 1.227.73l11.688-6.192c.563-.298.563-1.135 0-1.433v-.004Z" />
                </svg>
                <div>
                  <span className="store-badge-sub">Get it on</span>
                  <span className="store-badge-main">Google Play</span>
                </div>
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div style={{ display: 'flex', alignItems: 'center', gap: 28, paddingTop: 28, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              {[
                { val: '$152.4B', lbl: 'Peak Valuation' },
                { val: '99/100', lbl: 'Legacy Score' },
                { val: '84M+', lbl: 'Peak Users' },
              ].map(s => (
                <div key={s.lbl}>
                  <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginTop: 5 }}>{s.lbl}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--amber)" color="var(--amber)" />)}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>4.9 Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Sam & Chad side by side */}
          <motion.div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 340 }}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}>

            {/* Sam Card */}
            <div className="float-slow hero-char-card mentor-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
              <img src={samImg} alt="Sam" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 16, flexShrink: 0, border: '2px solid rgba(16,185,129,0.3)' }} />
              <div>
                <div className="char-chip mentor" style={{ marginBottom: 6, fontSize: 9 }}>✦ Strategic Advisor</div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Sam</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>"Runway is oxygen, founder. Raise before you need it."</p>
              </div>
            </div>

            {/* Chad Card */}
            <div className="float hero-char-card rival-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
              <img src={chadImg} alt="Chad" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 16, flexShrink: 0, border: '2px solid rgba(244,63,94,0.3)' }} />
              <div>
                <div className="char-chip rival" style={{ marginBottom: 6, fontSize: 9 }}>⚡ Aggressive Rival</div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Chad</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>"Scale or die. Your burn rate is a joke."</p>
              </div>
            </div>

            {/* Key stat badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              {[
                { emoji: '🦄', val: '$1.52T', lbl: 'Best Exit' },
                { emoji: '🚀', val: '10× OVR', lbl: 'IPO Demand' },
                { emoji: '📈', val: '1.4B+', lbl: 'Peak Users' },
                { emoji: '⭐', val: '99/100', lbl: 'Legacy Score' },
              ].map(b => (
                <div key={b.lbl} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{b.emoji}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{b.val}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 3 }}>{b.lbl}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>



      {/* ── V2.1 ANNOUNCEMENT SECTION ── */}
      <Reveal id="v2">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="v2-release-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <Zap size={16} style={{ color: 'var(--amber)' }} />
            <span>VERSION 2.1.0 — LEADERBOARDS & STORY MODE</span>
            <Zap size={16} style={{ color: 'var(--amber)' }} />
          </div>
          <h2 className="section-title" style={{ fontSize: 'clamp(34px,4.5vw,64px)', marginBottom: 20 }}>
            THE BIGGEST UPDATE<br /><span className="glow-amber">IN FOUNDER SIM HISTORY</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto', lineHeight: 1.8 }}>
            V2.1 transforms Founder Sim from a funding simulator into a massive global competition.
            Compete on the leaderboards, vote for upcoming cinematic stories, and manage your stress.
            The empire era has begun.
          </p>
        </motion.div>
        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {v2Features.map(f => (
            <motion.div key={f.label} variants={fadeUp} className="v2-feat-card">
              <span className="v2-feat-icon">{f.icon}</span>
              <div>
                <p className="v2-feat-label">{f.label}</p>
                <p className="v2-feat-desc">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: 56 }}>
          <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer"
            className="btn btn-brand" style={{ fontSize: 13 }}>
            Play V2.1.0 Free <ArrowRight size={14} />
          </a>
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── SAM & CHAD ── */}
      <Reveal id="characters">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="section-eyebrow" style={{ marginBottom: 18 }}>Meet the Cast</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(32px,5vw,64px)', marginBottom: 24 }}>
            YOUR MENTOR. <span className="glow-purple">YOUR RIVAL.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto', lineHeight: 1.8 }}>
            Every startup journey has two voices. One wants you to build a sustainable legacy.
            The other wants you to burn bright and scale at any cost. Who will you listen to?
          </p>
        </motion.div>
        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 32, maxWidth: 1000, margin: '0 auto' }}>
          {/* Sam */}
          <motion.div variants={fadeUp}>
            <div className="glass char-full-card mentor-border">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', border: '2px solid rgba(16,185,129,0.3)', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
                    <img src={samImg} alt="Sam" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--emerald)', borderRadius: 999, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
                </div>
                <div>
                  <div className="char-chip mentor" style={{ marginBottom: 6 }}>Strategic Advisor</div>
                  <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Sam</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your Mentor · Ex-Operator</p>
                </div>
              </div>
              <p className="char-quote" style={{ textAlign: 'left', padding: 0, marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
                "Runway is oxygen, founder. A dead company builds nothing. Raise before you need it — not when you're desperate."
              </p>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🧠', text: 'Gives strategic wisdom on every major decision' },
                  { icon: '📊', text: 'Warns you before you over-hire or over-spend' },
                  { icon: '🤝', text: 'Coaches you through board conflicts and investor pressure' },
                  { icon: '🌱', text: 'Keeps your culture and founder wellbeing in check' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          {/* Chad */}
          <motion.div variants={fadeUp}>
            <div className="glass char-full-card rival-border">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', border: '2px solid rgba(244,63,94,0.3)', boxShadow: '0 0 30px rgba(244,63,94,0.2)' }}>
                    <img src={chadImg} alt="Chad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--rose)', borderRadius: 999, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
                </div>
                <div>
                  <div className="char-chip rival" style={{ marginBottom: 6 }}>Aggressive Rival</div>
                  <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Chad</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your Rival · Growth-at-all-costs</p>
                </div>
              </div>
              <p className="char-quote" style={{ textAlign: 'left', padding: 0, marginBottom: 24, fontSize: 16, lineHeight: 1.7 }}>
                "Bro, you're bootstrapping like it's 2005. Your burn rate is lower than my Starbucks tab. Scale or die — it's that simple."
              </p>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🚀', text: 'Pushes you to raise bigger and spend faster' },
                  { icon: '📈', text: 'Taunts you when your growth metrics lag behind' },
                  { icon: '⚔️', text: 'Competes directly — acquires your target markets' },
                  { icon: '😈', text: 'Makes you question every safe, conservative move' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── FEATURES ── */}
      <Reveal id="features">
        <motion.div variants={fadeUp} style={{ marginBottom: 72 }}>
          <div className="section-eyebrow" style={{ marginBottom: 18 }}>Core Mechanics</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(34px,4.5vw,60px)', maxWidth: 640, marginBottom: 20 }}>
            EVERY DECISION.<br /><span className="glow-purple">REAL CONSEQUENCES.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 540, lineHeight: 1.75 }}>
            Built on a simulation engine that mirrors how real startups work — from pitch decks to cap tables to IPO day subscriptions. No hand-holding.
          </p>
        </motion.div>
        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px,1fr))', gap: 16 }}>
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
        <motion.div variants={fadeUp} style={{ marginBottom: 72 }}>
          <div className="section-eyebrow" style={{ marginBottom: 18 }}>The Journey</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(34px,4.5vw,58px)', maxWidth: 580, marginBottom: 20 }}>
            FROM SEED CAPITAL<br /><span className="glow-amber">TO IPO GLORY</span>
          </h2>
        </motion.div>
        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
          {steps.map(s => (
            <motion.div key={s.num} variants={fadeUp} className="step-card">
              <div style={{ fontSize: 40, marginBottom: 12 }}>{s.emoji}</div>
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      <div className="divider" />

      {/* ── TESTIMONIALS ── */}
      <Reveal>
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-eyebrow" style={{ marginBottom: 18 }}>Founder Reviews</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(32px,4vw,54px)' }}>
            WHAT FOUNDERS<br /><span className="glow-purple">ARE SAYING</span>
          </h2>
        </motion.div>
        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
          {testimonials.map(t => (
            <motion.div key={t.name} variants={fadeUp} className="quote-card">
              <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="var(--amber)" color="var(--amber)" />)}
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
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="section-eyebrow" style={{ marginBottom: 18 }}>Get in Touch</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(34px,4.5vw,58px)', marginBottom: 20 }}>
            QUESTIONS?<br /><span className="glow-purple">PITCH US.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto' }}>
            Feedback, partnerships, or support — our team at SMISH Ventures responds within 24–48 hours.
          </p>
        </motion.div>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <motion.div variants={fadeUp} className="glass" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '40%', height: '70%', background: 'radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <form action="https://formspree.io/f/xaqljavr" method="POST">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, marginBottom: 20 }}>
                <div>
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" required placeholder="Steve Jobs" className="form-input" />
                </div>
                <div>
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" required placeholder="steve@apple.com" className="form-input" />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="_subject" required placeholder="Game Feedback / Support / Partnership" className="form-input" />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label className="form-label" htmlFor="message">Message</label>
                <textarea id="message" name="message" required placeholder="Your message..." className="form-input" />
              </div>
              <input type="hidden" name="_next" value={typeof window !== 'undefined' ? window.location.href : ''} />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                type="submit" className="btn btn-brand" style={{ width: '100%', justifyContent: 'center', padding: '18px' }}>
                Send Message <Mail size={15} />
              </motion.button>
            </form>
          </motion.div>
          <motion.div variants={fadeIn} style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 32, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
              <MessageSquare size={15} style={{ color: 'var(--brand-light)' }} /> foundersim.game@gmail.com
            </div>
            <a href="https://instagram.com/foundersim" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,100,150,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              <Instagram size={15} style={{ color: 'rgba(255,100,150,0.7)' }} /> @foundersim
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
              <ShieldCheck size={15} style={{ color: 'var(--emerald)' }} /> Encrypted & Private
            </div>
          </motion.div>
        </div>
      </Reveal>

      {/* ── CTA STRIP ── */}
      <div className="cta-strip">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-eyebrow" style={{ marginBottom: 24 }}>Available Now · Free</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(38px,5.5vw,76px)', marginBottom: 20 }}>
            YOUR LEGACY<br /><span className="glow-purple">AWAITS.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 48px' }}>
            Free to play. No subscriptions. Strategic decisions, real economics, and your path to the $1.6B payout.
          </p>
          <div className="store-row" style={{ justifyContent: 'center' }}>
            <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer" className="store-badge">
              <span style={{ fontSize: 26 }}>🍎</span>
              <div><span className="store-badge-sub">Download on the</span><span className="store-badge-main">App Store</span></div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.foundersim.app&pli=1" target="_blank" rel="noreferrer" className="store-badge">
              <span style={{ fontSize: 26 }}>🤖</span>
              <div><span className="store-badge-sub">Get it on</span><span className="store-badge-main">Google Play</span></div>
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <div className="footer">
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 60, flexWrap: 'wrap', marginBottom: 56 }}>
          <div style={{ flex: '0 0 340px' }}>
            <Link to="/" className="nav-logo" style={{ display: 'inline-flex', marginBottom: 20 }}>
              <img src={logo} alt="Founder Sim" style={{ width: 36, height: 36, borderRadius: 9 }} />
              <span className="nav-wordmark syne" style={{ marginLeft: 12 }}>FOUNDER<span>SIM</span></span>
            </Link>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 320 }}>
              The most realistic startup simulation. Raise funding, build your team, navigate AI-powered decisions, and take your company from zero to IPO.
            </p>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)', width: 'fit-content' }}>
              <Trophy size={14} style={{ color: 'var(--brand-light)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>By SMISH Ventures</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <a href="https://apps.apple.com/app/founder-sim/id6738854346" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                🍎 App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.foundersim.app&pli=1" target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                🤖 Google Play
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 72, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 20 }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(['Features', 'V2 Update', 'Gameplay'] as const).map(l => (
                  <a key={l} href={l === 'V2 Update' ? '#v2' : `#${l.toLowerCase()}`}
                    style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 20 }}>Connect</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href="https://instagram.com/foundersim" target="_blank" rel="noreferrer"
                  style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,100,150,0.9)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  <Instagram size={13} /> Instagram
                </a>
                <a href="#contact" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Contact</a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 20 }}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Link to="/privacy" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>© 2026 SMISH Ventures. All rights reserved.</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>Founder Sim is developed and published by SMISH Ventures.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 999, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.14)' }}>
              <ShieldCheck size={13} color="var(--emerald)" />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>App Store Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 999, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.14)' }}>
              <TrendingUp size={13} color="var(--amber)" />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>V2.0.0 Live Now</span>
            </div>
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
