import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Trash2, Upload, Music, Image, CalendarDays,
  CheckCircle2, ArrowRight, Loader2, LogOut, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PastSession     = Tables<"past_sessions">;
type UpcomingSession = Tables<"upcoming_sessions">;

// ─── Route guard — redirect to /login if not authenticated ───────────────────

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "PISH | Admin Dashboard" },
      { name: "description", content: "Manage PISH sessions, posters and recordings." },
    ],
  }),
  component: AdminPage,
});

// ─── File upload helpers ──────────────────────────────────────────────────────

async function uploadFile(
  bucket: "posters" | "recordings",
  file: File,
): Promise<string> {
  const ext  = file.name.split(".").pop();
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Data hooks ───────────────────────────────────────────────────────────────

function usePastSessions() {
  const [items, setItems] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetch() {
    const { data, error } = await supabase
      .from("past_sessions")
      .select("*")
      .order("session_date", { ascending: false });
    if (!error) setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel("admin_past")
      .on("postgres_changes", { event: "*", schema: "public", table: "past_sessions" }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return { items, loading, refetch: fetch };
}

function useUpcomingSessions() {
  const [items, setItems] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetch() {
    const { data, error } = await supabase
      .from("upcoming_sessions")
      .select("*")
      .order("session_date", { ascending: true });
    if (!error) setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel("admin_upcoming")
      .on("postgres_changes", { event: "*", schema: "public", table: "upcoming_sessions" }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return { items, loading, refetch: fetch };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: "2px solid rgba(212,165,116,0.55)", background: "#000" }}
            >
              <img src="/PISH_Logo_1.jpeg" alt="PISH Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">PISH Admin Hub</h1>
              <p className="text-xs text-primary-foreground/60">
                {userEmail ?? "Content Manager"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm"
            className="text-primary-foreground hover:bg-white/10"
            onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Session Manager</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Announce upcoming meetings, then mark them as completed once done — or upload a
            past recording directly. Files are stored in Supabase Storage and appear on the
            user website instantly.
          </p>
        </div>
        <Separator className="mb-8" />

        <Tabs defaultValue="past">
          <TabsList className="mb-2">
            <TabsTrigger value="past" className="flex items-center gap-2">
              <Music className="h-4 w-4" /> Past Sessions
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Upcoming Meetings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="past" className="space-y-8 pt-6">
            <PastForm />
            <div>
              <h3 className="mb-4 text-base font-semibold">Published Recordings</h3>
              <PastList />
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-8 pt-6">
            <UpcomingForm />
            <div>
              <h3 className="mb-4 text-base font-semibold">Announced Meetings</h3>
              <UpcomingList />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ─── Past session form ────────────────────────────────────────────────────────

function PastForm() {
  const [title, setTitle]       = useState("");
  const [date, setDate]         = useState("");
  const [description, setDesc]  = useState("");
  const [poster, setPoster]     = useState<File | null>(null);
  const [recording, setRec]     = useState<File | null>(null);
  const [busy, setBusy]         = useState(false);
  const formRef                 = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const [poster_url, recording_url] = await Promise.all([
        poster    ? uploadFile("posters",    poster)    : Promise.resolve(null),
        recording ? uploadFile("recordings", recording) : Promise.resolve(null),
      ]);

      const { error } = await supabase.from("past_sessions").insert({
        title,
        session_date: date,
        description: description || null,
        poster_url,
        recording_url,
      });
      if (error) throw error;

      toast.success("Past session published");
      setTitle(""); setDate(""); setDesc(""); setPoster(null); setRec(null);
      formRef.current?.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-accent" /> Upload Past Session Recording
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Directly publish a completed session — files go to Supabase Storage and appear on the site immediately.
        </p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Session Title *</Label>
            <Input placeholder="e.g. Guarding Your Morning Season"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Session Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea placeholder="What was this session about?"
              value={description} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Image className="h-4 w-4 text-muted-foreground" /> Session Poster
            </Label>
            <Input type="file" accept="image/*"
              onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Music className="h-4 w-4 text-muted-foreground" /> Audio Recording
            </Label>
            <Input type="file" accept="audio/*,video/*"
              onChange={(e) => setRec(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground">MP3, WAV, M4A, MP4</p>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
                : <><Upload className="mr-2 h-4 w-4" /> Publish Recording</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Upcoming session form ────────────────────────────────────────────────────

function UpcomingForm() {
  const [title, setTitle]      = useState("");
  const [date, setDate]        = useState("");
  const [description, setDesc] = useState("");
  const [poster, setPoster]    = useState<File | null>(null);
  const [busy, setBusy]        = useState(false);
  const formRef                = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const poster_url = poster ? await uploadFile("posters", poster) : null;

      const { error } = await supabase.from("upcoming_sessions").insert({
        title,
        session_date: date,
        description: description || null,
        poster_url,
      });
      if (error) throw error;

      toast.success("Upcoming meeting announced");
      setTitle(""); setDate(""); setDesc(""); setPoster(null);
      formRef.current?.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-accent" /> Announce Upcoming Meeting
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add a future session. Use "Mark as Completed" once it has happened to move it to Past Sessions and attach the recording.
        </p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Session Title *</Label>
            <Input placeholder="e.g. The Purity-Purpose Connection"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea placeholder="Brief description of what this session covers…"
              value={description} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-1.5">
              <Image className="h-4 w-4 text-muted-foreground" /> Session Poster
            </Label>
            <Input type="file" accept="image/*"
              onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing…</>
                : <><Upload className="mr-2 h-4 w-4" /> Publish Upcoming Meeting</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Promote dialog (upcoming → past) ────────────────────────────────────────

function PromoteDialog({
  session, open, onClose,
}: {
  session: UpcomingSession;
  open: boolean;
  onClose: () => void;
}) {
  const [recording, setRec]  = useState<File | null>(null);
  const [poster, setPoster]  = useState<File | null>(null);
  const [busy, setBusy]      = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const [recording_url, poster_url] = await Promise.all([
        recording ? uploadFile("recordings", recording) : Promise.resolve(null),
        poster    ? uploadFile("posters",    poster)    : Promise.resolve(session.poster_url),
      ]);

      // Insert into past_sessions
      const { error: insertErr } = await supabase.from("past_sessions").insert({
        title:        session.title,
        session_date: session.session_date,
        description:  session.description,
        poster_url:   poster_url ?? session.poster_url,
        recording_url,
      });
      if (insertErr) throw insertErr;

      // Remove from upcoming_sessions
      const { error: deleteErr } = await supabase
        .from("upcoming_sessions")
        .delete()
        .eq("id", session.id);
      if (deleteErr) throw deleteErr;

      toast.success(`"${session.title}" moved to Past Sessions`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to promote session");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Mark Session as Completed
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{session.title}</span> will be moved
            to Past Sessions. Attach the recording now, or leave blank to add it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Music className="h-4 w-4 text-muted-foreground" /> Audio Recording
            </Label>
            <Input type="file" accept="audio/*,video/*"
              onChange={(e) => setRec(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground">MP3, WAV, M4A, MP4</p>
          </div>
          {!session.poster_url && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Image className="h-4 w-4 text-muted-foreground" /> Poster (optional)
              </Label>
              <Input type="file" accept="image/*"
                onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Moving…</>
                : <><ArrowRight className="mr-2 h-4 w-4" /> Move to Past Sessions</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Past Session Dialog ─────────────────────────────────────────────────

function EditPastDialog({
  session,
  open,
  onClose,
}: {
  session: PastSession;
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle]       = useState(session.title);
  const [date, setDate]         = useState(session.session_date);
  const [description, setDesc]  = useState(session.description ?? "");
  const [poster, setPoster]     = useState<File | null>(null);
  const [recording, setRec]     = useState<File | null>(null);
  const [busy, setBusy]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const poster_url    = poster    ? await uploadFile("posters",    poster)    : session.poster_url;
      const recording_url = recording ? await uploadFile("recordings", recording) : session.recording_url;

      const { error } = await supabase
        .from("past_sessions")
        .update({ title, session_date: date, description: description || null, poster_url, recording_url })
        .eq("id", session.id);
      if (error) throw error;

      toast.success("Session updated");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Past Session</DialogTitle>
          <DialogDescription>Update the session details. Leave file fields empty to keep existing files.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Image className="h-4 w-4 text-muted-foreground" /> Replace Poster
            </Label>
            <Input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />
            {session.poster_url && !poster && (
              <p className="text-xs text-muted-foreground">Current poster kept if empty</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Music className="h-4 w-4 text-muted-foreground" /> Replace Recording
            </Label>
            <Input type="file" accept="audio/*,video/*" onChange={(e) => setRec(e.target.files?.[0] ?? null)} />
            {session.recording_url && !recording && (
              <p className="text-xs text-muted-foreground">Current recording kept if empty</p>
            )}
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Upcoming Session Dialog ─────────────────────────────────────────────

function EditUpcomingDialog({
  session,
  open,
  onClose,
}: {
  session: UpcomingSession;
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle]      = useState(session.title);
  const [date, setDate]        = useState(session.session_date);
  const [description, setDesc] = useState(session.description ?? "");
  const [poster, setPoster]    = useState<File | null>(null);
  const [busy, setBusy]        = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const poster_url = poster ? await uploadFile("posters", poster) : session.poster_url;

      const { error } = await supabase
        .from("upcoming_sessions")
        .update({ title, session_date: date, description: description || null, poster_url })
        .eq("id", session.id);
      if (error) throw error;

      toast.success("Session updated");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Upcoming Meeting</DialogTitle>
          <DialogDescription>Update the meeting details. Leave poster empty to keep the existing one.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-1.5">
              <Image className="h-4 w-4 text-muted-foreground" /> Replace Poster
            </Label>
            <Input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />
            {session.poster_url && !poster && (
              <p className="text-xs text-muted-foreground">Current poster kept if empty</p>
            )}
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PastList() {
  const { items, loading } = usePastSessions();
  const [editing, setEditing] = useState<PastSession | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    const { error } = await supabase.from("past_sessions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Deleted");
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );

  if (!items.length) return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">No past sessions yet.</p>
    </div>
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Card key={s.id} className="overflow-hidden flex flex-col">
            {s.poster_url && (
              <img src={s.poster_url} alt={s.title} className="aspect-video w-full object-cover" />
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">{s.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {new Date(s.session_date + "T00:00:00").toLocaleDateString(undefined, {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-end">
              {s.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
              )}
              {s.recording_url && (
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Music className="h-3 w-3 text-accent" />
                  <span>Recording attached</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(s)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <EditPastDialog
          session={editing}
          open={true}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// ─── Upcoming sessions list ───────────────────────────────────────────────────

function UpcomingList() {
  const { items, loading } = useUpcomingSessions();
  const [promoting, setPromoting] = useState<UpcomingSession | null>(null);
  const [editing, setEditing]     = useState<UpcomingSession | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    const { error } = await supabase.from("upcoming_sessions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Deleted");
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );

  if (!items.length) return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">No upcoming sessions yet.</p>
    </div>
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Card key={s.id} className="overflow-hidden flex flex-col">
            {s.poster_url && (
              <img src={s.poster_url} alt={s.title} className="aspect-video w-full object-cover" />
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">{s.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {new Date(s.session_date + "T00:00:00").toLocaleDateString(undefined, {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 flex-1 flex flex-col justify-end">
              {s.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="secondary" className="flex-1"
                  onClick={() => setPromoting(s)}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Completed
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {promoting && (
        <PromoteDialog session={promoting} open={true} onClose={() => setPromoting(null)} />
      )}
      {editing && (
        <EditUpcomingDialog session={editing} open={true} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
