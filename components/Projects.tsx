"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useAppContext } from "./providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Plus, Trash2, Check, X, Eye, EyeOff, Code, ExternalLink, Calendar, Briefcase, ChevronLeft, ChevronRight, XCircle, Code2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

export function Projects({ initialProjects }: { initialProjects: any[] }) {
  const { t, isAdmin, language } = useAppContext();
  const [projects, setProjects] = useState(initialProjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleEdit = (proj: any) => {
    setFormData({ ...proj, tags: (proj.tags || []).join(", ") });
    setEditingId(proj.id);
  };

  const handleAddNew = () => {
    setFormData({
      title: "", title_vi: "",
      description: "", description_vi: "",
      features: "", features_vi: "",
      role: "", role_vi: "",
      image_url: "", image_x: 50, image_y: 50, image_scale: 1,
      tags: "", demo_url: "", github_url: "", is_hidden: false, show_dates: true, start_date: "", end_date: ""
    });
    setEditingId("new");
  };

  const handleSave = async () => {
    setLoading(true);
    const tagsArray = formData.tags ? (typeof formData.tags === 'string' ? formData.tags.split(",") : formData.tags).map((t: string) => t.trim()).filter(Boolean) : [];
    const featuresArray = formData.features ? (typeof formData.features === 'string' ? formData.features.split("\n") : formData.features).map((t: string) => t.trim()).filter(Boolean) : [];
    const featuresViArray = formData.features_vi ? (typeof formData.features_vi === 'string' ? formData.features_vi.split("\n") : formData.features_vi).map((t: string) => t.trim()).filter(Boolean) : [];

    const payload = { ...formData, tags: tagsArray, features: featuresArray, features_vi: featuresViArray };
    if (!payload.start_date) payload.start_date = null;
    if (!payload.end_date) payload.end_date = null;

    if (editingId === "new") {
      const { data, error } = await supabase.from("projects").insert([payload]).select();
      if (!error && data) {
        setProjects([...projects, data[0]]);
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from("projects").update(payload).eq("id", editingId).select();
      if (!error && data) {
        setProjects(projects.map(p => p.id === editingId ? data[0] : p));
        setEditingId(null);
      }
    }
    setLoading(false);
  };

  const handleToggleHide = async (proj: any) => {
    const { data } = await supabase.from("projects").update({ is_hidden: !proj.is_hidden }).eq("id", proj.id).select();
    if (data) { setProjects(projects.map(p => p.id === proj.id ? data[0] : p)); }
  };

  const handleDelete = (id: string) => {
    setConfirmId(id);
  };

  const doDelete = async () => {
    if (!confirmId) return;
    await supabase.from("projects").delete().eq("id", confirmId);
    setProjects(projects.filter(p => p.id !== confirmId));
    setConfirmId(null);
  };

  const visibleProjects = isAdmin ? projects : projects.filter(p => !p.is_hidden);
  const sortedProjects = [...visibleProjects].sort((a, b) => {
    const timeA = a.start_date ? new Date(a.start_date).getTime() : new Date().getTime();
    const timeB = b.start_date ? new Date(b.start_date).getTime() : new Date().getTime();
    return timeB - timeA;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return language === 'vi' ? 'Hiện tại' : 'Present';
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section id="projects" className="py-24 max-w-[1400px] mx-auto relative flex flex-col justify-center min-h-[90vh] overflow-hidden">
      <ConfirmModal
        isOpen={!!confirmId}
        title={language === 'vi' ? 'Xóa Dự Án' : 'Delete Project'}
        message={language === 'vi' ? 'Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.' : 'Are you sure you want to remove this project? This action cannot be undone.'}
        confirmText={t.admin.delete || "Delete"}
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
        <div className="h-16 w-px border-l-2 border-dashed border-primary/30" />
      </div>

      <div className="text-center mb-16 relative z-10 pt-16">
        <div className="flex justify-center mb-8">
          <Briefcase className="w-24 h-24 text-primary opacity-80" />
        </div>
        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tight mb-6 text-primary">{t.sections.experienceTitle}</h2>
        <div className="flex items-center justify-center mb-6">
          <div className="h-[2px] w-12 bg-primary/20" />
          <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] mx-4" />
          <div className="h-[2px] w-12 bg-primary/20" />
        </div>
        <p className="font-sans text-muted-foreground md:text-lg">
          {t.sections.experienceDesc}
        </p>
      </div>

      <div className="absolute top-32 right-10 z-30">
        {isAdmin && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-6 py-2.5 hover:bg-primary/20 bg-primary/10 text-primary border border-primary/50 rounded-xl font-sans font-bold text-sm shadow-md backdrop-blur-md transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> {t.admin.addExperience || "Add Experience"}
          </button>
        )}
      </div>

      {editingId === "new" && (
        <div className="bg-card/90 backdrop-blur-md p-8 rounded-3xl border border-primary/50 shadow-2xl mb-12 max-w-4xl mx-auto relative z-20">
          <ExperienceForm language={language} formData={formData} setFormData={setFormData} handleSave={handleSave} handleCancel={() => setEditingId(null)} loading={loading} />
        </div>
      )}

      {visibleProjects.length === 0 && editingId !== "new" && (
        <div className="text-center py-20 text-muted-foreground opacity-70 font-mono z-10 relative"> No experience logged. </div>
      )}

      {/* Vertical Timeline Implementation */}
      {visibleProjects.length > 0 && !editingId && (
        <div className="relative w-full max-w-[1200px] mx-auto z-10 mt-12 py-12 px-4 md:px-0">
          {/* The Vertical Line that runs down the left */}
          <div className="absolute top-0 bottom-0 left-8 md:left-12 w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-1/2 max-w-full z-0" />

          <div className="flex flex-col gap-12 md:gap-16 relative z-10">
            {sortedProjects.map((proj) => (
              <div key={proj.id} className={`flex flex-col md:flex-row items-baseline justify-between w-full relative ${proj.is_hidden ? 'opacity-50 grayscale' : ''}`}>
                {/* Timeline Marker Dot */}
                <div className="absolute left-8 md:left-12 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full border-4 border-background shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] z-20 group" />

                <ExperienceCard
                  proj={proj}
                  isAdmin={isAdmin}
                  language={language}
                  handleToggleHide={handleToggleHide}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  formatDate={formatDate}
                  setSelectedProject={setSelectedProject}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {editingId && editingId !== "new" && (
        <div className="bg-card/90 backdrop-blur-md p-8 rounded-3xl border border-primary/50 shadow-2xl max-w-4xl mx-auto relative z-20 mt-12">
          <ExperienceForm language={language} formData={formData} setFormData={setFormData} handleSave={handleSave} handleCancel={() => setEditingId(null)} loading={loading} />
        </div>
      )}

      {selectedProject && (
        <ExperienceModal proj={selectedProject} language={language} onClose={() => setSelectedProject(null)} />
      )}

    </section>
  );
}

function ExperienceCard({ proj, isAdmin, language, handleToggleHide, handleEdit, handleDelete, formatDate, setSelectedProject }: any) {
  const [expanded, setExpanded] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const images = useMemo(() => {
    if (!proj.image_url) return [];
    try {
      const parsed = JSON.parse(proj.image_url);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return [{ url: proj.image_url, x: proj.image_x || 50, y: proj.image_y || 50, scale: proj.image_scale || 1 }];
  }, [proj.image_url, proj.image_x, proj.image_y, proj.image_scale]);

  const currentImg = images[imgIndex] || null;

  const desc = language === 'vi' && proj.description_vi ? proj.description_vi : proj.description;
  const features = language === 'vi' && proj.features_vi ? proj.features_vi : proj.features;

  const isLong = desc && desc.length > 200;
  const displayDesc = expanded ? desc : (isLong ? desc.slice(0, 200) + '...' : desc);

  const nextImg = () => setImgIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setImgIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className={`group/card relative bg-card/95 backdrop-blur-md rounded-xl p-6 md:p-8 border border-primary/20 shadow-xl hover:border-primary/50 transition-all z-30 flex flex-col xl:flex-row items-center gap-8 w-[calc(100%-4rem)] md:w-[calc(100%-5rem)] ml-[4.5rem] md:ml-[5.5rem]`}>

      {/* Full Card Hover Shine Effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
        <div className="absolute h-[250%] w-full top-[-50%] left-0 block -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover/card:translate-x-[150%] transition-transform duration-[1500ms] pointer-events-none" />
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex gap-1 z-40 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity">
          <button onClick={() => handleToggleHide(proj)} className="p-1.5 bg-background border border-border rounded-full hover:text-primary shadow-sm"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleEdit(proj)} className="p-1.5 bg-background border border-border text-primary rounded-full shadow-sm"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(proj.id)} className="p-1.5 bg-background border border-border text-red-500 rounded-full shadow-sm"><Trash2 className="w-4 h-4" /></button>
        </div>
      )}

      {/* Timeline Date Tags */}
      {proj.show_dates && (
        <div className={`absolute -top-4 left-6 bg-background text-primary font-mono text-sm font-bold px-4 py-1.5 rounded-lg border border-primary/40 shadow-md flex items-center gap-2 whitespace-nowrap z-40`}>
          <Calendar className="w-4 h-4" /> {formatDate(proj.start_date)} — {formatDate(proj.end_date)}
        </div>
      )}

      {/* Image Column */}
      <div className="shrink-0 mt-4 xl:mt-0 flex flex-col items-center gap-3 z-10 w-full xl:w-[500px]">
        <div className="w-full aspect-video relative group/image overflow-hidden rounded-xl md:rounded-2xl bg-muted/20 border border-border/50 shadow-inner flex items-center justify-center">
          {currentImg ? (
            <>
              <img src={currentImg.url} alt="Cover" className="w-full h-full object-contain drop-shadow-md transition-transform duration-500" />
              <div className="absolute inset-0 z-10 block -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/image:translate-x-[150%] transition-transform duration-[1500ms] pointer-events-none" />

              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-all z-20 shadow-md"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-all z-20 shadow-md"><ChevronRight className="w-5 h-5" /></button>
                </>
              )}
            </>
          ) : (
            <Briefcase className="w-12 h-12 text-muted-foreground/30" />
          )}
        </div>

        {/* Dots Indicator outside image */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 w-full mt-2">
            {images.map((_: any, i: number) => (
              <button key={i} onClick={() => setImgIndex(i)} className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? 'bg-primary scale-125' : 'bg-primary/30'} hover:bg-primary/80 transition-all`} />
            ))}
          </div>
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 flex flex-col justify-center w-full min-w-0">
        <h3 className="text-2xl md:text-3xl font-bold font-sans text-foreground mb-2">
          {language === 'vi' && proj.title_vi ? proj.title_vi : proj.title}
        </h3>

        {proj.role && (
          <span className="text-sm font-sans font-bold text-primary mb-4 inline-block px-3 py-1 bg-primary/10 rounded-md max-w-max">
            {language === 'vi' && proj.role_vi ? proj.role_vi : proj.role}
          </span>
        )}

        <p className="text-base font-sans text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
          {displayDesc}
          {isLong && !expanded && (
            <button onClick={() => setExpanded(true)} className="ml-2 text-primary font-bold hover:underline transition-colors focus:outline-none inline">
              {language === 'vi' ? 'Xem thêm' : 'See more'}
            </button>
          )}
        </p>

        {expanded && (
          <button onClick={() => setExpanded(false)} className="text-sm text-primary font-bold hover:underline transition-colors mb-6 inline-block">
            {language === 'vi' ? 'Ẩn bớt' : 'Show less'}
          </button>
        )}

        {features && Array.isArray(features) && features.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold font-sans text-primary mb-3 flex items-center gap-1">
              <ChevronRight className="w-4 h-4" />
              {language === 'vi' ? 'Tính Năng Nổi Bật:' : 'Key Features:'}
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-sm font-sans text-muted-foreground">
              {(expanded ? features : features.slice(0, 3)).map((feature: string, idx: number) => (
                <li key={idx} className="pl-1 leading-relaxed">{feature}</li>
              ))}
            </ul>
            {!expanded && features.length > 3 && (
              <button onClick={() => setExpanded(true)} className="mt-2 text-xs text-primary font-bold hover:underline inline-flex items-center">
                {language === 'vi' ? `+${features.length - 3} tính năng nữa...` : `+${features.length - 3} more features...`}
              </button>
            )}
          </div>
        )}

        {proj.tags && proj.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {proj.tags.map((tag: string, i: number) => (
              <span key={i} className="text-xs font-mono font-bold px-3 py-1 rounded border border-border/60 bg-muted/30 text-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/40 mt-auto">
          <button onClick={() => setSelectedProject(proj)} className="text-sm font-bold font-sans bg-primary/10 text-primary px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary/20 transition-colors border border-primary/20 shadow-sm"><Eye className="w-4 h-4" /> {language === 'vi' ? 'Xem chi tiết' : 'View Details'}</button>
          {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-sm font-bold font-sans bg-primary text-primary-foreground px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"><ExternalLink className="w-4 h-4" /> View Live</a>}
          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-sm font-bold font-sans bg-muted/80 text-foreground px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-muted transition-colors border border-border/50"><Code className="w-4 h-4" /> Source Code</a>}
        </div>
      </div>

    </div>
  )
}

function ExperienceForm({ language, formData, setFormData, handleSave, handleCancel, loading }: any) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartPercent = useRef({ x: 50, y: 50 });

  const images = useMemo(() => {
    if (!formData.image_url) return [];
    try {
      const parsed = JSON.parse(formData.image_url);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return [{ url: formData.image_url, x: formData.image_x || 50, y: formData.image_y || 50, scale: formData.image_scale || 1 }];
  }, [formData.image_url, formData.image_x, formData.image_y, formData.image_scale]);

  const updateImages = (newImages: any[]) => {
    setFormData({ ...formData, image_url: JSON.stringify(newImages), image_x: null, image_y: null, image_scale: null });
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `projects/${fileName}`;
    const { error } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (!error) {
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
      const newImages = [...images, { url: data.publicUrl, x: 50, y: 50, scale: 1 }];
      updateImages(newImages);
      setActiveImgIndex(newImages.length - 1);
    }
    setUploadingImage(false);
  };

  const removeImg = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateImages(newImages);
    if (activeImgIndex >= newImages.length) setActiveImgIndex(Math.max(0, newImages.length - 1));
  };

  const currentImg = images[activeImgIndex];

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!currentImg) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartPercent.current = { x: Number(currentImg.x) || 50, y: Number(currentImg.y) || 50 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !currentImg) return;
    const scale = Number(currentImg.scale) || 1;
    const newX = Math.max(0, Math.min(100, dragStartPercent.current.x + ((e.clientX - dragStartPos.current.x) * -0.5 / scale)));
    const newY = Math.max(0, Math.min(100, dragStartPercent.current.y + ((e.clientY - dragStartPos.current.y) * -0.5 / scale)));

    const newImages = [...images];
    newImages[activeImgIndex] = { ...currentImg, x: newX, y: newY };
    updateImages(newImages);
  };
  const handlePointerUp = (e: React.PointerEvent) => { if (isDragging) { setIsDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); } };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h3 className="font-bold text-xl text-primary font-mono">&lt; Edit_Experience /&gt;</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        <div className="space-y-5 bg-card/50 p-6 rounded-3xl border border-border">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🇺🇸</span> <span className="font-bold font-sans text-sm">English</span></div>
          <input value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" placeholder="Title (EN)" />
          <input value={formData.role || ""} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Role (EN)" />
          <textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none h-24 shadow-sm" placeholder="Description (EN)" />
          <textarea value={Array.isArray(formData.features) ? formData.features.join('\n') : (formData.features || "")} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none h-24 shadow-sm" placeholder="Key Features (One per line) (EN)" />
        </div>
        <div className="space-y-5 bg-card/50 p-6 rounded-3xl border border-border">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🇻🇳</span> <span className="font-bold font-sans text-sm">Tiếng Việt</span></div>
          <input value={formData.title_vi || ""} onChange={e => setFormData({ ...formData, title_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" placeholder="Tiêu Đề (VI)" />
          <input value={formData.role_vi || ""} onChange={e => setFormData({ ...formData, role_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Vai Trò (VI)" />
          <textarea value={formData.description_vi || ""} onChange={e => setFormData({ ...formData, description_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none h-24 shadow-sm" placeholder="Mô Tả (VI)" />
          <textarea value={Array.isArray(formData.features_vi) ? formData.features_vi.join('\n') : (formData.features_vi || "")} onChange={e => setFormData({ ...formData, features_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none h-24 shadow-sm" placeholder="Tính Năng Nổi Bật (Mỗi dòng 1 tính năng) (VI)" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 bg-card/30 p-6 rounded-3xl border border-border text-sm font-sans">
        <label className="col-span-2 flex items-center gap-3 font-bold cursor-pointer hover:text-primary transition-colors">
          <input type="checkbox" checked={formData.show_dates} onChange={e => setFormData({ ...formData, show_dates: e.target.checked })} className="w-4 h-4 text-primary rounded accent-primary cursor-pointer" />
          Show Dates on Timeline
        </label>
        {formData.show_dates && (
          <>
            <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2 block">Start Date</label><input type="date" value={formData.start_date || ""} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all shadow-sm outline-none" /></div>
            <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2 block">End Date (Optional)</label><input type="date" value={formData.end_date || ""} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all shadow-sm outline-none" /></div>
          </>
        )}
      </div>

      <div className="bg-muted/10 p-5 rounded-2xl border border-border flex flex-col items-center flex-1 font-sans">
        <label className={`cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center mb-6 hover:bg-primary/20 transition-colors ${uploadingImage ? 'opacity-50' : ''}`}>
          <input type="file" accept="image/*" onChange={uploadImage} disabled={uploadingImage} className="hidden" />
          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add Image
        </label>

        {images.length > 0 && (
          <div className="w-full flex flex-col justify-center items-center gap-6">
            <div className="flex flex-wrap gap-3 mb-4 justify-center">
              {images.map((img: any, i: number) => (
                <div key={i} className={`relative flex items-center justify-center p-1 rounded-xl cursor-pointer transition-all border-2 ${activeImgIndex === i ? 'border-primary' : 'border-transparent hover:border-primary/50'}`} onClick={() => setActiveImgIndex(i)}>
                  <img src={img.url} className="w-16 h-16 object-cover rounded-lg bg-background" />
                  <button className="absolute -top-2 -right-2 text-red-500 bg-background rounded-full hover:scale-110 shadow" onClick={(e) => { e.stopPropagation(); removeImg(i); }}><XCircle className="w-5 h-5" /></button>
                </div>
              ))}
            </div>

            {currentImg && (
              <div className="flex flex-col items-center p-4 bg-background border border-border rounded-xl">
                <p className="text-xs font-mono mb-2 text-muted-foreground">Editing Image {activeImgIndex + 1} (Square 1:1)</p>
                <div className={`w-[260px] h-[260px] rounded-xl border border-primary/50 bg-muted cursor-move overflow-hidden relative shadow-inner ${isDragging ? 'ring-2 ring-primary' : ''}`}
                  onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
                  <img src={currentImg.url} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: `${currentImg.x || 50}% ${currentImg.y || 50}%`, transform: `scale(${currentImg.scale || 1})` }} />
                </div>
                <label className="text-xs font-bold text-muted-foreground mt-6 mb-2">Zoom Scale</label>
                <input type="range" min="1" max="4" step="0.1" value={currentImg.scale || 1} onChange={e => {
                  const newImages = [...images];
                  newImages[activeImgIndex] = { ...currentImg, scale: parseFloat(e.target.value) };
                  updateImages(newImages);
                }} className="w-64 accent-primary" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 font-sans">
        <input value={formData.demo_url || ""} onChange={e => setFormData({ ...formData, demo_url: e.target.value })} className="w-full px-4 py-2 rounded-xl border bg-background text-sm" placeholder="Demo URL (https://)" />
        <input value={formData.github_url || ""} onChange={e => setFormData({ ...formData, github_url: e.target.value })} className="w-full px-4 py-2 rounded-xl border bg-background text-sm" placeholder="GitHub URL (https://)" />
        <input value={formData.tags || ""} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2 rounded-xl border bg-background text-sm col-span-2" placeholder="Tags comma separated (React, Node, CSS)" />
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8 font-sans">
        <button type="button" onClick={handleCancel} className="px-6 py-2 border rounded-xl bg-background font-bold hover:bg-muted">Cancel</button>
        <button type="button" onClick={handleSave} disabled={loading} className="px-8 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90">{loading ? "Saving..." : "Save Experience"}</button>
      </div>
    </div>
  )
}

function ExperienceModal({ proj, onClose, language }: any) {
  const [topIndex, setTopIndex] = useState(0);

  const images = useMemo(() => {
    if (!proj.image_url) return [];
    try {
      const parsed = JSON.parse(proj.image_url);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return [{ url: proj.image_url, x: proj.image_x || 50, y: proj.image_y || 50, scale: proj.image_scale || 1 }];
  }, [proj.image_url]);

  const desc = language === 'vi' && proj.description_vi ? proj.description_vi : proj.description;
  const features = language === 'vi' && proj.features_vi ? proj.features_vi : proj.features;

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTopIndex((prev) => (prev + 1) % images.length);
  };
  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTopIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="bg-card w-full max-w-7xl max-h-full md:max-h-[90vh] h-full md:h-auto rounded-3xl border border-border shadow-2xl flex flex-col lg:flex-row relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-[60] p-2 bg-background/80 backdrop-blur-md rounded-full hover:bg-muted text-foreground border border-border shadow-sm"><X className="w-6 h-6" /></button>

        {/* Images Fan Section - takes up 60% of width on Desktop */}
        <div className="relative w-full lg:w-[60%] h-[50vh] lg:h-auto lg:min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted/10 overflow-hidden p-4 md:p-8">
          {images.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-4 z-[60] bg-background/50 hover:bg-background/80 text-foreground p-3 rounded-full backdrop-blur-md border border-border shadow-md transition-all hover:scale-110"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={nextImg} className="absolute right-4 z-[60] bg-background/50 hover:bg-background/80 text-foreground p-3 rounded-full backdrop-blur-md border border-border shadow-md transition-all hover:scale-110"><ChevronRight className="w-6 h-6" /></button>
            </>
          )}
          {images.length > 0 ? (
            images.map((img: any, i: number) => {
              const isTop = i === topIndex;
              const offset = i - topIndex;
              const rotation = isTop ? 0 : offset * 5;
              const translateX = isTop ? 0 : offset * 30;
              const translateY = isTop ? 0 : Math.abs(offset) * 10;
              const zIndex = isTop ? 50 : 40 - Math.abs(offset);

              return (
                <div
                  key={i}
                  onClick={() => setTopIndex(i)}
                  className={`absolute flex items-center justify-center cursor-pointer transition-all duration-700 ease-out ${!isTop && 'hover:-translate-y-4 hover:scale-105'}`}
                  style={{
                    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${isTop ? 1 : 0.85})`,
                    zIndex,
                    width: 'max-content',
                    height: 'max-content',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  <img src={img.url} className="w-auto h-auto max-w-[90%] max-h-[45vh] lg:max-w-full lg:max-h-[70vh] object-contain rounded-xl md:rounded-2xl border-4 md:border-[6px] border-background/80 bg-muted/80 backdrop-blur-md shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] drop-shadow-2xl" />
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground font-mono">No images</div>
          )}
        </div>

        {/* Content Section - takes up 40% of width on Desktop, scrolling independently */}
        <div className="w-full lg:w-[40%] p-6 md:p-10 relative z-10 bg-background overflow-y-auto flex flex-col h-[60vh] lg:h-auto max-h-[90vh]">
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-3 text-foreground">{language === 'vi' && proj.title_vi ? proj.title_vi : proj.title}</h2>
          {proj.role && (
            <span className="text-sm font-sans font-bold text-primary mb-6 inline-block px-3 py-1 bg-primary/10 rounded-md max-w-max">
              {language === 'vi' && proj.role_vi ? proj.role_vi : proj.role}
            </span>
          )}

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-sans whitespace-pre-wrap leading-relaxed text-muted-foreground mb-8 flex-1">
            {desc}
          </div>

          {features && Array.isArray(features) && features.length > 0 && (
            <div className="mb-8 p-5 bg-muted/20 border border-border/50 rounded-2xl shadow-inner">
              <h3 className="text-lg font-bold font-sans text-primary mb-3 flex items-center gap-1"><ChevronRight className="w-4 h-4" />
                {language === 'vi' ? 'Tính Năng Nổi Bật:' : 'Key Features:'}</h3>
              <ul className="list-disc pl-5 space-y-1 prose prose-sm md:prose-base dark:prose-invert max-w-none font-sans leading-relaxed text-foreground/80 marker:text-primary/70">
                {features.map((feature: string, idx: number) => (
                  <li key={idx} className="pl-1">{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {proj.tags && proj.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {proj.tags.map((tag: string, i: number) => (
                <span key={i} className="text-xs font-mono font-bold px-3 py-1 rounded border border-border/60 bg-muted/30 text-foreground shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border mt-auto">
            {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-sm font-bold font-sans bg-primary text-primary-foreground px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"><ExternalLink className="w-4 h-4" /> View Live</a>}
            {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-sm font-bold font-sans bg-muted/80 text-foreground px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-muted transition-colors border border-border/50 shadow-sm hover:shadow hover:-translate-y-0.5"><Code className="w-4 h-4" /> Source Code</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
