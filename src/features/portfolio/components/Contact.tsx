"use client";

import { useState } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Key, Mail, Github, Linkedin, Contact2 } from "lucide-react";

export function Contact({ initialProfile }: { initialProfile?: any }) {
  const { t, isAdmin } = useAppContext();
  const [clickCount, setClickCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleClick = () => {
    if (isAdmin) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 3) {
      setShowPassword(true);
      setClickCount(0);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@portfolio.local",
      password: password,
    });

    if (signInError) {
      setError(t.admin.loginError);
    } else {
      setShowPassword(false);
      setPassword("");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  }

  return (
    <section id="contact" className="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col font-sans relative">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold tracking-tight text-foreground" onClick={handleTitleClick}>Contact</h2>
      </div>

      <div className="flex flex-col gap-4 text-sm">
        <p className="text-muted-foreground mb-4">
          Feel free to reach out for collaborations or just a friendly hello.
        </p>

        {initialProfile?.email && (
          <a href={`mailto:${initialProfile.email}`} className="flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors max-w-max">
            <Mail className="w-4 h-4" />
            <span className="font-mono">{initialProfile.email}</span>
          </a>
        )}
        {initialProfile?.github_url && (
          <a href={initialProfile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors max-w-max">
            <Github className="w-4 h-4" />
            <span className="font-mono">@{initialProfile.github_url.split('/').pop()}</span>
          </a>
        )}
        {initialProfile?.linkedin_url && (
          <a href={initialProfile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors max-w-max">
            <Linkedin className="w-4 h-4" />
            <span className="font-mono">LinkedIn</span>
          </a>
        )}
      </div>

      {showPassword && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-xl border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Key className="w-4 h-4 text-foreground" />
                <h3 className="font-bold text-lg">{t.admin.editMode}</h3>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.admin.passwordPrompt}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-foreground text-sm"
                  autoFocus
                />
                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowPassword(false); setClickCount(0); }} className="flex-1 px-3 py-2 rounded-md border border-border hover:bg-muted font-medium text-sm transition-colors"> Cancel </button>
                  <button type="submit" disabled={loading || !password} className="flex-1 px-3 py-2 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center text-sm">
                    {loading ? "..." : t.admin.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="mt-8 relative z-10">
          <button onClick={handleLogout} className="text-xs font-mono font-medium text-red-500 hover:text-red-400 transition underline underline-offset-4">
            {t.admin.exitEdit}
          </button>
        </div>
      )}
    </section>
  );
}
