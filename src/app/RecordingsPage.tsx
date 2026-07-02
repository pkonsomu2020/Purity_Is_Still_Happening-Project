import { useState, useRef, useEffect } from "react";
import {
  ArrowRight, Radio, Music, Calendar, Clock,
  Download, Loader2,
} from "lucide-react";
import { supabase, type PastSession, type UpcomingSession } from "../lib/supabase";

const MONO  = "Montserrat, sans-serif";
const SERIF = "Playfair Display, serif";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useInView(threshold = 0.05) {
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

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ─── WaveformBars ─────────────────────────────────────────────────────────────

function WaveformBars({ playing, color = "#D4A574" }: { playing: boolean; color?: string }) {
  const heights = [40, 70, 55, 85, 60, 90, 45, 75, 50, 80, 65, 40, 70, 55, 85, 60, 90, 45];
  return (
    <div className="flex items-end gap-0.5 h-10">
      {heights.map((h, i) => (
        <div key={i} className="w-1 rounded-sm" style={{
          height: `${h}%`,
          background: color,
          transformOrigin: "bottom",
          animation: playing
            ? `waveBar ${0.5 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite`
            : "none",
          opacity: playing ? 1 : 0.35,
          transition: "opacity 0.3s",
        }} />
      ))}
    </div>
  );
}

// ─── AudioPlayer ─────────────────────────────────────────────────────────────
// Uses the native browser audio element styled to match the PISH design.
// The download button triggers a real file download.

function AudioPlayer({ src, title }: { src: string; title: string }) {
  const downloadName = title.replace(/[^a-z0-9 \-_]/gi, "").trim() + ".mp3";
  const [playbackError, setPlaybackError] = useState(false);

  const handleDownload = async () => {
    try {
      const res  = await fetch(src);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback — open in new tab
      window.open(src, "_blank");
    }
  };

  return (
    <div className="mt-4">
      {playbackError ? (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/50">
          <p className="text-xs font-semibold text-amber-800" style={{ fontFamily: MONO }}>
            Browser playback is not supported for this recording format.
          </p>
          <button
            onClick={handleDownload}
            className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:bg-[#1E3A5F] hover:text-white"
            style={{
              background: "rgba(30,58,95,0.08)",
              color: "#1E3A5F",
              fontFamily: MONO,
            }}
          >
            <Download size={15} /> Download Recording
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* Native audio — pill shaped */}
          <audio
            controls
            src={src}
            onError={() => setPlaybackError(true)}
            className="flex-1 h-11"
            style={{
              borderRadius: "999px",
              background: "#f3f4f6",
              outline: "none",
              minWidth: 0,
            }}
          />
          {/* Download button */}
          <button
            onClick={handleDownload}
            title={`Download "${title}"`}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(30,58,95,0.08)", color: "#1E3A5F" }}
          >
            <Download size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── RecordingsPage ───────────────────────────────────────────────────────────

export default function RecordingsPage({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"past" | "upcoming">("past");
  const { ref, visible } = useInView();

  // ── Live data from Supabase ──
  const [past, setPast]         = useState<PastSession[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [pastRes, upcomingRes] = await Promise.all([
          supabase
            .from("past_sessions")
            .select("*")
            .order("session_date", { ascending: false }),
          supabase
            .from("upcoming_sessions")
            .select("*")
            .gte("session_date", new Date().toISOString().slice(0, 10))
            .order("session_date", { ascending: true }),
        ]);

        if (cancelled) return;
        if (pastRes.error)     throw pastRes.error;
        if (upcomingRes.error) throw upcomingRes.error;

        setPast(pastRes.data ?? []);
        setUpcoming(upcomingRes.data ?? []);
      } catch (err: unknown) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();

    // ── Realtime subscriptions — reflect admin changes instantly ──
    const pastChannel = supabase
      .channel("past_sessions_changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "past_sessions" },
        () => fetchAll()
      )
      .subscribe();

    const upcomingChannel = supabase
      .channel("upcoming_sessions_changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "upcoming_sessions" },
        () => fetchAll()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(pastChannel);
      supabase.removeChannel(upcomingChannel);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#FDFAF6" }}>
      {/* ── Header ── */}
      <div className="relative overflow-hidden py-24 pt-32" style={{ background: "#1E3A5F" }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
            style={{ background: "#D4A574", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: "#4A90A4", transform: "translate(-30%,30%)" }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: "linear-gradient(90deg, #D4A574, #4A90A4, #D4A574)" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
            style={{ color: "#D4A574", fontFamily: MONO }}>
            <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to Home
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(212,165,116,0.15)", border: "1px solid rgba(212,165,116,0.3)" }}>
              <Radio size={26} style={{ color: "#D4A574" }} />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase block mb-1"
                style={{ color: "#4A90A4", fontFamily: MONO }}>PISH Archive</span>
              <h1 className="text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: SERIF }}>
                Meeting <em className="italic" style={{ color: "#D4A574" }}>Recordings</em>
              </h1>
            </div>
          </div>

          <p className="max-w-xl mt-4" style={{ color: "rgba(255,255,255,0.65)", fontFamily: MONO }}>
            Access recordings of past PISH meetings, workshops, and upcoming sessions.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-10">
            {[
              { n: loading ? "…" : past.length,     l: "Total Recordings"  },
              { n: loading ? "…" : upcoming.length, l: "Upcoming Sessions" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center px-6 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,165,116,0.15)" }}>
                <div className="text-2xl font-bold" style={{ color: "#D4A574", fontFamily: SERIF }}>{n}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div ref={ref} className="max-w-7xl mx-auto px-6 py-12">

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm text-center"
            style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", fontFamily: MONO, border: "1px solid rgba(220,38,38,0.2)" }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 rounded-xl w-fit" style={{ background: "rgba(30,58,95,0.06)" }}>
          {(["past", "upcoming"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: tab === t ? "#1E3A5F" : "transparent",
                color:      tab === t ? "white"    : "#6B7A8D",
                fontFamily: MONO,
              }}>
              {t === "past" ? "Past Sessions" : "Upcoming Meetings"}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3"
            style={{ color: "#6B7A8D", fontFamily: MONO }}>
            <Loader2 size={22} className="animate-spin" style={{ color: "#D4A574" }} />
            Loading sessions…
          </div>
        )}

        {/* ── Past Sessions ── */}
        {!loading && tab === "past" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.length === 0 ? (
              <div className="col-span-full py-20 text-center rounded-2xl"
                style={{ background: "white", border: "1px solid rgba(30,58,95,0.08)" }}>
                <Music size={40} className="mx-auto mb-4" style={{ color: "rgba(30,58,95,0.2)" }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: "#1E3A5F", fontFamily: SERIF }}>
                  No Recordings Yet
                </h3>
                <p className="text-sm" style={{ color: "#6B7A8D", fontFamily: MONO }}>
                  Recordings will appear here once uploaded.
                </p>
              </div>
            ) : past.map((rec, i) => (
              <div key={rec.id} className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "white",
                  border: "1px solid rgba(30,58,95,0.08)",
                  boxShadow: "0 2px 24px rgba(30,58,95,0.07)",
                  opacity:   visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: `all 0.6s ease ${i * 0.1}s`,
                }}>
                {/* Poster */}
                <div className="relative w-full flex-shrink-0" style={{ aspectRatio: "16/9", background: "#1E3A5F" }}>
                  {rec.poster_url ? (
                    <img src={rec.poster_url} alt={rec.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                      style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #2d5080 100%)" }}>
                      <Music size={40} style={{ color: "rgba(212,165,116,0.5)" }} />
                      <span className="text-xs font-semibold tracking-widest uppercase"
                        style={{ color: "rgba(212,165,116,0.6)", fontFamily: MONO }}>Audio Recording</span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold mb-1 leading-snug" style={{ color: "#1E3A5F", fontFamily: SERIF }}>
                    {rec.title}
                  </h3>
                  <span className="text-xs mb-3" style={{ color: "#9CA3AF", fontFamily: MONO }}>
                    {formatDate(rec.session_date)}
                  </span>
                  {rec.description && (
                    <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#6B7A8D", fontFamily: MONO }}>
                      {rec.description}
                    </p>
                  )}
                  {rec.recording_url
                    ? <AudioPlayer src={rec.recording_url} title={rec.title} />
                    : (
                      <div className="mt-4 p-4 rounded-xl text-center text-xs"
                        style={{ background: "rgba(30,58,95,0.04)", color: "#9CA3AF", fontFamily: MONO }}>
                        Recording coming soon
                      </div>
                    )
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Upcoming Meetings ── */}
        {!loading && tab === "upcoming" && (
          <div className="space-y-5">
            {upcoming.length === 0 ? (
              <div className="py-20 text-center rounded-2xl"
                style={{ background: "white", border: "1px solid rgba(30,58,95,0.08)" }}>
                <Calendar size={40} className="mx-auto mb-4" style={{ color: "rgba(30,58,95,0.2)" }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: "#1E3A5F", fontFamily: SERIF }}>
                  No Upcoming Sessions Yet
                </h3>
                <p className="text-sm" style={{ color: "#6B7A8D", fontFamily: MONO }}>
                  Check back soon — new sessions will be announced here.
                </p>
              </div>
            ) : upcoming.map((s, i) => (
              <div key={s.id} className="rounded-2xl overflow-hidden flex flex-col sm:flex-row"
                style={{
                  background: "white",
                  border: "1px solid rgba(30,58,95,0.08)",
                  boxShadow: "0 2px 20px rgba(30,58,95,0.05)",
                  opacity:   visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-20px)",
                  transition: `all 0.6s ease ${i * 0.1}s`,
                }}>
                {/* Poster */}
                <div className="sm:w-48 flex-shrink-0" style={{ minHeight: "140px" }}>
                  {s.poster_url ? (
                    <img src={s.poster_url} alt={s.title} className="w-full h-full object-cover"
                      style={{ minHeight: "140px" }} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
                      style={{ minHeight: "140px", background: "linear-gradient(135deg, #1E3A5F 0%, #2d5080 100%)" }}>
                      <Calendar size={28} style={{ color: "rgba(212,165,116,0.5)" }} />
                      <span className="text-xs font-semibold tracking-widest uppercase text-center"
                        style={{ color: "rgba(212,165,116,0.6)", fontFamily: MONO }}>Upcoming</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date pill */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: "#1E3A5F" }}>
                    <div className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#D4A574", fontFamily: MONO }}>
                      {new Date(s.session_date + "T00:00:00").toLocaleString("default", { month: "short" })}
                    </div>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: SERIF, lineHeight: 1 }}>
                      {new Date(s.session_date + "T00:00:00").getDate()}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO }}>
                      {new Date(s.session_date + "T00:00:00").getFullYear()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1" style={{ color: "#1E3A5F", fontFamily: SERIF }}>
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-sm mb-2" style={{ color: "#6B7A8D", fontFamily: MONO }}>
                        {s.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: "#6B7A8D", fontFamily: MONO }}>
                      <Clock size={13} style={{ color: "#D4A574" }} />
                      {formatDate(s.session_date)}
                    </div>
                  </div>
                  <button className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: "#D4A574", color: "#1E3A5F", fontFamily: MONO }}>
                    Register
                  </button>
                </div>
              </div>
            ))}

            {/* Host a session CTA */}
            <div className="mt-8 p-8 rounded-2xl text-center" style={{ background: "#1E3A5F" }}>
              <Calendar size={28} className="mx-auto mb-4" style={{ color: "#D4A574" }} />
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: SERIF }}>
                Want to Host a Session?
              </h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)", fontFamily: MONO }}>
                Partner with PISH to bring a workshop or training to your school, church, or organization.
              </p>
              <button className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
                style={{ background: "#D4A574", color: "#1E3A5F", fontFamily: MONO }}>
                Contact Us to Partner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
