import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ArrowRight, Heart, Target, Users, Shield, Star, BookOpen,
  Mic2, Handshake, ChevronDown, Phone, Mail, MapPin,
  Calendar, Headphones,
} from "lucide-react";
import RecordingsPage from "./RecordingsPage";

const MONO = "Montserrat, sans-serif";
const SERIF = "Playfair Display, serif";

// ─── Ken Burns keyframes (injected once) ────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes kenBurns {
    0%   { transform: scale(1)    translateZ(0); }
    100% { transform: scale(1.12) translateZ(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes revealLine {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0% 0 0); }
  }
  @keyframes waveBar {
    0%, 100% { transform: scaleY(0.3); }
    50%       { transform: scaleY(1);   }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.95); opacity: 0.7; }
    70%  { transform: scale(1.15); opacity: 0;   }
    100% { transform: scale(0.95); opacity: 0;   }
  }
  .ken-burns { animation: kenBurns 9s ease-out forwards; }
  body { overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(212,165,116,0.4); border-radius: 2px; }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useInView(threshold = 0.18) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean, duration = 2200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [active, target, duration]);
  return count;
}

// ─── Nav ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "About",       href: "#about"       },
  { label: "Programs",    href: "#programs"    },
  { label: "Approach",    href: "#approach"    },
  { label: "Who We Serve",href: "#who-we-serve"},
  { label: "Impact",      href: "#impact"      },
  { label: "Partners",    href: "#partners"    },
];

function Nav({
  onRecordings,
  onHome,
  page,
}: {
  onRecordings: () => void;
  onHome: () => void;
  page: "home" | "recordings";
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // hide when scrolling down, show when scrolling up
      if (y > lastY.current + 6) setVisible(false);
      else if (y < lastY.current - 6) setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu when navigating
  const go = (href: string) => {
    setOpen(false);
    if (page === "recordings") {
      // Go home first, then scroll after paint
      onHome();
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ── Desktop / Tablet pill nav ──────────────────────────────────── */}
      <header
        className="fixed left-0 right-0 z-50 transition-all duration-300"
        style={{
          top: "16px",
          transform: visible ? "translateY(0)" : "translateY(-110%)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.35s ease, opacity 0.35s ease",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Pill container */}
          <div
            className="flex items-center justify-between h-14 px-5 rounded-full"
            style={{
              background: scrolled
                ? "rgba(15,28,50,0.92)"
                : "rgba(15,28,50,0.75)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(212,165,116,0.18)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.25)",
            }}
          >
            {/* Logo */}
            <button
              onClick={() => { page === "recordings" ? onHome() : window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center shrink-0"
            >
              <div
                className="w-11 h-11 rounded-full overflow-hidden shrink-0"
                style={{
                  border: "2px solid rgba(212,165,116,0.55)",
                  background: "#000",
                }}
              >
                <img src="/PISH_Logo_1.jpeg" alt="PISH Logo" className="w-full h-full object-cover" />
              </div>
            </button>

            {/* Desktop links */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => go(l.href)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.72)", fontFamily: MONO }}
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => { setOpen(false); onRecordings(); }}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:text-white flex items-center gap-1.5"
                style={{ color: "rgba(255,255,255,0.72)", fontFamily: MONO }}
              >
                <Headphones size={13} />
                Recordings
              </button>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => go("#join")}
                className="hidden lg:inline-flex px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{ background: "#D4A574", color: "#1E3A5F", fontFamily: MONO }}
              >
                Join Us
              </button>
              {/* Hamburger — mobile */}
              <button
                className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: "white" }}
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen menu ────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-40 flex flex-col lg:hidden transition-all duration-300"
        style={{
          background: "rgba(10,20,40,0.98)",
          backdropFilter: "blur(20px)",
          pointerEvents: open ? "auto" : "none",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
        }}
      >
        {/* Mobile header row */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-11 h-11 rounded-full overflow-hidden shrink-0"
              style={{
                border: "2px solid rgba(212,165,116,0.55)",
                background: "#000",
              }}
            >
              <img src="/PISH_Logo_1.jpeg" alt="PISH Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0 24px" }} />

        {/* Mobile links */}
        <nav className="flex flex-col px-6 mt-6 gap-1 flex-1">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="text-left w-full py-4 text-2xl font-bold text-white border-b transition-colors hover:text-amber-300"
              style={{ borderColor: "rgba(255,255,255,0.08)", fontFamily: MONO }}
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); onRecordings(); }}
            className="text-left w-full py-4 text-2xl font-bold text-white border-b transition-colors hover:text-amber-300 flex items-center gap-3"
            style={{ borderColor: "rgba(255,255,255,0.08)", fontFamily: MONO }}
          >
            <Headphones size={22} /> Recordings
          </button>
        </nav>

        {/* Mobile CTA */}
        <div className="px-6 pb-10">
          <button
            onClick={() => go("#join")}
            className="w-full py-4 rounded-full font-semibold text-lg"
            style={{ background: "#D4A574", color: "#1E3A5F", fontFamily: MONO }}
          >
            Join Us
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Hero Slideshow ──────────────────────────────────────────────────────────

const SLIDES = [
  {
    src: "/hero_1.png",
    headline: "Purity in Heart.",
    sub: "Purpose in Life.",
    overlay: "linear-gradient(135deg, rgba(30,58,95,0.88) 45%, rgba(74,144,164,0.45) 100%)",
  },
  {
    src: "/hero_2.png",
    headline: "Empowering Youth.",
    sub: "Building Futures.",
    overlay: "linear-gradient(135deg, rgba(30,58,95,0.82) 40%, rgba(30,58,95,0.6) 100%)",
  },
  {
    src: "/hero_3.png",
    headline: "Strong Community.",
    sub: "Lasting Purpose.",
    overlay: "linear-gradient(135deg, rgba(20,45,75,0.9) 45%, rgba(74,144,164,0.4) 100%)",
  },
  {
    src: "/hero_4.png",
    headline: "Guided by Values.",
    sub: "Driven by Calling.",
    overlay: "linear-gradient(135deg, rgba(30,58,95,0.85) 45%, rgba(212,165,116,0.25) 100%)",
  },
];

function StatCard({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const c = useCountUp(value, active);
  return (
    <div className="text-center">
      <div className="text-4xl lg:text-5xl font-bold mb-1" style={{ fontFamily: SERIF, color: "#D4A574" }}>
        {c.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-white/55 tracking-widest uppercase" style={{ fontFamily: MONO }}>{label}</div>
    </div>
  );
}

function Hero() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [statsActive, setStatsActive] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((p) => (p + 1) % SLIDES.length);
      setAnimKey((k) => k + 1);
    }, 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ background: "#1E3A5F" }}>
      {/* Gold top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-20" style={{ background: "linear-gradient(90deg, #D4A574, #4A90A4, #D4A574)" }} />

      {/* Slideshow images */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, zIndex: 1 }}
        >
          <img
            key={i === current ? animKey : i}
            src={s.src}
            alt=""
            className={`w-full h-full object-cover${i === current ? " ken-burns" : ""}`}
          />
          {/* Left-side gradient for text readability */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(30,58,95,0.92) 0%, rgba(30,58,95,0.75) 40%, rgba(30,58,95,0.15) 70%, transparent 100%)" }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="max-w-3xl">
          <h1
            key={current + "-h1"}
            className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: SERIF, animation: "slideUp 0.7s ease forwards" }}
          >
            {slide.headline}
            <br />
            <em className="italic" style={{ color: "#D4A574" }}>{slide.sub}</em>
          </h1>

          <p
            key={current + "-p"}
            className="text-lg lg:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl"
            style={{ fontFamily: MONO, animation: "slideUp 0.9s ease forwards" }}
          >
            PISH empowers young people to embrace sexual purity and purposeful living
            as interconnected, life-affirming choices, through education, mentorship,
            and community support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => document.querySelector("#join")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: "#D4A574", color: "#1E3A5F", fontFamily: MONO }}>
              Join the Movement <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all duration-200 hover:bg-white/10"
              style={{ border: "1.5px solid rgba(255,255,255,0.3)", color: "white", fontFamily: MONO }}>
              Learn More <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex gap-2 mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setAnimKey((k) => k + 1); }}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? "28px" : "8px",
                height: "8px",
                background: i === current ? "#D4A574" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12"
          style={{ borderTop: "1px solid rgba(212,165,116,0.18)" }}
        >
          <StatCard value={10000} suffix="+" label="Youth Reached"   active={statsActive} />
          <StatCard value={150}   suffix="+" label="Schools Visited" active={statsActive} />
          <StatCard value={200}   suffix="+" label="Mentors Trained" active={statsActive} />
          <StatCard value={5}     suffix=""  label="Core Programs"   active={statsActive} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 z-20">
        <span className="text-xs tracking-widest uppercase" style={{ fontFamily: MONO }}>Scroll</span>
        <ChevronDown size={16} className="animate-bounce" />
      </div>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

function About() {
  const { ref, visible } = useInView();

  return (
    <section id="about" className="py-24 lg:py-32" style={{ background: "#FDFAF6" }}>
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-40px)", transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/5" }}>
              <img
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=700&h=875&fit=crop&auto=format"
                alt="Young people in a mentorship session"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(30,58,95,0.5) 0%, transparent 60%)" }} />
            </div>
            <div className="absolute -bottom-8 -right-8 max-w-xs p-6 rounded-2xl shadow-2xl" style={{ background: "#1E3A5F" }}>
              <p className="text-white/90 text-sm italic leading-relaxed mb-2" style={{ fontFamily: SERIF }}>
                "Purity and purpose are deeply connected. When young people honor their bodies, minds, and spirits, they unlock their potential."
              </p>
              <div className="text-xs tracking-wide uppercase" style={{ color: "#D4A574", fontFamily: MONO }}>
                PISH Core Belief
              </div>
            </div>
          </div>

          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(40px)", transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s" }}>
            <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>
              About PISH
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>
              A Beacon of Hope for <em className="italic" style={{ color: "#D4A574" }}>Young People</em>
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: "#4B5563", fontFamily: MONO }}>
              PISH (Purity Is Still Happening) is a youth-focused non-profit organization dedicated to promoting sexual purity and purposeful living. In a world where hyper-sexualized media, peer pressure, and aimlessness often cloud judgment, PISH stands as a beacon of hope.
            </p>
            <p className="text-base leading-relaxed mb-10" style={{ color: "#4B5563", fontFamily: MONO }}>
              We offer mentorship, education, and community support, equipping every young person with the clarity, confidence, and conviction to live intentionally and serve others.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Heart,  label: "Purity",    desc: "Honoring body, mind and spirit" },
                { icon: Target, label: "Purpose",   desc: "Discovering your unique calling" },
                { icon: Users,  label: "Community", desc: "Supportive networks to thrive" },
              ].map(({ icon: Icon, label, desc }, i) => (
                <div
                  key={label}
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: "#F0EBE3",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(20px)",
                    transition: `all 0.6s ease ${0.3 + i * 0.12}s`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#1E3A5F" }}>
                    <Icon size={18} style={{ color: "#D4A574" }} />
                  </div>
                  <div className="font-semibold text-sm mb-1" style={{ color: "#1E3A5F", fontFamily: MONO }}>{label}</div>
                  <div className="text-xs" style={{ color: "#6B7A8D", fontFamily: MONO }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mission/Vision/Values ───────────────────────────────────────────────────

function MissionVision() {
  const { ref, visible } = useInView();
  const values = [
    { icon: Heart,    title: "Purity",      desc: "Honoring body, mind, and spirit through intentional choices" },
    { icon: Shield,   title: "Integrity",   desc: "Living authentically with honesty and consistency" },
    { icon: Target,   title: "Purpose",     desc: "Discovering and pursuing one's unique calling" },
    { icon: Star,     title: "Respect",     desc: "Valuing the dignity and potential of every individual" },
    { icon: BookOpen, title: "Empowerment", desc: "Equipping youth with knowledge and confidence" },
    { icon: Users,    title: "Community",   desc: "Building supportive networks where youth thrive" },
  ];

  return (
    <section style={{ background: "#1E3A5F" }} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "#D4A574", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ background: "#4A90A4", transform: "translate(-30%,30%)" }} />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>Our Foundation</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: SERIF }}>
            Mission, Vision & <em className="italic" style={{ color: "#D4A574" }}>Values</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease" }}>
          <div className="p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,165,116,0.2)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "rgba(212,165,116,0.15)" }}>
              <Target size={22} style={{ color: "#D4A574" }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: SERIF }}>Our Mission</h3>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", fontFamily: MONO }}>
              To empower young people to embrace sexual purity and purposeful living as interconnected, life-affirming choices, through education, mentorship, and community support, fostering holistic health, personal calling, and future readiness.
            </p>
          </div>
          <div className="p-8 rounded-2xl" style={{ background: "rgba(74,144,164,0.1)", border: "1px solid rgba(74,144,164,0.3)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "rgba(74,144,164,0.2)" }}>
              <Star size={22} style={{ color: "#4A90A4" }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: SERIF }}>Our Vision</h3>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", fontFamily: MONO }}>
              A generation of youth who are pure in heart, clear in purpose, and empowered to lead values-driven lives that positively impact their families, communities, and the world.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="p-6 rounded-xl hover:scale-105 transition-transform duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s ease ${i * 0.1}s`,
              }}
            >
              <Icon size={20} className="mb-4" style={{ color: "#D4A574" }} />
              <h4 className="font-semibold text-white mb-2" style={{ fontFamily: MONO }}>{title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontFamily: MONO }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── The Problem ─────────────────────────────────────────────────────────────

function TheProblem() {
  const { ref, visible } = useInView();
  const challenges = [
    { title: "Hyper-sexualized Culture",    desc: "Normalizes early sexual experimentation and creates immense pressure to conform." },
    { title: "Digital Distraction",          desc: "Social media promotes instant gratification over long-term purpose and meaningful goals." },
    { title: "Identity Confusion",           desc: "Many youth struggle to answer: \"Who am I?\" and \"What am I here for?\"" },
    { title: "Peer Pressure and FOMO",       desc: "Fear of missing out drives risky behaviors and compromises personal values." },
    { title: "Lack of Mentorship",           desc: "Few safe spaces exist for youth to explore purity and purpose with trusted guides." },
    { title: "Emotional and Spiritual Void", desc: "Without clarity on values, youth experience anxiety, regret, or aimlessness." },
  ];

  return (
    <section className="py-24 lg:py-32" style={{ background: "#FDFAF6" }}>
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-2 lg:sticky top-32">
            <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>The Challenge</span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>
              Why <em className="italic" style={{ color: "#D4A574" }}>PISH</em> Exists
            </h2>
            <p className="leading-relaxed mb-8" style={{ color: "#4B5563", fontFamily: MONO }}>
              Young people today face a dual crisis: confusion about sexual values and uncertainty about life direction.
            </p>
            <div className="p-6 rounded-2xl" style={{ background: "#1E3A5F" }}>
              <p className="italic text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)", fontFamily: SERIF }}>
                "Young people deserve a powerful counter-narrative that celebrates self-respect, intentional living, and the transformative power of aligning purity with purpose."
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
            {challenges.map(({ title, desc }, i) => (
              <div
                key={title}
                className="p-6 rounded-2xl"
                style={{
                  background: "white",
                  border: "1px solid rgba(30,58,95,0.08)",
                  boxShadow: "0 2px 20px rgba(30,58,95,0.06)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: `all 0.65s ease ${i * 0.09}s`,
                }}
              >
                <div className="w-8 h-1 rounded-full mb-4" style={{ background: i % 2 === 0 ? "#D4A574" : "#4A90A4" }} />
                <h4 className="font-semibold mb-2 text-base" style={{ color: "#1E3A5F", fontFamily: MONO }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7A8D", fontFamily: MONO }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Approach ────────────────────────────────────────────────────────────────

function Approach() {
  const { ref, visible } = useInView();
  const steps = [
    { label: "Pure Heart",        sub: "Values-based choices", step: "01" },
    { label: "Clear Mind",        sub: "Clarity and focus",    step: "02" },
    { label: "Purposeful Actions",sub: "Intentional living",   step: "03" },
    { label: "Impactful Life",    sub: "Positive influence",   step: "04" },
  ];

  return (
    <section id="approach" style={{ background: "#4A90A4" }} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[120px]" style={{ borderColor: "white" }} />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase mb-4 block text-white/60" style={{ fontFamily: MONO }}>Our Methodology</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: SERIF }}>
            The Purity-Purpose <em className="italic" style={{ color: "#D4A574" }}>Connection</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {[
            { t: "Purity Protects Purpose", d: "When youth honor their bodies and minds, they preserve their future potential and open doors to intentional, purposeful living." },
            { t: "Purpose Motivates Purity", d: "When youth have clear direction and life calling, they make values-aligned choices naturally. Purity becomes a joyful act of self-respect." },
          ].map(({ t, d }) => (
            <div key={t} className="p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: SERIF }}>{t}</h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontFamily: MONO }} className="leading-relaxed">{d}</p>
            </div>
          ))}
        </div>

        <div className="p-8 lg:p-12 rounded-3xl" style={{ background: "#1E3A5F" }}>
          <h3 className="text-center text-xl font-bold text-white mb-10" style={{ fontFamily: SERIF }}>The Transformation Pathway</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map(({ label, sub, step }, i) => (
              <div
                key={step}
                className="text-center"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.6s ease ${i * 0.15}s` }}
              >
                <div className="text-5xl font-bold mb-3 opacity-20 tabular-nums" style={{ color: "#D4A574", fontFamily: SERIF }}>{step}</div>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(212,165,116,0.15)", border: "2px solid rgba(212,165,116,0.4)" }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: "#D4A574" }} />
                </div>
                <div className="font-semibold text-white mb-1 text-sm" style={{ fontFamily: MONO }}>{label}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Programs ────────────────────────────────────────────────────────────────

function Programs() {
  const { ref, visible } = useInView();
  const programs = [
    { tag: "Foundational", title: "Purity 101",         color: "#D4A574", desc: "Defining sexual purity, boundaries, and healthy relationships. Youth articulate personal values and practice boundary-setting." },
    { tag: "Direction",    title: "Purpose Discovery",  color: "#4A90A4", desc: "Identifying gifts, passions, and calling through reflective exercises. Youth draft personal purpose statements and short-term goals." },
    { tag: "Practical",    title: "Life Skills Lab",    color: "#D4A574", desc: "Decision-making, assertiveness, time management, and resisting peer pressure. Youth build confidence to say no to compromise and yes to growth." },
    { tag: "Wellness",     title: "Health & Wholeness", color: "#4A90A4", desc: "Evidence-based information on STIs, emotional health, and the soul-body-spirit connection. Youth understand how choices impact wellbeing." },
  ];

  return (
    <section id="programs" className="py-24 lg:py-32" style={{ background: "#FDFAF6" }}>
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>Education and Workshops</span>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>
            Our <em className="italic" style={{ color: "#D4A574" }}>Programs</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {programs.map(({ tag, title, desc, color }, i) => (
            <div
              key={title}
              className="group p-8 rounded-2xl overflow-hidden relative hover:-translate-y-1 transition-transform duration-300"
              style={{
                background: "white",
                border: "1px solid rgba(30,58,95,0.08)",
                boxShadow: "0 4px 30px rgba(30,58,95,0.07)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.7s ease ${i * 0.1}s`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4"
                style={{ background: `${color}18`, color, fontFamily: MONO }}>{tag}</div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>{title}</h3>
              <p className="leading-relaxed" style={{ color: "#6B7A8D", fontFamily: MONO }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {[
            { icon: Handshake, title: "Purpose Partners",      desc: "Trained mentors, young adults and professionals, who model purity and purpose, offering guidance and accountability through one-on-one mentoring." },
            { icon: Users,     title: "Small Groups",          desc: "Gender-specific or interest-based groups for deeper discussion, peer support, and shared experiences in safe, judgment-free spaces." },
            { icon: Mic2,      title: "Restoration Pathways",  desc: "Compassionate support for youth who have experienced regret or trauma, emphasizing grace, growth, and new beginnings. No judgment. Only a path forward." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="p-8 rounded-2xl"
              style={{
                background: "#1E3A5F",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.7s ease ${(i + 4) * 0.1}s`,
              }}
            >
              <Icon size={24} className="mb-5" style={{ color: "#D4A574" }} />
              <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: SERIF }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: MONO }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Advocacy ────────────────────────────────────────────────────────────────

function Advocacy() {
  const { ref, visible } = useInView();

  return (
    <section style={{ background: "#F0EBE3" }} className="py-24 lg:py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>Movement Building</span>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>
            Advocacy and <em className="italic" style={{ color: "#D4A574" }}>Campaigns</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transition: "all 0.85s ease" }}>
            <img
              src="/hero_3.png"
              alt="Youth advocacy campaign" className="w-full rounded-2xl object-cover" style={{ height: "400px" }} />
          </div>

          <div className="space-y-5"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(30px)", transition: "all 0.85s ease 0.18s" }}>
            {[
              { hash: "#PureAndPurposeful", title: "Social Media Movement",       desc: "Real stories of youth choosing purity and pursuing purpose, showcased across social platforms to inspire millions." },
              { hash: "Schools",            title: "School and Campus Tours",     desc: "Interactive assemblies on values, goal-setting, digital wellness, and sexual health, reaching youth where they are." },
              { hash: "Families",           title: "Parent and Educator Equipping",desc: "Workshops helping adults communicate about purity, purpose, and healthy development at home and in school." },
              { hash: "Community",          title: "Community Purity Pledges",    desc: "Public commitments by youth, leaders, and institutions to support a culture of respect and intentionality." },
            ].map(({ hash, title, desc }) => (
              <div key={hash} className="flex gap-5 p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(30,58,95,0.08)" }}>
                <div className="flex-shrink-0 px-3 py-1 h-fit rounded-full text-xs font-bold whitespace-nowrap"
                  style={{ background: "#1E3A5F", color: "#D4A574", fontFamily: MONO }}>{hash}</div>
                <div>
                  <div className="font-semibold mb-1" style={{ color: "#1E3A5F", fontFamily: MONO }}>{title}</div>
                  <div className="text-sm leading-relaxed" style={{ color: "#6B7A8D", fontFamily: MONO }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Who We Serve ────────────────────────────────────────────────────────────

function WhoWeServe() {
  const { ref, visible } = useInView();
  const groups = [
    { img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&h=350&fit=crop&auto=format", age: "13-19 years", title: "Adolescents",       desc: "Foundational values, boundary-setting, identity formation, and early purpose exploration." },
    { img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=350&fit=crop&auto=format", age: "20-34 years", title: "Young Adults",      desc: "Relationship navigation, career and education planning, mentorship, and leadership development." },
    { img: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500&h=350&fit=crop&auto=format", age: "Family",      title: "Parents and Guardians", desc: "Equipping families to nurture purity and purpose at home, building strong foundations together." },
    { img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&h=350&fit=crop&auto=format", age: "Schools",     title: "Educators",        desc: "Training to integrate values-based messaging into schools and youth programs effectively." },
  ];

  return (
    <section id="who-we-serve" className="py-24 lg:py-32" style={{ background: "#FDFAF6" }}>
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>Who We Serve</span>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>
            Our <em className="italic" style={{ color: "#D4A574" }}>Beneficiaries</em>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {groups.map(({ img, age, title, desc }, i) => (
            <div
              key={title}
              className="group rounded-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-300"
              style={{
                background: "white",
                boxShadow: "0 4px 30px rgba(30,58,95,0.08)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.7s ease ${i * 0.12}s`,
              }}
            >
              <div className="relative overflow-hidden" style={{ height: "200px" }}>
                <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(30,58,95,0.6) 0%, transparent 60%)" }} />
                <div className="absolute bottom-3 left-4 text-xs font-semibold tracking-wide px-2 py-1 rounded-full"
                  style={{ background: "#D4A574", color: "#1E3A5F", fontFamily: MONO }}>{age}</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7A8D", fontFamily: MONO }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Impact ──────────────────────────────────────────────────────────────────

function Impact() {
  const { ref, visible } = useInView();
  const dims = [
    { label: "Knowledge", color: "#D4A574", desc: "Improved understanding of sexual health, emotional wellbeing, and purpose concepts." },
    { label: "Attitudes",  color: "#4A90A4", desc: "Increased self-worth, clarity on values, and motivation to pursue meaningful goals." },
    { label: "Behaviors",  color: "#D4A574", desc: "Higher rates of delayed sexual debut, increased goal-setting and academic attainment." },
    { label: "Community",  color: "#4A90A4", desc: "Stronger peer support networks and reduced stigma around discussing values openly." },
    { label: "Legacy",     color: "#D4A574", desc: "Long-term transformation in families, communities, and future generations." },
  ];

  return (
    <section id="impact" style={{ background: "#1E3A5F" }} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=900&fit=crop&auto=format" alt="" className="w-full h-full object-cover" />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>Measuring Success</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: SERIF }}>
              Expected Impact and <em className="italic" style={{ color: "#D4A574" }}>Outcomes</em>
            </h2>
            <p className="leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.7)", fontFamily: MONO }}>
              By investing in PISH, stakeholders contribute to measurable, lasting change across five key dimensions of youth transformation.
            </p>
            <div className="space-y-4">
              {dims.map(({ label, color, desc }, i) => (
                <div key={label} className="flex gap-4 items-start"
                  style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)", transition: `all 0.6s ease ${i * 0.1}s` }}>
                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ background: color }} />
                  <div>
                    <span className="font-semibold text-white text-sm" style={{ fontFamily: MONO }}>{label}: </span>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)", fontFamily: MONO }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {[
              { num: "85%", label: "of participants report stronger values clarity after programs" },
              { num: "3x",  label: "higher goal-setting rates among youth who complete our curriculum" },
              { num: "92%", label: "of mentees say they felt heard, respected, and empowered" },
              { num: "50+", label: "community institutions pledged to support PISH's mission" },
            ].map(({ num, label }, i) => (
              <div key={num} className="p-6 rounded-2xl text-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(212,165,116,0.15)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.12}s`,
                }}>
                <div className="text-3xl lg:text-4xl font-bold mb-3" style={{ fontFamily: SERIF, color: "#D4A574" }}>{num}</div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: MONO }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Partners ────────────────────────────────────────────────────────────────

function Partners() {
  const { ref, visible } = useInView();
  const cats = [
    { title: "Educational Institutions", icon: BookOpen, examples: ["Schools","Universities","Colleges"],    desc: "Host workshops, integrate values-based content, and refer students to PISH programs." },
    { title: "Healthcare Providers",     icon: Heart,    examples: ["Clinics","Hospitals","Counselors"],    desc: "Provide accurate medical information, referrals, and wellness support to program participants." },
    { title: "Faith-Based Organizations",icon: Star,     examples: ["Churches","Mosques","Temples"],        desc: "Offer spiritual mentorship, venues, and community mobilization for PISH initiatives." },
    { title: "Government and NGOs",      icon: Shield,   examples: ["Ministries","NGOs","UN Agencies"],    desc: "Align with national youth development, health, and education strategies." },
    { title: "Corporate Sponsors",       icon: Handshake,examples: ["Funding","Mentorship","Internships"],  desc: "Support program funding, career mentorship, and internship opportunities for youth." },
    { title: "Media and Influencers",    icon: Mic2,     examples: ["Social Media","Radio/TV","Influencers"],desc: "Amplify positive messaging and counter harmful narratives in youth culture." },
  ];

  return (
    <section id="partners" className="py-24 lg:py-32" style={{ background: "#FDFAF6" }}>
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>Collaboration</span>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>
            Strategic <em className="italic" style={{ color: "#D4A574" }}>Partnerships</em>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto" style={{ color: "#6B7A8D", fontFamily: MONO }}>
            PISH collaborates with diverse stakeholders to maximize reach, credibility, and lasting impact.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map(({ title, icon: Icon, examples, desc }, i) => (
            <div key={title} className="p-7 rounded-2xl group hover:-translate-y-1 transition-transform duration-300"
              style={{
                background: "white",
                border: "1px solid rgba(30,58,95,0.08)",
                boxShadow: "0 2px 20px rgba(30,58,95,0.05)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.7s ease ${i * 0.1}s`,
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "#F0EBE3" }}>
                <Icon size={22} style={{ color: "#1E3A5F" }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: "#1E3A5F", fontFamily: MONO }}>{title}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7A8D", fontFamily: MONO }}>{desc}</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <span key={ex} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#F0EBE3", color: "#4A90A4", fontFamily: MONO }}>{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Holistic Development ────────────────────────────────────────────────────

function HolisticDev() {
  const { ref, visible } = useInView();
  const items = [
    { title: "Spiritual Growth",             desc: "Faith-adapted devotionals, retreats, prayer, Bible study, values exploration, and community service.", emoji: "✦" },
    { title: "Goal Setting and Accountability",desc: "Tools for setting academic, career, and personal goals with regular check-ins from mentors.", emoji: "◎" },
    { title: "Emotional Intelligence",        desc: "Training on self-awareness, healthy coping strategies, and building resilient, lasting relationships.", emoji: "❋" },
    { title: "Service and Leadership",        desc: "Opportunities to volunteer, lead projects, and practice purpose through meaningful community impact.", emoji: "⬡" },
  ];

  return (
    <section style={{ background: "#F0EBE3" }} className="py-24 lg:py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#4A90A4", fontFamily: MONO }}>Comprehensive Growth</span>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: SERIF, color: "#1E3A5F" }}>
              Holistic <em className="italic" style={{ color: "#D4A574" }}>Development</em>
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: "#4B5563", fontFamily: MONO }}>
              We believe in nurturing the spirit, emotions, mind, and actions of every young person we serve. True transformation is holistic. It touches every dimension of life.
            </p>
            <div className="space-y-5 mt-8">
              {items.map(({ title, desc, emoji }, i) => (
                <div key={title} className="flex gap-5 p-5 rounded-xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(30,58,95,0.08)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-20px)",
                    transition: `all 0.6s ease ${i * 0.12}s`,
                  }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: "#1E3A5F", color: "#D4A574" }}>{emoji}</div>
                  <div>
                    <div className="font-semibold mb-1" style={{ color: "#1E3A5F", fontFamily: MONO }}>{title}</div>
                    <div className="text-sm leading-relaxed" style={{ color: "#6B7A8D", fontFamily: MONO }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(30px)", transition: "all 0.85s ease 0.25s" }}>
            <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <img src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&h=800&fit=crop&auto=format"
                alt="Youth holistic development" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(30,58,95,0.7) 0%, transparent 50%)" }} />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white text-lg font-medium italic" style={{ fontFamily: SERIF }}>
                  "Nurturing the spirit, emotions, mind, and actions of every young person."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Join Us CTA ──────────────────────────────────────────────────────────────

function JoinUs() {
  return (
    <section id="join" className="py-24 lg:py-32 relative overflow-hidden" style={{ background: "#1E3A5F" }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: "#D4A574", transform: "translate(-30%,-30%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: "#4A90A4", transform: "translate(30%,30%)" }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <span className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: "#D4A574", fontFamily: MONO }}>Join the Movement</span>
        <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: SERIF }}>
          Together, We Can Make <br />
          <em className="italic" style={{ color: "#D4A574" }}>Purity Happen</em>
        </h2>
        <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: "rgba(255,255,255,0.7)", fontFamily: MONO }}>
          Together, we can empower a generation of youth to live with purity in heart and purpose in life. There is a role for everyone in this mission.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Partner With Us",  desc: "Organizations, schools, and churches. Collaborate with PISH to extend your impact.", cta: "Become a Partner", featured: false },
            { title: "Support Our Work", desc: "Your donations and sponsorships directly fund workshops, mentorship, and youth programs.", cta: "Donate Now", featured: true },
            { title: "Volunteer",        desc: "Join as a mentor, facilitator, or advocate. Your time and talents change lives.", cta: "Get Involved", featured: false },
          ].map(({ title, desc, cta, featured }) => (
            <div key={title} className="p-8 rounded-2xl flex flex-col items-center text-center"
              style={{ background: featured ? "#D4A574" : "rgba(255,255,255,0.07)", border: featured ? "none" : "1px solid rgba(255,255,255,0.12)" }}>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: SERIF, color: featured ? "#1E3A5F" : "white" }}>{title}</h3>
              <p className="text-sm leading-relaxed mb-6 flex-1"
                style={{ color: featured ? "rgba(30,58,95,0.75)" : "rgba(255,255,255,0.65)", fontFamily: MONO }}>{desc}</p>
              <button className="px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: featured ? "#1E3A5F" : "rgba(212,165,116,0.2)",
                  color: featured ? "white" : "#D4A574",
                  border: featured ? "none" : "1px solid rgba(212,165,116,0.3)",
                  fontFamily: MONO,
                }}>{cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer({ onRecordings }: { onRecordings: () => void }) {
  const links: Record<string, string[]> = {
    Organization: ["About PISH", "Our Mission", "Core Values", "Governance"],
    Programs: ["Purity 101", "Purpose Discovery", "Life Skills Lab", "Health and Wholeness"],
    "Get Involved": ["Partner With Us", "Donate", "Volunteer", "Advocacy"],
  };

  return (
    <footer style={{ background: "#111C2B" }} className="pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12 pb-12" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-full overflow-hidden shrink-0"
                style={{
                  border: "2px solid rgba(212,165,116,0.55)",
                  background: "#000",
                }}
              >
                <img src="/PISH_Logo_1.jpeg" alt="PISH Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm" style={{ fontFamily: SERIF }}>Purity Is Still Happening</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO, maxWidth: "280px" }}>
              Empowering youth to embrace purity and purpose as life-affirming, interconnected choices.
            </p>
            <button onClick={onRecordings} className="flex items-center gap-2 px-4 py-2 rounded-lg mb-5 text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(212,165,116,0.12)", color: "#D4A574", border: "1px solid rgba(212,165,116,0.2)", fontFamily: MONO }}>
              <Headphones size={14} /> Meeting Recordings
            </button>
            <div className="space-y-3">
              {[
                { Icon: MapPin, text: "Nairobi, Kenya" },
                { Icon: Mail,   text: "info@pishyouth.org" },
                { Icon: Phone,  text: "+254 700 000 000" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO }}>
                  <Icon size={14} style={{ color: "#D4A574" }} /> {text}
                </div>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#D4A574", fontFamily: MONO }}>{cat}</div>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-white transition-colors duration-200"
                      style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO }}>
            2026 PISH. Purity Is Still Happening. All rights reserved.
          </p>
          <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.25)", fontFamily: SERIF }}>
            "Purity in Heart. Purpose in Life."
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Recordings Page ─────────────────────────────────────────────────────────
// Extracted to src/app/RecordingsPage.tsx for maintainability.
// Add new recordings and upcoming meetings in that file.

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<"home" | "recordings">("home");

  useEffect(() => {
    const el = document.getElementById("pish-global-styles");
    if (!el) {
      const s = document.createElement("style");
      s.id = "pish-global-styles";
      s.textContent = GLOBAL_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const goRecordings = () => setPage("recordings");
  const goHome      = () => setPage("home");

  return (
    <div className="min-h-screen" style={{ fontFamily: MONO }}>
      <Nav onRecordings={goRecordings} onHome={goHome} page={page} />

      {page === "home" ? (
        <>
          <Hero />
          <About />
          <MissionVision />
          <TheProblem />
          <Approach />
          <Programs />
          <Advocacy />
          <WhoWeServe />
          <Impact />
          <HolisticDev />
          <Partners />
          <JoinUs />
          <Footer onRecordings={goRecordings} />
        </>
      ) : (
        <RecordingsPage onBack={goHome} />
      )}
    </div>
  );
}
