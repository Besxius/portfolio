"use client";

import { useState, useMemo, useRef } from "react";
import { useAppContext } from "@/components/providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Plus, Trash2, Eye, ExternalLink, Code, X, XCircle, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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

  return (
    <section id="projects" className="w-full max-w-6xl mx-auto py-12 px-4 flex flex-col font-sans">
      <ConfirmModal isOpen={!!confirmId} title={language === 'vi' ? 'Xóa Dự Án' : 'Delete Project'} message={language === 'vi' ? 'Bạn có chắc chắn muốn xóa dự án này không?' : 'Are you sure you want to remove this project?'} confirmText="Delete" onConfirm={doDelete} onCancel={() => setConfirmId(null)} />

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Projects</h2>
        {isAdmin && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground border border-border rounded-md font-medium text-xs transition-colors">
            <Plus className="w-3 h-3" /> Add Project
          </button>
        )}
      </div>

      {editingId && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-xl mb-12">
          <ProjectForm language={language} formData={formData} setFormData={setFormData} handleSave={handleSave} handleCancel={() => setEditingId(null)} loading={loading} />
        </div>
      )}

      {visibleProjects.length === 0 && !editingId && (
        <div className="text-center py-10 text-muted-foreground opacity-70 font-mono text-sm"> No projects logged. </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {sortedProjects.map((proj) => (
          <ProjectCard key={proj.id} proj={proj} isAdmin={isAdmin} language={language} handleToggleHide={handleToggleHide} handleEdit={handleEdit} handleDelete={handleDelete} onOpen={() => setSelectedProject(proj)} />
        ))}
      </div>

      {selectedProject && <ProjectModal proj={selectedProject} language={language} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}

function ProjectCard({ proj, isAdmin, language, handleToggleHide, handleEdit, handleDelete, onOpen }: any) {
  const images = useMemo(() => {
    if (!proj.image_url) return [];
    try {
      const parsed = JSON.parse(proj.image_url);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return [{ url: proj.image_url, x: proj.image_x || 50, y: proj.image_y || 50, scale: proj.image_scale || 1 }];
  }, [proj.image_url, proj.image_x, proj.image_y, proj.image_scale]);

  const cover = images[0];
  const title = language === 'vi' && proj.title_vi ? proj.title_vi : proj.title;
  const desc = language === 'vi' && proj.description_vi ? proj.description_vi : proj.description;
  const role = language === 'vi' && proj.role_vi ? proj.role_vi : proj.role;

  return (
    <div className={`group flex flex-col bg-card rounded-xl border border-border/70 overflow-hidden hover:border-foreground/30 transition-colors relative ${proj.is_hidden ? 'opacity-50 grayscale' : ''}`}>
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); handleToggleHide(proj); }} className="p-1.5 bg-background border border-border rounded-md hover:text-foreground text-muted-foreground"><Eye className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleEdit(proj); }} className="p-1.5 bg-background border border-border text-foreground rounded-md"><Edit2 className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(proj.id); }} className="p-1.5 bg-background border border-border text-red-500 rounded-md"><Trash2 className="w-3 h-3" /></button>
        </div>
      )}

      <div className="w-full aspect-video bg-muted overflow-hidden cursor-pointer relative" onClick={onOpen}>
        {cover ? (
           <img src={cover.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={title} />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-muted-foreground/50"><Briefcase className="w-10 h-10" /></div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">{title}</h3>
        {role && <span className="text-xs font-mono text-muted-foreground mb-3">{role}</span>}
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {desc}
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-border/50 mt-auto">
          <button onClick={onOpen} className="text-xs font-medium text-foreground hover:underline mr-auto">View details →</button>
          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Code className="w-4 h-4" /></a>}
          {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="w-4 h-4" /></a>}
        </div>
      </div>
    </div>
  );
}

function ProjectForm({ language, formData, setFormData, handleSave, handleCancel, loading }: any) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

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

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h3 className="font-bold text-lg text-foreground font-mono">Edit Project</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="font-medium text-sm text-muted-foreground mb-2">English</div>
          <input value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Project Title" />
          <input value={formData.role || ""} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Role" />
          <textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground h-24" placeholder="Description" />
          <textarea value={Array.isArray(formData.features) ? formData.features.join('\n') : (formData.features || "")} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground h-24" placeholder="Features (one per line)" />
        </div>
        <div className="space-y-4">
          <div className="font-medium text-sm text-muted-foreground mb-2">Vietnamese</div>
          <input value={formData.title_vi || ""} onChange={e => setFormData({ ...formData, title_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Tiêu Đề" />
          <input value={formData.role_vi || ""} onChange={e => setFormData({ ...formData, role_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Vai Trò" />
          <textarea value={formData.description_vi || ""} onChange={e => setFormData({ ...formData, description_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground h-24" placeholder="Mô Tả" />
          <textarea value={Array.isArray(formData.features_vi) ? formData.features_vi.join('\n') : (formData.features_vi || "")} onChange={e => setFormData({ ...formData, features_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground h-24" placeholder="Tính Năng (mỗi dòng 1 tính năng)" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="col-span-2 flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" checked={formData.show_dates} onChange={e => setFormData({ ...formData, show_dates: e.target.checked })} className="rounded accent-foreground" />
          Show Dates
        </label>
        {formData.show_dates && (
          <>
            <div><label className="text-xs text-muted-foreground block mb-1">Start Date</label><input type="date" value={formData.start_date || ""} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">End Date</label><input type="date" value={formData.end_date || ""} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none" /></div>
          </>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-xl border border-border">
        <label className={`cursor-pointer inline-flex border border-border bg-background text-foreground px-3 py-1.5 rounded-md text-xs font-medium items-center hover:bg-muted mb-4 ${uploadingImage ? 'opacity-50' : ''}`}>
          <input type="file" accept="image/*" onChange={uploadImage} disabled={uploadingImage} className="hidden" />
          {uploadingImage ? "Uploading..." : "Add Image"}
        </label>
        
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img: any, i: number) => (
              <div key={i} className="relative w-16 h-16 border border-border rounded-md overflow-hidden bg-background">
                <img src={img.url} className="w-full h-full object-cover" />
                <button onClick={() => removeImg(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input value={formData.demo_url || ""} onChange={e => setFormData({ ...formData, demo_url: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="Demo URL" />
        <input value={formData.github_url || ""} onChange={e => setFormData({ ...formData, github_url: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm" placeholder="GitHub URL" />
        <input value={formData.tags || ""} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm col-span-2" placeholder="Tags (comma separated)" />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button type="button" onClick={handleCancel} className="px-4 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-muted">Cancel</button>
        <button type="button" onClick={handleSave} disabled={loading} className="px-4 py-1.5 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90">{loading ? "Saving..." : "Save"}</button>
      </div>
    </div>
  )
}

function ProjectModal({ proj, onClose, language }: any) {
  const [imgIndex, setImgIndex] = useState(0);

  const images = useMemo(() => {
    if (!proj.image_url) return [];
    try {
      const parsed = JSON.parse(proj.image_url);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return [{ url: proj.image_url, x: proj.image_x || 50, y: proj.image_y || 50, scale: proj.image_scale || 1 }];
  }, [proj.image_url]);

  const title = language === 'vi' && proj.title_vi ? proj.title_vi : proj.title;
  const desc = language === 'vi' && proj.description_vi ? proj.description_vi : proj.description;
  const role = language === 'vi' && proj.role_vi ? proj.role_vi : proj.role;
  const features = language === 'vi' && proj.features_vi ? proj.features_vi : proj.features;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border shadow-2xl flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-background/80 rounded-full hover:bg-muted text-foreground border border-border"><X className="w-4 h-4" /></button>
        
        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          {images.length > 0 && (
            <div className="w-full rounded-xl overflow-hidden bg-muted mb-8 relative">
              <img src={images[imgIndex].url} className="w-full h-auto max-h-[50vh] object-contain" />
              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                  {images.map((_: any, i: number) => (
                    <button key={i} onClick={() => setImgIndex(i)} className={`w-2 h-2 rounded-full ${i === imgIndex ? 'bg-foreground' : 'bg-foreground/30'} transition-colors`} />
                  ))}
                </div>
              )}
            </div>
          )}

          <h2 className="text-2xl font-bold font-sans text-foreground mb-2">{title}</h2>
          {role && <div className="text-sm font-mono text-muted-foreground mb-6">{role}</div>}

          <div className="prose prose-sm dark:prose-invert max-w-none font-sans whitespace-pre-wrap text-muted-foreground mb-8">
            {desc}
          </div>

          {features && Array.isArray(features) && features.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold font-sans text-foreground mb-3">{language === 'vi' ? 'Key Features' : 'Key Features'}</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {features.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {proj.tags && proj.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {proj.tags.map((tag: string, i: number) => (
                <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-muted text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-border bg-card flex gap-3">
          {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noreferrer" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-md flex items-center gap-2 hover:opacity-90"><ExternalLink className="w-4 h-4" /> Live Demo</a>}
          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-sm font-medium bg-muted text-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-muted/80 border border-border"><Code className="w-4 h-4" /> Source</a>}
        </div>
      </div>
    </div>
  );
}
