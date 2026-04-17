"use client";

import { useState } from "react";
import { useAppContext } from "./providers";
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
    <section id="contact" className="py-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
        <div className="h-16 w-px border-l-2 border-dashed border-primary/30" />
      </div>

      <div className="text-center mb-16 relative z-10 pt-16">
        <div className="flex justify-center mb-8">
          <Contact2 className="w-24 h-24 text-primary opacity-80" />
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-sans font-bold tracking-tight mb-6 text-primary">
          {t.sections.contactTitle}
        </h2>
        <div className="flex items-center justify-center mb-8">
          <div className="h-[2px] w-12 bg-primary/20" />
          <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] mx-4" />
          <div className="h-[2px] w-12 bg-primary/20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 relative z-10">
        {initialProfile?.email && (
          <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${initialProfile.email}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-card border border-border/60 shadow-xl hover:-translate-y-2 hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 group min-w-[280px]">
            <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300"><Mail className="w-6 h-6" /></div>
            <div className="flex flex-col text-left"><span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Email</span><span className="font-sans font-semibold truncate max-w-[220px]">{initialProfile.email}</span></div>
          </a>
        )}
        {initialProfile?.github_url && (
          <a href={initialProfile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-card border border-border/60 shadow-xl hover:-translate-y-2 hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 group min-w-[280px]">
            <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300"><Github className="w-6 h-6" /></div>
            <div className="flex flex-col text-left"><span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">GitHub</span><span className="font-sans font-semibold truncate max-w-[220px]">@{initialProfile.github_url.split('/').pop()}</span></div>
          </a>
        )}
        {initialProfile?.linkedin_url && (
          <a href={initialProfile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-card border border-border/60 shadow-xl hover:-translate-y-2 hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 group min-w-[280px]">
            <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300"><Linkedin className="w-6 h-6" /></div>
            <div className="flex flex-col text-left"><span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">LinkedIn</span><span className="font-sans font-semibold truncate max-w-[220px]">Profile</span></div>
          </a>
        )}
      </div>

      {showPassword && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xl">{t.admin.editMode}</h3>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.admin.passwordPrompt}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  autoFocus
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowPassword(false); setClickCount(0); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-input hover:bg-muted font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.admin.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="mt-12 text-center relative z-10">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-500 hover:text-red-600 transition underline underline-offset-4"
          >
            {t.admin.exitEdit}
          </button>
        </div>
      )}

      {/* Secret Admin Button */}
      <button
        className="absolute bottom-2 right-2 w-16 h-16 opacity-0 hover:opacity-10 cursor-default"
        onClick={handleTitleClick}
        aria-label="Admin Access"
      />
    </section>
  );
}
