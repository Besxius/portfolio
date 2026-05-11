"use client";

import { useState, useRef } from "react";
import { useAppContext } from "./providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Check, X, Mail, Facebook, Linkedin, Move, Download, MapPin, Code2, Briefcase, Github, Instagram } from "lucide-react";

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
    <section className="pt-32 pb-24 relative group flex flex-col justify-center min-h-[85vh]">
      {isAdmin && !isEditing && (
        <button onClick={() => { setFormData(profile); setIsEditing(true); }} className="absolute top-36 right-4 md:right-8 xl:right-16 flex items-center gap-2 px-6 py-2.5 hover:bg-primary/20 bg-primary/10 text-primary border border-primary/50 rounded-xl font-sans font-bold text-sm shadow-md backdrop-blur-md transition-all hover:scale-105 z-40">
          <Edit2 className="w-4 h-4" /> {t.admin.editProfile || "Edit Profile"}
        </button>
      )}

      {isEditing ? (
        <div className="space-y-6 max-w-5xl bg-card/90 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-2xl mx-auto w-full z-10">
          <div className="flex justify-between border-b border-border pb-4">
            <h3 className="font-extrabold text-xl font-mono text-primary">&lt; Edit_Profile /&gt;</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.full_name || ""} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" placeholder="English Name" />
                <input value={formData.full_name_vi || ""} onChange={e => setFormData({ ...formData, full_name_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" placeholder="Vietnamese Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Title (EN)" />
                <input value={formData.title_vi || ""} onChange={e => setFormData({ ...formData, title_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Title (VI)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <textarea value={formData.bio || ""} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none h-24 shadow-sm" placeholder="Bio (EN)" />
                <textarea value={formData.bio_vi || ""} onChange={e => setFormData({ ...formData, bio_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none h-24 shadow-sm" placeholder="Bio (VI)" />
              </div>

              {/* Contact and Links Fields */}
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Email" />
                <input value={formData.github_url || ""} onChange={e => setFormData({ ...formData, github_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Github URL" />
                <input value={formData.linkedin_url || ""} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="LinkedIn URL" />
                <input value={formData.facebook_url || ""} onChange={e => setFormData({ ...formData, facebook_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Facebook URL" />
                <input value={formData.instagram_url || ""} onChange={e => setFormData({ ...formData, instagram_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm col-span-2" placeholder="Instagram URL" />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nationalities (comma separated)</label>
                  <input value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm mt-1" placeholder="Vietnam, USA" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Handling Formats (Multiple Choice)</label>
                  <div className="flex flex-wrap gap-2">
                    {["Remote", "Hybrid", "Onsite", "Full-time", "Part-time", "Freelancer", "Intern"].map(opt => {
                      const currentOpts = (formData.work_format || "").split(",").map((s: string) => s.trim()).filter(Boolean);
                      const isSelected = currentOpts.includes(opt);
                      return (
                        <label key={opt} className={`cursor-pointer px-4 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${isSelected ? 'bg-primary border-primary text-primary-foreground scale-105' : 'bg-background/50 border-input text-muted-foreground hover:border-primary/50 hover:bg-background'}`}>
                          <input type="checkbox" className="hidden" checked={isSelected} onChange={(e) => {
                            const newOpts = e.target.checked ? [...currentOpts, opt] : currentOpts.filter((o: string) => o !== opt);
                            setFormData({ ...formData, work_format: newOpts.join(', ') });
                          }} />
                          {opt}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center p-6 bg-background/30 rounded-3xl border border-border">
                <label className="cursor-pointer bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold mb-6 flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Avatar"}
                </label>
                {formData.avatar_url && (
                  <div className="w-full flex flex-col items-center bg-card/50 p-6 rounded-3xl border border-border shadow-inner">
                    <div className="w-40 h-40 rounded-full border-4 border-primary relative bg-muted cursor-move overflow-hidden shadow-xl mb-6"
                      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
                      <img src={formData.avatar_url} draggable="false" className="w-full h-full object-cover pointer-events-none"
                        style={{ objectPosition: `${formData.avatar_x || 50}% ${formData.avatar_y || 50}%`, transform: `scale(${formData.avatar_scale || 1})` }} />
                    </div>
                    
                    <div className="w-full space-y-4">
                      <div className="flex flex-col gap-1 w-full">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Zoom</span>
                         <input type="range" min="1" max="4" step="0.1" value={formData.avatar_scale || 1} onChange={e => setFormData({ ...formData, avatar_scale: e.target.value })} className="w-full accent-primary" />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">X Position (Horizontal)</span>
                         <input type="range" min="0" max="100" step="1" value={formData.avatar_x || 50} onChange={e => setFormData({ ...formData, avatar_x: e.target.value })} className="w-full accent-primary" />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Y Position (Vertical)</span>
                         <input type="range" min="0" max="100" step="1" value={formData.avatar_y || 50} onChange={e => setFormData({ ...formData, avatar_y: e.target.value })} className="w-full accent-primary" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="w-full mt-6 pt-6 border-t border-border flex flex-col items-center">
                  <label className="cursor-pointer bg-card text-foreground border border-border px-6 py-2.5 rounded-xl text-sm font-bold mb-2 flex items-center gap-2 shadow-sm hover:bg-muted transition-colors">
                    <input type="file" accept=".pdf,application/pdf" onChange={handleCVUpload} className="hidden" />
                    {uploadingCV ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload New CV (PDF)"}
                  </label>
                  {formData.cv_url && (
                    <a href={formData.cv_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                      <Check className="w-3 h-3" /> CV Updated (Save to apply)
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 bg-background/30 rounded-3xl border border-border flex flex-col items-center justify-center">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-2">Years of Experience</label>
                <input type="number" value={formData.stats_experience || 0} onChange={e => setFormData({ ...formData, stats_experience: parseInt(e.target.value) })} className="w-32 px-4 py-2.5 text-center font-bold text-3xl rounded-2xl border border-input bg-card shadow-inner focus:ring-2 focus:ring-primary/30 outline-none transition-all" />
                <p className="text-[10px] text-muted-foreground/60 text-center mt-3 max-w-[200px] font-mono leading-relaxed">Languages & Tools count are automatically calculated based on the Skills section.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-border mt-8">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-xl font-bold font-sans">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="px-8 py-2 bg-primary text-primary-foreground font-bold rounded-xl flex items-center font-sans tracking-wide">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none opacity-[0.03] select-none z-0">
            <h1 className="text-[12rem] md:text-[18rem] font-bold tracking-tighter mix-blend-overlay">Developer</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-24 gap-12 items-center relative z-10 font-mono">

            <div className="lg:col-span-8 flex justify-center lg:justify-start">
              <div className="bg-card/20 backdrop-blur-md w-full max-w-sm rounded-tl-[60px] rounded-br-[60px] rounded-tr-3xl rounded-bl-3xl border border-primary/20 overflow-hidden p-8 shadow-2xl relative">
                <div className="flex justify-center mb-6 relative">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary/20">
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover"
                          style={{ objectPosition: `${profile.avatar_x || 50}% ${profile.avatar_y || 50}%`, transform: `scale(${profile.avatar_scale || 1})` }} />
                      ) : (
                        <div className="w-full h-full bg-muted/20" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold font-sans tracking-tight mb-1">{displayFullName}</h2>
                  <p className="text-xs font-sans text-muted-foreground">{displayTitle}</p>
                </div>

                <div className="space-y-4 text-xs mb-8 text-muted-foreground border-t border-border/50 pt-6">
                  {profile.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary" /> <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}`} target="_blank" rel="noreferrer" className="truncate hover:text-foreground">{profile.email}</a>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-start gap-3 mt-1">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1.5">
                        {profile.location.split(',').map((loc: string, idx: number) => {
                          if (!loc.trim()) return null;
                          return (
                            <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded border border-primary/20">
                              {loc.trim()}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {profile.work_format && (() => {
                    const validOpts = ["Remote", "Hybrid", "Onsite", "Full-time", "Part-time", "Freelancer", "Intern"];
                    const tags = profile.work_format.split(',').map((s: string) => s.trim()).filter((s: string) => s && validOpts.includes(s));
                    if (tags.length === 0) return null;
                    return (
                      <div className="flex items-start gap-3 mt-2">
                        <Briefcase className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((wf: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded border border-primary/20">
                              {wf}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Social Links Mini-Footer inside card */}
                <div className="flex items-center justify-center gap-4 mb-8 pt-6 border-t border-border/50 text-muted-foreground">
                  {profile.github_url && <a href={profile.github_url} target="_blank" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>}
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>}
                  {profile.facebook_url && <a href={profile.facebook_url} target="_blank" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>}
                  {profile.instagram_url && <a href={profile.instagram_url} target="_blank" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>}
                </div>

                <a href={profile.cv_url || "/CV_LeDucTrong.pdf"} target="_blank" rel="noreferrer" className="w-full py-3 bg-foreground text-background font-bold text-sm rounded-full flex justify-center items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all mt-6">
                  Download CV <Download className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-11 flex flex-col justify-center gap-6 px-4 md:px-8">
              <div className="text-primary/70 text-sm font-bold opacity-80">&lt;h1&gt;</div>
              <div className="pl-6 md:pl-10 leading-tight">
                <p className="text-4xl md:text-5xl font-sans text-foreground/90 mb-2">{language === 'vi' ? 'Xin chào,' : 'Hello,'}</p>
                <h2 className="text-5xl md:text-6xl xl:text-7xl font-sans font-bold text-foreground mt-2 mb-2 leading-tight">
                  {language === 'vi' ? 'tôi là' : "I'm"} <span className="text-primary">{displayFullName.split(' ').pop()}</span>,
                </h2>
                <h3 className="text-3xl xl:text-5xl md:text-5xl font-sans font-semibold text-foreground/80 leading-tight">
                  {displayTitle}
                </h3>
              </div>
              <div className="text-primary/70 text-sm font-bold opacity-80 text-right pr-12">&lt;/h1&gt;</div>

              <div className="text-primary/70 text-sm font-bold opacity-80 mt-6">&lt;p&gt;</div>
              <div className="pl-6 md:pl-10 text-muted-foreground/80 leading-relaxed font-sans md:text-lg max-w-xl whitespace-pre-wrap">
                {displayBio || t.hero.bio}
              </div>
              <div className="text-primary/70 text-sm font-bold opacity-80">&lt;/p&gt;</div>
            </div>

            <div className="lg:col-span-5 hidden lg:flex flex-col justify-center">
              <div className="bg-card/30 backdrop-blur-xl w-full rounded-[40px] px-5 py-10 border border-border/30 shadow-xl space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-sans font-bold text-primary">{initialStats?.languages || 0}</span>
                  <span className="text-[10px] xl:text-xs text-muted-foreground uppercase tracking-widest leading-tight flex-1">Programming Languages</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-sans font-bold text-primary">{initialStats?.frameworks || 0}</span>
                  <span className="text-[10px] xl:text-xs text-muted-foreground uppercase tracking-widest leading-tight flex-1">Frameworks</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-sans font-bold text-primary">{initialStats?.devTools || 0}</span>
                  <span className="text-[10px] xl:text-xs text-muted-foreground uppercase tracking-widest leading-tight flex-1">Dev Tools</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-sans font-bold text-primary">{profile.stats_experience || 0}</span>
                  <span className="text-[10px] xl:text-xs text-muted-foreground uppercase tracking-widest leading-tight flex-1">Years of Experience</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </section>
  );
}
