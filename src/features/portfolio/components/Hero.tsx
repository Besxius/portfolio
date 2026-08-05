"use client";

import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/components/providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Check, X, Mail, Facebook, Linkedin, Download, MapPin, Code2, Briefcase, Github, Instagram, Volume2, Link as LinkIcon, Phone, Clock, User, MessageSquare, Youtube, Twitter } from "lucide-react";

export function Hero({ initialProfile, initialStats }: { initialProfile: any, initialStats?: any }) {
  const { t, isAdmin, language } = useAppContext();
  const defaultProfile = {
    full_name: "Le Duc Trong",
    title: "Software Engineering Student", title_vi: "Sinh viên Kỹ thuật Phần mềm",
    bio: "", bio_vi: "",
    avatar_url: "", avatar_x: 50, avatar_y: 50, avatar_scale: 1,
    cv_url: "",
    email: "", location: "Vietnam / Remote", work_format: "Full-time / Freelancer",
    github_url: "", linkedin_url: "", facebook_url: "", instagram_url: "",
    stats_languages: 4, stats_tools: 6, stats_experience: 2,
    skills: [] // Legacy
  };

  const [profile, setProfile] = useState(initialProfile || defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

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
    dragStartPercent.current = { x: Number(formData.avatar_x) || 50, y: Number(formData.avatar_y) || 50 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const scale = Number(formData.avatar_scale) || 1;
    const deltaX = (e.clientX - dragStartPos.current.x) * -0.5 / scale;
    const deltaY = (e.clientY - dragStartPos.current.y) * -0.5 / scale;
    setFormData({
      ...formData,
      avatar_x: Math.max(0, Math.min(100, dragStartPercent.current.x + deltaX)),
      avatar_y: Math.max(0, Math.min(100, dragStartPercent.current.y + deltaY))
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
          {/* Admin editing form remains unchanged in structure, just styled slightly for dark mode */}
          <div className="flex justify-between border-b border-border pb-4">
            <h3 className="font-bold text-xl font-mono text-foreground">Edit Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.full_name || ""} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="English Name" />
                <input value={formData.full_name_vi || ""} onChange={e => setFormData({ ...formData, full_name_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="Vietnamese Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="Title (EN)" />
                <input value={formData.title_vi || ""} onChange={e => setFormData({ ...formData, title_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="Title (VI)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <textarea value={formData.bio || ""} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none h-24" placeholder="Bio (EN)" />
                <textarea value={formData.bio_vi || ""} onChange={e => setFormData({ ...formData, bio_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none h-24" placeholder="Bio (VI)" />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="Email" />
                <input value={formData.github_url || ""} onChange={e => setFormData({ ...formData, github_url: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="Github URL" />
                <input value={formData.linkedin_url || ""} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="LinkedIn URL" />
                <input value={formData.facebook_url || ""} onChange={e => setFormData({ ...formData, facebook_url: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none" placeholder="Facebook URL" />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Location</label>
                  <input value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground transition-all text-sm outline-none mt-1" placeholder="Vietnam, USA" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center p-6 bg-background/50 rounded-xl border border-border">
                <label className="cursor-pointer bg-foreground text-background px-6 py-2.5 rounded-md text-sm font-medium mb-6 flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Avatar"}
                </label>
                {formData.avatar_url && (
                  <div className="w-full flex flex-col items-center bg-card p-6 rounded-xl border border-border">
                    <div className="w-32 h-32 rounded-full border-2 border-border relative bg-muted cursor-move overflow-hidden mb-6"
                      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
                      <img src={formData.avatar_url} draggable="false" className="w-full h-full object-cover pointer-events-none"
                        style={{ objectPosition: `${formData.avatar_x || 50}% ${formData.avatar_y || 50}%`, transform: `scale(${formData.avatar_scale || 1})` }} />
                    </div>
                    
                    <div className="w-full space-y-4 text-xs font-mono">
                      <div className="flex flex-col gap-1 w-full">
                         <span className="text-muted-foreground">Zoom</span>
                         <input type="range" min="1" max="4" step="0.1" value={formData.avatar_scale || 1} onChange={e => setFormData({ ...formData, avatar_scale: e.target.value })} className="w-full" />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                         <span className="text-muted-foreground">X Position</span>
                         <input type="range" min="0" max="100" step="1" value={formData.avatar_x || 50} onChange={e => setFormData({ ...formData, avatar_x: e.target.value })} className="w-full" />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                         <span className="text-muted-foreground">Y Position</span>
                         <input type="range" min="0" max="100" step="1" value={formData.avatar_y || 50} onChange={e => setFormData({ ...formData, avatar_y: e.target.value })} className="w-full" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="w-full mt-6 pt-6 border-t border-border flex flex-col items-center">
                  <label className="cursor-pointer bg-card text-foreground border border-border px-6 py-2.5 rounded-md text-sm font-medium mb-2 flex items-center gap-2 hover:bg-muted transition-colors">
                    <input type="file" accept=".pdf,application/pdf" onChange={handleCVUpload} className="hidden" />
                    {uploadingCV ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload New CV (PDF)"}
                  </label>
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
          
          {/* Top Decorative Graphic (Abstract Isometric Cubes placeholder) */}
          <div className="w-full flex justify-center mb-16 opacity-30 pointer-events-none select-none relative h-48 border-b border-border/50">
             {/* Using simple SVG to mock the isometric wireframe cubes */}
             <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0">
                <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
                  <path d="M200 50 L250 75 L200 100 L150 75 Z" />
                  <path d="M150 75 L150 125 L200 150 L200 100" />
                  <path d="M250 75 L250 125 L200 150 L200 100" />
                  <path d="M120 90 L170 115 L120 140 L70 115 Z" />
                  <path d="M70 115 L70 165 L120 190 L120 140" />
                  <path d="M170 115 L170 165 L120 190 L120 140" />
                  <path d="M280 90 L330 115 L280 140 L230 115 Z" />
                  <path d="M230 115 L230 165 L280 190 L280 140" />
                  <path d="M330 115 L330 165 L280 190 L280 140" />
                </g>
                <text x="380" y="190" fill="currentColor" fontSize="10" fontFamily="monospace" textAnchor="end" opacity="0.5">FIG_001</text>
             </svg>
          </div>

          <div className="border border-border/50 rounded-sm bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col relative -mt-32 z-20">
            {/* Header row: Profile Avatar & Name */}
            <div className="flex items-end gap-6 p-6 md:p-8 border-b border-border/50 relative">
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                 {profile.avatar_url && (
                   <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover"
                        style={{ objectPosition: `${profile.avatar_x || 50}% ${profile.avatar_y || 50}%`, transform: `scale(${profile.avatar_scale || 1})` }} />
                 )}
               </div>
               <div className="flex flex-col gap-2 pb-2">
                 <div className="flex items-center gap-2">
                   <h1 className="text-2xl md:text-3xl font-sans font-bold text-foreground tracking-tight">{displayFullName}</h1>
                   <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center">
                     <Check className="w-3 h-3" strokeWidth={3} />
                   </div>
                   <Volume2 className="w-4 h-4 text-muted-foreground ml-1" />
                 </div>
                 <p className="text-sm text-muted-foreground font-mono">
                   I am a {displayTitle.toLowerCase()}.
                 </p>
               </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50 text-xs text-muted-foreground font-mono">
               {/* Left Column */}
               <div className="flex flex-col p-6 gap-4">
                 <div className="flex items-center gap-4">
                   <Code2 className="w-4 h-4 shrink-0" />
                   <span className="truncate">{displayTitle} <span className="text-foreground">@portfolio</span></span>
                 </div>
                 <div className="flex items-center gap-4">
                   <Briefcase className="w-4 h-4 shrink-0" />
                   <span className="truncate">Freelancer / Creator</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <MapPin className="w-4 h-4 shrink-0" />
                   <span className="truncate">{profile.location}</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <Phone className="w-4 h-4 shrink-0" />
                   <span className="truncate">+84 123 456 789</span> {/* Placeholder phone */}
                 </div>
                 <div className="flex items-center gap-4">
                   <LinkIcon className="w-4 h-4 shrink-0" />
                   <a href="#" className="truncate hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground">trọng.dev</a>
                 </div>
               </div>

               {/* Right Column */}
               <div className="flex flex-col p-6 gap-4">
                 <div className="flex items-center gap-4">
                   <Clock className="w-4 h-4 shrink-0" />
                   <span className="truncate">{currentTime || "Loading..."} <span className="opacity-50">// same time</span></span>
                 </div>
                 <div className="flex items-center gap-4">
                   <Mail className="w-4 h-4 shrink-0" />
                   <a href={`mailto:${profile.email}`} className="truncate hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground">{profile.email || "hello@example.com"}</a>
                 </div>
                 <div className="flex items-center gap-4">
                   <User className="w-4 h-4 shrink-0" />
                   <span className="truncate">he/him</span>
                 </div>
               </div>
            </div>

            {/* Social Links Bar */}
            <div className="border-t border-border/50 p-6 flex gap-4">
               {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Github className="w-4 h-4" /></a>}
               {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Linkedin className="w-4 h-4" /></a>}
               <a href="#" className="w-8 h-8 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Twitter className="w-4 h-4" /></a>
               <a href={profile.cv_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><LinkIcon className="w-4 h-4" /></a>
               {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Facebook className="w-4 h-4" /></a>}
            </div>

            {/* Contribution Graph (Mock) */}
            <div className="border-t border-border/50 p-6 flex flex-col gap-3">
               <div className="flex text-[10px] uppercase tracking-wider text-muted-foreground gap-8 mb-1">
                 <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
               </div>
               <div className="grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto pb-2" style={{ gridAutoColumns: 'max-content' }}>
                 {Array.from({ length: 364 }).map((_, i) => {
                    const intensity = Math.random();
                    let bgColor = 'bg-border/30';
                    if (intensity > 0.9) bgColor = 'bg-foreground';
                    else if (intensity > 0.7) bgColor = 'bg-foreground/70';
                    else if (intensity > 0.4) bgColor = 'bg-foreground/40';
                    else if (intensity > 0.2) bgColor = 'bg-foreground/20';

                    return <div key={i} className={`w-3 h-3 rounded-[2px] ${bgColor} transition-colors hover:border hover:border-foreground`}></div>
                 })}
               </div>
               <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
                 <span>2,141 contributions in the past 365 days.</span>
                 <div className="flex items-center gap-1">
                   <span>Less</span>
                   <div className="w-3 h-3 bg-border/30 rounded-[2px]"></div>
                   <div className="w-3 h-3 bg-foreground/20 rounded-[2px]"></div>
                   <div className="w-3 h-3 bg-foreground/40 rounded-[2px]"></div>
                   <div className="w-3 h-3 bg-foreground/70 rounded-[2px]"></div>
                   <div className="w-3 h-3 bg-foreground rounded-[2px]"></div>
                   <span>More</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-16 text-sm font-sans space-y-4 px-4 text-muted-foreground max-w-3xl border-t border-border/50 pt-10">
             <h3 className="font-serif italic text-2xl text-foreground mb-6">Good evening</h3>
             
             {displayBio ? (
               <div className="space-y-4 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-border/50">
                 {displayBio}
               </div>
             ) : (
               <ul className="space-y-4 list-disc pl-5 leading-relaxed">
                 <li>I'm <span className="text-foreground font-semibold">{displayFullName}</span> — a {displayTitle} with a passion for clean code, solid architecture, and pixel-perfect UI.</li>
                 <li>Focused on exploring new technologies and turning ideas into reality through polished, thoughtfully crafted projects.</li>
                 <li>Available for full-time roles, freelance projects, and open-source contributions.</li>
               </ul>
             )}
          </div>
        </div>
      )}
    </section>
  );
}
