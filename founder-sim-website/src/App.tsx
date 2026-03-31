import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Zap, ArrowRight, Star, DollarSign,
  Award, ShieldCheck, X, ExternalLink, ChevronRight,
  Building2, Rocket, BarChart3, Lightbulb, Target,
  Mail, MessageSquare
} from 'lucide-react';
import screenIpo from './assets/screen-ipo.png';

// New High-Fidelity Screens from public/assets
const screenHome = '/assets/Main Home Screen.png';
const screenProduct = '/assets/Product Screen.png';
const screenHiring = '/assets/Hiring Screen.png';
const screenDashboard = '/assets/New Dashboard Screen.png';
const screenMarketing = '/assets/Markeitng Screen.png';
const screenEvent = '/assets/Event Screen.png';
const screenTeam = '/assets/Team Managee.png';
const screenLifestyle = '/assets/Founder Lifestyle Screen.png';
const screenFinancialsNew = '/assets/Financials Screen.png';
const screenPitch = '/assets/Investor Pitch Screen.png';
const screenFundingNew = '/assets/Funding Screen.png';
const screenIpoNew = screenIpo; // User requested src/assets/screen-ipo.png

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};

// ─── SECTION WRAPPER ──────────────────────────────────────────────────
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}
function Section({ children, className = '', id }: SectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={`section ${className}`}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={stagger}
    >
      {children}
    </motion.section>
  );
}

// ─── PRIVACY POLICY ───────────────────────────────────────────────────
const PrivacyPolicy = () => (
  <div style={{ padding: '160px 0 80px', maxWidth: 800, margin: '0 auto', paddingLeft: 40, paddingRight: 40 }}>
    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(139,92,246,0.9)', textDecoration: 'none', fontFamily: 'Orbitron, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 48 }}>
      <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> BACK TO BASE
    </Link>
    <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 40, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>Privacy Policy</h1>
    <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Orbitron, sans-serif', fontSize: 10, letterSpacing: '0.3em', marginBottom: 60 }}>SYSTEM DATE: MARCH 14, 2026</p>

    {[
      { num: '01', title: 'Data Collection & Safety', body: 'We collect gameplay telemetry, session data, and device identifiers to power personalized experiences. As part of our commitment to Data Safety, we disclose that we collect: (1) Device or other IDs (such as Google Advertising ID) for advertising and analytics; (2) Performance data and crash logs for technical stability; (3) Gameplay activity to improve game balance.' },
      { num: '02', title: 'Advertising ID Usage', body: 'Founder Sim uses the Google Advertising ID (AAID) for the sole purposes of providing personalized advertisements and performing internal analytics. This identifier is user-resettable and user-deletable. We do not link the Advertising ID to personally identifiable information or persistent device identifiers (like IMEI) without your explicit consent.' },
      { num: '03', title: 'User Control & Rights', body: 'You have full control over your data. You can reset or delete your Advertising ID at any time through your Android device settings (Settings > Google > Ads). If you opt out of interest-based advertising, the Advertising ID will be returned as a string of zeros and will not be used for profiling. To request deletion of gameplay data associated with your device, please contact our support team.' },
      { num: '04', title: 'Third-Party Services', body: 'We integrate industry-standard services to provide a high-quality experience: (1) Google Play Services for game functionality; (2) Google AdMob for delivering non-intrusive advertisements; (3) Firebase for crash reporting and technical analytics. Each service operates under Google\'s privacy protocols, which we strongly recommend reviewing.' },
      { num: '05', title: 'Data Retention & Contact', body: 'We retain telemetry data only as long as necessary to provide game services and comply with legal obligations. For any privacy inquiries or to exercise your data rights, contact our compliance team at foundersim.game@gmail.com. We respond to all verified requests within 48 hours.' },
    ].map((s) => (
      <div key={s.num} style={{ marginBottom: 32, padding: '32px', borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(139,92,246,0.7)', letterSpacing: '0.3em', marginBottom: 14 }}>{s.num}</div>
        <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, color: '#fff' }}>{s.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontSize: 15 }}>{s.body}</p>
      </div>
    ))}
  </div>
);

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      color: 'purple', icon: <DollarSign size={26} color="var(--purple-light)" />,
      title: 'Cap Table & Funding',
      desc: 'Navigate Seed, Series A/B rounds. Manage dilution, negotiate term sheets, and choose between acquisition offers worth billions.',
      stat: '$15.4B acquisition offers in-game'
    },
    {
      color: 'green', icon: <BarChart3 size={26} color="var(--green)" />,
      title: 'Real Unit Economics',
      desc: 'Track MRR, Gross Margin, CAC, and LTV:CAC ratio in real time. Every number matters — build profitability or chase hypergrowth.',
      stat: '67% gross margin simulated'
    },
    {
      color: 'orange', icon: <Lightbulb size={26} color="var(--orange)" />,
      title: 'Founder Decisions',
      desc: 'Return to Office? Hire a CMO? Accept the acquisition? 100% AI-powered events test your leadership with personalized, realistic scenarios.',
      stat: '100% AI-powered events'
    },
    {
      color: 'purple', icon: <Award size={26} color="var(--purple-light)" />,
      title: 'Legacy Score & IPO',
      desc: 'Achieve Unicorn Founder status. Go public at a $4.3B peak valuation and secure a $1.6B personal payout after dilution.',
      stat: 'Up to $1.6B personal payout'
    },
    {
      color: 'green', icon: <Target size={26} color="var(--green)" />,
      title: 'Team & Culture',
      desc: 'Hire and manage a team of 40. Balance burnout, culture, remote-vs-office politics, and equity pools to keep your team happy.',
      stat: '40-person team simulated'
    },
    {
      color: 'orange', icon: <Rocket size={26} color="var(--orange)" />,
      title: 'Growth Strategy',
      desc: 'Choose your GTM strategy: virality or paid, consumer or enterprise. Scale to 737K users or go profitable at $35M MRR.',
      stat: '721K+ peak users achieved'
    },
  ];

  const steps = [
    { num: '01', title: 'Pick Your Vertical', desc: 'Choose from 8+ startup sectors like FinTech, BioTech, or AI. Each comes with unique market multipliers.' },
    { num: '02', title: 'Manage Cash & Burn', desc: 'Navigate monthly decisions that impact metrics. Balance product development with fundraising.' },
    { num: '03', title: 'Hire Your A-Team', desc: 'Recruit engineers and sales. Manage team burnout and equity pools as you scale from 1 to 40 people.' },
    { num: '04', title: 'Scale to IPO', desc: 'Hit critical revenue and product milestones. Negotiate acquisitions or file for IPO to secure your legacy.' },
  ];

  const testimonials = [
    { text: '"The most realistic startup experience I\'ve ever played. The cap table mechanics and acquisition negotiation are genuinely educational."', name: 'Jordan K.', handle: '2x Founder · YC Alumni' },
    { text: '"I made a bad hire in month 4 and watched burnout spiral to 80%. Then I had to handle a VP threatening to quit over RTO. Peak anxiety."', name: 'Priya M.', handle: 'Product Manager · Ex-Google' },
    { text: '"From $200K seed to $1.6B IPO payout in 63 months. Unicorn Founder badge earned. This game is dangerously addictive."', name: 'Alex T.', handle: 'Angel Investor' },
  ];

  const ContactSection = () => (
    <Section id="contact">
      <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 80 }}>
        <div className="section-label" style={{ marginBottom: 20 }}>Get in Touch</div>
        <h2 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 60px)', marginBottom: 24 }}>
          QUESTIONS? <span className="glow-purple">PITCH US.</span>
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
          Have feedback or technical questions? Our team typically responds within 24-48 hours.
        </p>
      </motion.div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div
          variants={fadeUp}
          className="card"
          style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}
        >
          {/* Subtle background glow for the form card */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '40%', height: '60%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <form action="https://formspree.io/f/xaqljavr" method="POST" className="space-y-6">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Steve Jobs"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="steve@apple.com"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="_subject"
                required
                placeholder="Game Feedback / Support / Partnership"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="message">Your Message</label>
              <textarea
                id="message"
                name="message"
                required
                placeholder="Your message to the Founder Sim team..."
                className="form-input"
              />
            </div>

            <input type="hidden" name="_next" value={window.location.href} />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full"
              style={{ padding: '20px', fontSize: '13px', marginTop: '12px' }}
            >
              Send Secure Message <Mail size={16} />
            </motion.button>
          </form>
        </motion.div>

        {/* Contact Info Row */}
        <motion.div 
          variants={stagger}
          style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            <MessageSquare size={16} className="text-purple-400" /> 
            <span>foundersim.game@gmail.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            <ShieldCheck size={16} className="text-green-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </motion.div>
      </div>
    </Section>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* BG */}
      <div className="site-bg" />

      {/* ─── NAV ─── */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Zap size={22} color="white" fill="white" />
          </div>
          <span className="nav-logo-text">FOUNDER<span>SIM</span></span>
        </Link>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#gameplay">Gameplay</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><Link to="/privacy">Privacy</Link></li>
        </ul>

        <div className="nav-actions">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
            className="btn-primary nav-cta"
            style={{ padding: '12px 24px', fontSize: 10 }}
          >
            Download Free <ExternalLink size={12} />
          </a>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(6,2,15,0.97)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}
          >
            <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 28, right: 28, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            {(['Features', 'Gameplay', 'Contact', 'Privacy'] as const).map((label, i) => {
              const href = label === 'Privacy' ? '/privacy' : `#${label.toLowerCase()}`;
              return (
                <motion.a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em', color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}
                >
                  {label}
                </motion.a>
              );
            })}
            <a href="https://play.google.com/store" className="btn-primary">Download Free</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ─── */}
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 120, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-5%', top: '10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="section hero-inner" style={{ display: 'flex', alignItems: 'center', gap: 80, paddingTop: 40, paddingBottom: 80 }}>
          {/* Left — Copy */}
          <motion.div
            className="hero-left"
            style={{ flex: '0 0 55%', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.div
              className="badge"
              style={{ marginBottom: 32, display: 'inline-flex', marginLeft: 'auto', marginRight: 'auto' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="badge-dot" />
              1,029 Active Founders This Week
            </motion.div>

            <motion.h1
              className="hero-title"
              style={{ fontSize: 'clamp(52px, 7vw, 100px)', marginBottom: 36, color: '#fff', textAlign: 'center' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.9, ease: 'easeOut' }}
            >
              FROM<br />
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>ZERO</span><br />
              TO{' '}
              <span className="glow-purple">IPO</span>
            </motion.h1>

            <motion.p
              style={{ fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', maxWidth: 600, marginBottom: 48, textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              The most realistic startup simulation. Raise funding, manage your cap table, navigate 100% AI-powered founder decisions, and build a company worth billions.
            </motion.p>

            <motion.div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 64 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="btn-primary">
                Play Free Now <ArrowRight size={16} />
              </a>
            </motion.div>

            {/* Social proof row */}
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { val: '$4.3B', label: 'Peak Valuation' },
                { val: '98/100', label: 'Legacy Score' },
                { val: '737K+', label: 'Peak Users' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 4 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--orange)" color="var(--orange)" />)}
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>4.9</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Stacked Phone Mockups */}
          <motion.div
            style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 600 }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Back phone — financials */}
            <div
              className="float-anim-slow hero-phone-back"
              style={{
                position: 'absolute',
                width: 220,
                right: 0,
                top: 20,
                transform: 'rotate(8deg) scale(0.88)',
                zIndex: 1,
                opacity: 0.65,
              }}
            >
              <div className="phone-frame">
                <img src={screenFinancialsNew} alt="Financials" />
              </div>
            </div>

            {/* Front phone — IPO */}
            <div className="float-anim hero-phone-front" style={{ position: 'relative', width: 270, zIndex: 2 }}>
              <div className="phone-frame">
                <img src={typeof screenIpoNew === 'string' ? screenIpoNew : (screenIpoNew as any).src || screenIpoNew} alt="IPO Success Screen" />
              </div>

              {/* Floating $1.6B badge */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: -6 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                style={{
                  position: 'absolute', top: -20, left: -56,
                  background: 'rgba(16,185,129,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16,185,129,0.5)',
                  borderRadius: 20,
                  padding: '14px 20px',
                  boxShadow: '0 16px 40px rgba(16,185,129,0.25)',
                  zIndex: 10,
                }}
              >
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1 }}>$1.6B</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>PERSONAL PAYOUT</div>
              </motion.div>

              {/* Floating Unicorn badge */}
              <motion.div
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 4 }}
                transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
                style={{
                  position: 'absolute', bottom: 80, right: -60,
                  background: 'rgba(124,58,237,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139,92,246,0.5)',
                  borderRadius: 18,
                  padding: '14px 20px',
                  boxShadow: '0 16px 40px rgba(124,58,237,0.25)',
                  zIndex: 10,
                }}
              >
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 900, color: '#fff' }}>🦄 UNICORN</div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>SCORE 98/100</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {[
            { val: '$4.3B', label: 'Peak Valuation Achieved', color: 'var(--purple-light)' },
            { val: '737K+', label: 'Peak Users Simulated', color: 'var(--green)' },
            { val: '100%', label: 'AI Decision Events', color: 'var(--orange)' },
            { val: '$15.4B', label: 'Largest Acquisition Offer', color: 'var(--purple-light)' },
            { val: '98/100', label: 'Max Legacy Score', color: 'var(--orange)' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '32px 20px', textAlign: 'center', flex: '1 0 160px' }}>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.val}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <Section id="features">
        <motion.div variants={fadeUp} style={{ marginBottom: 80 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Core Mechanics</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 64px)', maxWidth: 700, marginBottom: 24 }}>
            EVERY DECISION.<br />
            <span className="glow-purple">REAL CONSEQUENCES.</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', maxWidth: 560, lineHeight: 1.7 }}>
            Built on a proprietary narrative engine that adapts to your leadership style. No two playthroughs are the same.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className={`feature-card ${f.color}`}>
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="feature-stat">{f.stat}</div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <div className="divider" />

      {/* ─── GAMEPLAY LOOP ─── */}
      <Section id="gameplay">
        <motion.div variants={fadeUp} style={{ marginBottom: 80 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>The Journey</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 60px)', maxWidth: 600, marginBottom: 24 }}>
            FROM SEED CAPITAL<br />
            <span style={{ color: 'var(--orange)' }}>TO IPO GLORY</span>
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          className="steps-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}
        >
          {steps.map((s) => (
            <motion.div key={s.num} variants={fadeUp} className="step-card">
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <div className="divider" />

      {/* ─── SCREENSHOT SHOWCASE ─── */}
      <Section id="screens">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 80 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>In-Game Dashboards</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 60px)', marginBottom: 20 }}>
            SEE THE SIMULATION
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
            Real mechanics. Real numbers. Real high-stakes decisions.
          </p>
        </motion.div>

        {/* Standardized Grid for All Screenshots */}
        <motion.div 
          variants={stagger} 
          className="screens-grid" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 24 
          }}
        >
          {[
            { img: screenHome, tag: 'Launch', title: 'Main Menu', desc: 'Pick your sector & team', icon: <Rocket size={15} color="var(--orange)" /> },
            { img: screenProduct, tag: 'Product', title: 'Product Dev', desc: 'Build core technology', icon: <Zap size={15} color="var(--purple-light)" /> },
            { img: screenHiring, tag: 'Hiring', title: 'Recruiting', desc: 'Find your A-Team', icon: <Zap size={15} color="var(--purple-light)" /> },
            { img: screenDashboard, tag: 'Growth', title: 'The Dashboard', desc: 'Monthly decision engine', icon: <Zap size={15} color="var(--purple-light)" /> },
            { img: screenMarketing, tag: 'Marketing', title: 'User Acquisition', desc: 'Scale your userbase', icon: <Rocket size={15} color="var(--orange)" /> },
            { img: screenEvent, tag: 'Decisions', title: 'Narrative Events', desc: '100% AI-Generated Scenarios', icon: <Rocket size={15} color="var(--orange)" /> },
            { img: screenTeam, tag: 'Leadership', title: 'Team Culture', desc: 'Manage Burnout & Equity', icon: <Rocket size={15} color="var(--orange)" /> },
            { img: screenLifestyle, tag: 'Lifestyle', title: 'Founder Balance', desc: 'Health vs. Hustle', icon: <Award size={15} color="var(--orange)" /> },
            { img: screenFinancialsNew, tag: 'Economic', title: 'Unit Economics', desc: 'Burn, MRR & Profitability', icon: <BarChart3 size={15} color="var(--purple-light)" /> },
            { img: screenPitch, tag: 'Raising', title: 'The Pitch', desc: 'High-stakes negotiations', icon: <DollarSign size={15} color="var(--green)" /> },
            { img: screenFundingNew, tag: 'Strategy', title: 'Cap Table', desc: 'Manage Dilution & VCs', icon: <Building2 size={15} color="var(--green)" /> },
            { img: screenIpoNew, tag: 'Endgame', title: 'IPO Success', desc: '$1.6B Personal Payout', icon: <Award size={15} color="var(--orange)" /> },
          ].map((s, idx) => (
            <motion.div key={idx} variants={fadeUp}>
              <div className="card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  {s.icon}
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{s.tag}</span>
                </div>
                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, color: '#fff' }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 20 }}>{s.desc}</p>
                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
                  <img src={typeof s.img === 'string' ? s.img : (s.img as any)?.src || s.img} alt={s.title} style={{ width: '100%', display: 'block', aspectRatio: '9/16', objectFit: 'cover' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <div className="divider" />

      {/* ─── TESTIMONIALS ─── */}
      <Section>
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Founder Reviews</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
            WHAT FOUNDERS<br />
            <span className="glow-purple">ARE SAYING</span>
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeUp} className="quote-card">
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--orange)" color="var(--orange)" />)}
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
      </Section>

      <div className="divider" />

      {/* ─── CONTACT ─── */}
      <ContactSection />

      {/* ─── CTA BANNER ─── */}
      <div className="ipo-banner">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div className="section-label" style={{ marginBottom: 24 }}>Available Now · Free</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(40px, 6vw, 80px)', marginBottom: 24 }}>
            YOUR LEGACY<br />
            <span className="glow-purple">AWAITS.</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 48px' }}>
            Free to play. No subscriptions. Just strategic decisions and your path to the $1.6B payout.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '20px 48px', fontSize: 12 }}>
              Download on Google Play <ArrowRight size={18} />
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
              <ShieldCheck size={16} color="var(--green)" /> Free to Play
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── FOOTER ─── */}
      <div className="footer">
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 60, flexWrap: 'wrap', marginBottom: 60 }}>
          <div className="footer-brand" style={{ flex: '0 0 360px' }}>
            <Link to="/" className="nav-logo" style={{ display: 'inline-flex', marginBottom: 20 }}>
              <div className="nav-logo-icon"><Zap size={22} color="white" fill="white" /></div>
              <span className="nav-logo-text">FOUNDER<span>SIM</span></span>
            </Link>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, maxWidth: 340 }}>
              The most realistic startup simulation. Build your legacy. From zero to IPO.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 20 }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(['Features', 'Gameplay'] as const).map((label) => (
                  <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 20 }}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Link to="/privacy" style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</Link>
                <a href="#contact" style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 Founder Sim Studio. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 999, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <ShieldCheck size={14} color="var(--green)" />
            <span style={{ fontSize: 10, fontFamily: 'Orbitron, sans-serif', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Google Play Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────
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
