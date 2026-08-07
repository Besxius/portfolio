"use client";

import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Check, X, Mail, Facebook, Linkedin, Download, MapPin, Code2, Briefcase, Github, Instagram, Volume2, Link as LinkIcon, Phone, Clock, User, MessageSquare, Youtube, Twitter, Activity, Grid, Terminal, FolderArchive, FolderOpen } from "lucide-react";
import LogoLoop from "@/components/ui/logo-loop";
import SplitFlapText from "@/components/ui/split-flap-text";
import { TLMarkIsometric } from "@/components/ui/tl-mark-isometric";
import { TLMarkLightRays } from "@/components/ui/tl-mark-light-rays";
import SpecularButton from "@/components/ui/specular-button";

export function Hero({ initialProfile, initialStats }: { initialProfile: any, initialStats?: any }) {
  const { t, isAdmin, language, colorTheme } = useAppContext();
  const accentColor = colorTheme === "blue" ? "#38bdf8" : "#34d399";

  const defaultProfile = {
    full_name: "Le Duc Trong",
    title: "Software Engineering Student", title_vi: "Sinh viên Kỹ thuật Phần mềm",
    bio: "", bio_vi: "",
    avatar_url: "", avatar_x: 50, avatar_y: 50, avatar_scale: 1,
    cv_url: "",
    email: "", location: "Vietnam / Remote", work_format: "Full-time / Freelancer",
    gender: "he/him",
    github_url: "", linkedin_url: "", facebook_url: "", instagram_url: "",
    stats_languages: 4, stats_tools: 6, stats_experience: 2,
    skills: [] // Legacy
  };

  const [profile, setProfile] = useState(initialProfile || defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [currentTime, setCurrentTime] = useState("");
  const [timeDiffText, setTimeDiffText] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: true }));

      const viewerOffsetMinutes = -now.getTimezoneOffset();
      const profileOffsetMinutes = 420; // UTC+7 Vietnam
      const diffMinutes = profileOffsetMinutes - viewerOffsetMinutes;

      if (diffMinutes === 0) {
        setTimeDiffText(language === 'vi' ? "cùng múi giờ" : "same time");
      } else {
        const absHours = Math.abs(diffMinutes / 60);
        const formattedHours = Number.isInteger(absHours) ? absHours.toString() : absHours.toFixed(1);
        if (diffMinutes > 0) {
          setTimeDiffText(language === 'vi' ? `đi trước ${formattedHours}h` : `${formattedHours}h ahead`);
        } else {
          setTimeDiffText(language === 'vi' ? `đi sau ${formattedHours}h` : `${formattedHours}h behind`);
        }
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [language]);

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCV(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `cv_${Math.random()}.${fileExt}`;
    const filePath = `profile/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (!uploadError) {
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
      setFormData({ ...formData, cv_url: data.publicUrl });
    } else {
      console.error(uploadError);
      alert("Failed to upload CV. Please check your storage permissions.");
    }
    setUploadingCV(false);
  };

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartPercent = useRef({ x: 50, y: 50 });

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...formData, full_name: formData.full_name || "Le Duc Trong" };

    let res;
    if (profile.id) {
      res = await supabase.from('profiles').update(payload).eq('id', profile.id).select();
    } else {
      res = await supabase.from('profiles').insert([payload]).select();
    }

    if (!res.error && res.data) {
      setProfile(res.data[0]);
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${Math.random()}.${fileExt}`;
    const filePath = `profile/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (!uploadError) {
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
      setFormData({ ...formData, avatar_url: data.publicUrl, avatar_scale: 1, avatar_x: 50, avatar_y: 50 });
    }
    setUploadingImage(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditing || !formData.avatar_url) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartPercent.current = { x: Number(formData.avatar_x) ?? 50, y: Number(formData.avatar_y) ?? 50 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const scale = Number(formData.avatar_scale) || 1;
    const deltaX = (e.clientX - dragStartPos.current.x) * 0.3 / scale;
    const deltaY = (e.clientY - dragStartPos.current.y) * 0.3 / scale;
    setFormData({
      ...formData,
      avatar_x: Math.max(0, Math.min(100, Math.round(dragStartPercent.current.x - deltaX))),
      avatar_y: Math.max(0, Math.min(100, Math.round(dragStartPercent.current.y - deltaY)))
    });
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) { setIsDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); }
  };

  const displayFullName = language === 'vi' ? (profile.full_name_vi || profile.full_name || "Lê Đức Trọng") : (profile.full_name || "Le Duc Trong");
  const displayTitle = language === 'vi' ? (profile.title_vi || profile.title || defaultProfile.title_vi) : (profile.title || defaultProfile.title);
  const displayBio = language === 'vi' ? (profile.bio_vi || profile.bio) : profile.bio;

  return (
    <section className="pt-24 pb-12 relative group flex flex-col justify-center min-h-[85vh]">
      {isAdmin && !isEditing && (
        <button onClick={() => { setFormData(profile); setIsEditing(true); }} className="absolute top-28 right-4 flex items-center gap-2 px-4 py-2 hover:bg-muted bg-card text-foreground border border-border rounded-md font-sans font-medium text-xs z-40 transition-colors">
          <Edit2 className="w-3.5 h-3.5" /> Edit Data
        </button>
      )}

      {isEditing ? (
        <div className="space-y-6 max-w-5xl bg-card p-8 rounded-xl border border-border shadow-2xl mx-auto w-full z-10 font-sans">
          <div className="flex justify-between border-b border-border pb-4 items-center">
            <h3 className="font-bold text-xl font-mono text-foreground flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Profile Data
            </h3>
            <span className="text-xs text-muted-foreground font-mono">Admin Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Form Fields with explicit Labels/Tags */}
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">English Name</label>
                    <input value={formData.full_name || ""} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="English Name" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Vietnamese Name</label>
                    <input value={formData.full_name_vi || ""} onChange={e => setFormData({ ...formData, full_name_vi: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="Vietnamese Name" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Professional Title</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Title (EN)</label>
                    <input value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="Title (EN)" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Title (VI)</label>
                    <input value={formData.title_vi || ""} onChange={e => setFormData({ ...formData, title_vi: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="Title (VI)" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Biography</span>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Bio (EN) — English Biography</label>
                    <textarea value={formData.bio || ""} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-3.5 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none h-32 mt-1 font-sans leading-relaxed" placeholder="Bio (EN)" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Bio (VI) — Vietnamese Biography</label>
                    <textarea value={formData.bio_vi || ""} onChange={e => setFormData({ ...formData, bio_vi: e.target.value })} className="w-full px-3.5 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none h-32 mt-1 font-sans leading-relaxed" placeholder="Bio (VI)" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Contact & Social Links</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Email</label>
                    <input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="Email" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">GitHub URL</label>
                    <input value={formData.github_url || ""} onChange={e => setFormData({ ...formData, github_url: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="GitHub URL" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">LinkedIn URL</label>
                    <input value={formData.linkedin_url || ""} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="LinkedIn URL" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Facebook URL</label>
                    <input value={formData.facebook_url || ""} onChange={e => setFormData({ ...formData, facebook_url: e.target.value })} className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" placeholder="Facebook URL" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Location & Personal Details</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Location / Country</label>
                    <input
                      list="country-options"
                      value={formData.location || ""}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1"
                      placeholder="e.g. Vietnam / Remote"
                    />
                    <datalist id="country-options">
                      <option value="Vietnam" />
                      <option value="Vietnam / Remote" />
                      <option value="United States" />
                      <option value="Japan" />
                      <option value="Singapore" />
                      <option value="Australia" />
                      <option value="United Kingdom" />
                      <option value="Canada" />
                      <option value="Germany" />
                      <option value="Remote / Worldwide" />
                    </datalist>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Gender / Pronouns</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { label: "he/him", value: "he/him" },
                        { label: "she/her", value: "she/her" },
                        { label: "they/them", value: "they/them" }
                      ].map(option => (
                        <label
                          key={option.value}
                          className={`cursor-pointer px-3 py-1.5 rounded-md border text-xs font-mono transition-all flex items-center gap-2 select-none ${(formData.gender || "he/him") === option.value
                              ? "border-foreground bg-foreground/10 text-foreground font-semibold shadow-sm"
                              : "border-border bg-background hover:bg-muted text-muted-foreground"
                            }`}
                        >
                          <input
                            type="radio"
                            name="gender-radio"
                            value={option.value}
                            checked={(formData.gender || "he/him") === option.value}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            className="accent-foreground w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media Uploads & Avatar Position Adjustments */}
            <div className="space-y-6">
              <div className="flex flex-col items-center p-6 bg-background/50 rounded-xl border border-border space-y-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider self-start">Avatar Configuration</span>

                <label className="cursor-pointer bg-foreground text-background px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload New Avatar"}
                </label>

                {formData.avatar_url && (
                  <div className="w-full flex flex-col items-center bg-card p-6 rounded-xl border border-border space-y-4">
                    <div className="w-36 h-36 rounded-full border-2 border-border relative bg-muted cursor-grab active:cursor-grabbing overflow-hidden shadow-inner group"
                      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
                      <img src={formData.avatar_url} draggable="false" className="w-full h-full object-cover pointer-events-none select-none"
                        style={{ objectPosition: `${formData.avatar_x ?? 50}% ${formData.avatar_y ?? 50}%`, transform: `scale(${formData.avatar_scale || 1})` }} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-white text-center p-2 pointer-events-none">
                        Drag to position avatar
                      </div>
                    </div>

                    <div className="w-full space-y-3 text-xs font-mono">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Zoom Scale</span>
                          <span className="text-foreground font-semibold">{formData.avatar_scale || 1}x</span>
                        </div>
                        <input type="range" min="1" max="4" step="0.1" value={formData.avatar_scale || 1} onChange={e => setFormData({ ...formData, avatar_scale: Number(e.target.value) })} className="w-full accent-foreground" />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Position X (Horizontal)</span>
                          <span className="text-foreground font-semibold">{formData.avatar_x ?? 50}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="1" value={formData.avatar_x ?? 50} onChange={e => setFormData({ ...formData, avatar_x: Number(e.target.value) })} className="w-full accent-foreground" />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Position Y (Vertical)</span>
                          <span className="text-foreground font-semibold">{formData.avatar_y ?? 50}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="1" value={formData.avatar_y ?? 50} onChange={e => setFormData({ ...formData, avatar_y: Number(e.target.value) })} className="w-full accent-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                {/* CV PDF Upload & Status Tag */}
                <div className="w-full pt-4 border-t border-border flex flex-col items-center space-y-3">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider self-start">Curriculum Vitae (PDF)</span>

                  <label className="cursor-pointer bg-card text-foreground border border-border px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
                    <input type="file" accept=".pdf,application/pdf" onChange={handleCVUpload} className="hidden" />
                    {uploadingCV ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload New CV (PDF)"}
                  </label>

                  {formData.cv_url && (
                    <div className="w-full p-3 bg-muted/50 rounded-lg border border-border/80 flex items-center gap-3">
                      <FolderOpen className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex flex-col overflow-hidden text-xs">
                        <span className="font-semibold text-foreground truncate">
                          {formData.cv_url.split('/').pop()?.split('?')[0] || "document.pdf"}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">PDF File Ready</span>
                      </div>
                      <a href={formData.cv_url} target="_blank" rel="noreferrer" className="ml-auto text-[10px] underline text-muted-foreground hover:text-foreground">
                        Preview
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-border mt-8">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-border rounded-md font-medium text-sm">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="px-8 py-2 bg-foreground text-background font-medium rounded-md flex items-center text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full z-10 font-mono flex flex-col relative">
          <div className="border border-border/50 rounded-sm bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col relative z-20">
            {/* Header row: Profile Avatar & Name with integrated 3D 'TL' Mark + WebGL Light Rays as Full Background */}
            <div className="flex items-end gap-6 p-6 md:p-8 border-b border-border/50 relative overflow-hidden min-h-[260px] md:min-h-[300px]">
              {/* Integrated Top Decorative Graphic Background */}
              <TLMarkLightRays raysColor={accentColor} raysOrigin="top-right" />

              {/* Header profile content */}
              <div className="relative z-10 flex items-end gap-6 w-full">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                  {profile.avatar_url && (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover"
                      style={{ objectPosition: `${profile.avatar_x ?? 50}% ${profile.avatar_y ?? 50}%`, transform: `scale(${profile.avatar_scale || 1})` }} />
                  )}
                </div>
                <div className="flex flex-col gap-2 pb-2">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl md:text-3xl font-sans font-bold text-foreground tracking-tight leading-none">{displayFullName}</h1>
                    <div className="w-5 h-5 rounded-full bg-foreground text-background inline-flex items-center justify-center shrink-0 self-center">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    I am a {displayTitle.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50 text-sm text-muted-foreground font-mono">
              {/* Left Column */}
              <div className="flex flex-col p-6 gap-4">
                <div className="flex items-center gap-4">
                  <Code2 className="w-5 h-5 shrink-0" />
                  <span className="truncate">{displayTitle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Briefcase className="w-5 h-5 shrink-0" />
                  <span className="truncate">Freelancer / Full time</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 shrink-0" />
                  <span className="truncate">+84 378 661 398</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col p-6 gap-4">
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 shrink-0" />
                  <span className="truncate">{currentTime || "Loading..."} <span className="opacity-50">// {timeDiffText || "same time"}</span></span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 shrink-0" />
                  <a href={`mailto:${profile.email}`} className="truncate hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground">{profile.email || "hello@example.com"}</a>
                </div>
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 shrink-0" />
                  <span className="truncate">{profile.gender || "he/him"}</span>
                </div>
              </div>
            </div>

            {/* Social Links Bar */}
            <div className="border-t border-border/50 p-6 flex items-center gap-4">
              {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Github className="w-5 h-5" /></a>}
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Linkedin className="w-5 h-5" /></a>}
              <a href="#" className="w-10 h-10 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Twitter className="w-5 h-5" /></a>
              {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Facebook className="w-5 h-5" /></a>}

              {/* CV SpecularButton triggering popup modal */}
              <div className="ml-auto shrink-0">
                <SpecularButton
                  size="sm"
                  radius={8}
                  autoAnimate={true}
                  speed={0.4}
                  baseColor="#3f3f46"
                  lineColor="#ffffff"
                  tint={accentColor}
                  tintOpacity={0.12}
                  onClick={() => setShowCvModal(true)}
                  className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider px-4 py-2.5"
                >
                  <span>CV / Resume</span>
                </SpecularButton>
              </div>
            </div>

            {/* Split Flap Board (Prominent 1.5x Display - Contribution Graph Removed) */}
            <div className="border-t border-border/50 p-6 md:p-8 flex flex-col gap-5 bg-card/30">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/80 flex items-center gap-2 font-mono">
                  <Terminal className="w-4 h-4" style={{ color: accentColor }} />
                  System Status Board
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2.5 py-1 rounded bg-muted/60 border border-border/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></span>
                  Live Signal
                </span>
              </div>

              <div className="py-10 px-4 md:px-8 bg-background/90 rounded-xl border border-border/60 flex flex-col items-center justify-center overflow-x-auto min-h-[180px] shadow-inner">
                <SplitFlapText
                  words={[
                    'LE DUC TRONG',
                    'FULLSTACK DEV',
                    'REACT & NEXTJS',
                    'SIGNAL ONLINE',
                    'AVAILABLE NOW',
                    'CLEAN ARCHITECTURE'
                  ]}
                  fontSize="clamp(28px, 5.2vw, 54px)"
                  gap={8}
                  tileRadius={8}
                  padTo={14}
                  className="max-w-full"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-16 text-base font-sans space-y-6 px-4 md:px-6 text-muted-foreground max-w-4xl border-t border-border/50 pt-12">
            <h3 className="font-serif italic text-3xl md:text-4xl text-foreground mb-8">Good evening</h3>

            {displayBio ? (
              <div className="space-y-6 leading-relaxed whitespace-pre-wrap text-base md:text-lg pl-6 border-l-2 border-primary/40 text-foreground/90 font-sans tracking-wide">
                {displayBio}
              </div>
            ) : (
              <ul className="space-y-4 list-disc pl-6 leading-relaxed text-base md:text-lg">
                <li>I'm <span className="text-foreground font-semibold">{displayFullName}</span> — a {displayTitle} with a passion for clean code, solid architecture, and pixel-perfect UI.</li>
                <li>Focused on exploring new technologies and turning ideas into reality through polished, thoughtfully crafted projects.</li>
                <li>Available for full-time roles, freelance projects, and open-source contributions.</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* CV PDF Popup Modal */}
      {showCvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="max-w-5xl w-full h-[85vh] bg-card border border-border rounded-xl flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 font-mono">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Curriculum Vitae (PDF)</h3>
              </div>
              <div className="flex items-center gap-3">
                {profile.cv_url && (
                  <a
                    href={profile.cv_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
                <button
                  onClick={() => setShowCvModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Close CV viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Viewer */}
            <div className="flex-1 bg-neutral-900 relative">
              {profile.cv_url ? (
                <iframe
                  src={profile.cv_url}
                  className="w-full h-full border-0"
                  title="CV PDF Document Viewer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center font-mono">
                  <FolderOpen className="w-12 h-12 mb-3 opacity-40" />
                  <p>No CV document uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
