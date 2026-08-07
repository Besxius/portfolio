"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Plus, Trash2, Eye, ExternalLink, Code, X, Briefcase, ChevronDown, ChevronUp, Users, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, FolderOpen } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import DepthCarousel from "@/components/ui/depth-carousel";

export function Projects({ initialProjects }: { initialProjects: any[] }) {
  const { isAdmin, language } = useAppContext();
  const [projects, setProjects] = useState(initialProjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const visibleProjects = isAdmin ? projects : projects.filter(p => !p.is_hidden);
  const sortedProjects = [...visibleProjects].sort((a, b) => {
    const timeA = a.start_date ? new Date(a.start_date).getTime() : new Date().getTime();
    const timeB = b.start_date ? new Date(b.start_date).getTime() : new Date().getTime();
    return timeB - timeA;
  });

  const handleEdit = (proj: any) => {
    setValidationError(null);
    const techStackStr = Array.isArray(proj.tech_stack)
      ? proj.tech_stack.join(', ')
      : (Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tech_stack || proj.tags || ''));

    setFormData({
      ...proj,
      tech_stack_input: techStackStr
    });
    setEditingId(proj.id);
  };

  const handleAddNew = () => {
    setValidationError(null);
    setFormData({
      title: "", title_vi: "",
      role: "", role_vi: "",
      description: "", description_vi: "",
      logo_url: "",
      image_url: "",
      tech_stack_input: "",
      team_size: 1,
      demo_url: "", github_url: "",
      start_date: "", end_date: "",
      is_hidden: false
    });
    setEditingId("new");
  };

  const handleSave = async () => {
    setValidationError(null);
    const titleText = (formData.title || formData.title_vi || "").trim();

    if (!titleText) {
      setValidationError("Project Title is required.");
      return;
    }

    setLoading(true);
    const techStackArr = formData.tech_stack_input
      ? formData.tech_stack_input.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const payload = { ...formData };
    delete payload.tech_stack_input;
    payload.tech_stack = techStackArr;
    payload.tags = techStackArr;

    if (!payload.start_date) payload.start_date = null;
    if (!payload.end_date) payload.end_date = null;

    if (editingId === "new") {
      const { data, error } = await supabase.from("projects").insert([payload]).select();
      if (error) {
        alert("Save Error: " + error.message);
      }
      if (!error && data) {
        setProjects([...projects, data[0]]);
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from("projects").update(payload).eq("id", editingId).select();
      if (error) {
        alert("Update Error: " + error.message);
      }
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

  return (
    <section id="projects" className="w-full max-w-4xl mx-auto py-12 flex flex-col font-sans px-4">
      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Project"
        message="Are you sure you want to remove this project? This action cannot be undone."
        confirmText="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Projects</h2>
        {isAdmin && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground border border-border rounded-md font-medium text-xs transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        )}
      </div>

      {editingId && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-xl mb-12">
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            handleSave={handleSave}
            handleCancel={() => setEditingId(null)}
            loading={loading}
            validationError={validationError}
          />
        </div>
      )}

      {visibleProjects.length === 0 && !editingId && (
        <div className="text-center py-10 text-muted-foreground opacity-70 font-mono text-sm"> No projects logged. </div>
      )}

      {sortedProjects.length > 0 && !editingId && (
        <div className="flex flex-col w-full">
          {sortedProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              proj={proj}
              isAdmin={isAdmin}
              language={language}
              handleToggleHide={handleToggleHide}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              onOpen={() => setSelectedProject(proj)}
            />
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectModal proj={selectedProject} language={language} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
}

// MAIN PAGE PROJECT CARD: Timeline List layout matching Experience & Education (NO images on main page)
function ProjectCard({ proj, isAdmin, language, handleToggleHide, handleEdit, handleDelete, onOpen }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  const title = language === 'vi' && proj.title_vi ? proj.title_vi : proj.title;
  const role = language === 'vi' && proj.role_vi ? proj.role_vi : proj.role;
  const rawDescription = language === 'vi' && proj.description_vi ? proj.description_vi : proj.description;

  const hasHtmlContent = (str?: string) => {
    if (!str) return false;
    const stripped = str.replace(/<[^>]*>/g, '').trim();
    return stripped.length > 0;
  };

  const showDescription = hasHtmlContent(rawDescription);

  const techStack = Array.isArray(proj.tech_stack)
    ? proj.tech_stack
    : (Array.isArray(proj.tags) ? proj.tags : (typeof proj.tech_stack === 'string' && proj.tech_stack ? proj.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean) : []));

  const isHidden = proj.is_hidden;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    if (dateString.includes('-')) {
      return new Date(dateString).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    }
    return dateString;
  };

  return (
    <div className={`group relative flex flex-col border-b border-border/50 py-8 first:pt-0 last:border-0 ${isHidden ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex gap-4">
        {/* Timeline Icon & Vertical Line */}
        <div className="flex flex-col items-center mt-1">
          {proj.logo_url ? (
            <div className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm z-10">
              <img src={proj.logo_url} className="w-full h-full object-cover" alt="Logo" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center shrink-0 shadow-sm z-10">
              <FolderOpen className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
          )}
          <div className="w-px h-full bg-border/50 mt-2" />
        </div>

        {/* Content Column */}
        <div className="flex-1 pb-4">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-1">
            <h3
              onClick={onOpen}
              className="font-bold text-xl text-foreground tracking-tight hover:underline cursor-pointer"
            >
              {title}
            </h3>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleToggleHide(proj)} className="p-1 hover:text-foreground text-muted-foreground" title="Toggle visibility"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleEdit(proj)} className="p-1 hover:text-foreground text-muted-foreground" title="Edit"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(proj.id)} className="p-1 hover:text-red-500 text-muted-foreground" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}

              {/* Chevron Toggle Button - ONLY rendered if description exists */}
              {showDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Meta Row (Role, Dates, Team Size - ONLY if non-empty) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3 font-mono">
            {role && <span>{role}</span>}
            {role && (proj.start_date || proj.end_date) && <span className="opacity-50">|</span>}
            {(proj.start_date || proj.end_date) && (
              <span>{formatDate(proj.start_date)} — {formatDate(proj.end_date)}</span>
            )}
            {proj.team_size && (role || proj.start_date || proj.end_date) && <span className="opacity-50">|</span>}
            {proj.team_size && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {proj.team_size} {proj.team_size === 1 ? 'member' : 'members'}
              </span>
            )}
          </div>

          {/* Description Content (Max 5 lines unless expanded) */}
          {showDescription && (
            <div
              className={`text-sm text-muted-foreground/90 leading-relaxed mb-3 transition-all [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5 ${isExpanded ? 'line-clamp-none' : 'line-clamp-5'
                }`}
              dangerouslySetInnerHTML={{ __html: rawDescription }}
            />
          )}

          {/* Tech Stack Badges */}
          {techStack && techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              {techStack.map((tech: string, i: number) => (
                <span key={i} className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Action Links & View Details */}
          <div className="flex items-center gap-4 text-xs font-medium pt-2">
            <button onClick={onOpen} className="text-foreground hover:underline mr-auto">
              View details →
            </button>
            {proj.demo_url && (
              <a href={proj.demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-mono">
                <ExternalLink className="w-3.5 h-3.5" /> Live
              </a>
            )}
            {proj.github_url && (
              <a href={proj.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-mono">
                <Code className="w-3.5 h-3.5" /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectForm({ formData, setFormData, handleSave, handleCancel, loading, validationError }: any) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const images = useMemo(() => {
    if (!formData.image_url) return [];
    try {
      const parsed = JSON.parse(formData.image_url);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return [{ url: formData.image_url }];
  }, [formData.image_url]);

  const updateImages = (newImages: any[]) => {
    setFormData({ ...formData, image_url: JSON.stringify(newImages) });
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `project-logos/${fileName}`;
    const { error } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (!error) {
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
      setFormData({ ...formData, logo_url: data.publicUrl });
    }
    setUploadingLogo(false);
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
      const newImages = [...images, { url: data.publicUrl }];
      updateImages(newImages);
    }
    setUploadingImage(false);
  };

  const removeImg = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateImages(newImages);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {formData.id ? "Edit Project" : "Add Project"}
        </span>
      </div>

      {validationError && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
          {validationError}
        </div>
      )}

      {/* Section 1: English Basic Info */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Basic Information (EN)</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Project Title (EN) *</label>
            <input
              value={formData.title || ""}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
              placeholder="e.g. Portfolio Website"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Role / Position (EN)</label>
            <input
              value={formData.role || ""}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
              placeholder="e.g. Full-Stack Developer"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Vietnamese Information */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vietnamese Information (VI)</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Project Title (VI)</label>
            <input
              value={formData.title_vi || ""}
              onChange={e => setFormData({ ...formData, title_vi: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
              placeholder="e.g. Trang web Portfolio"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Role / Position (VI)</label>
            <input
              value={formData.role_vi || ""}
              onChange={e => setFormData({ ...formData, role_vi: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
              placeholder="e.g. Lập trình viên Full-Stack"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Description & Content */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description & Content</span>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Description (EN)</label>
            <RichTextEditor
              value={formData.description || ""}
              onChange={html => setFormData({ ...formData, description: html })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Description (VI)</label>
            <RichTextEditor
              value={formData.description_vi || ""}
              onChange={html => setFormData({ ...formData, description_vi: html })}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Project Links, Dates & Team Size */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Project Links, Dates & Team Size</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Live Demo URL</label>
            <input
              value={formData.demo_url || ""}
              onChange={e => setFormData({ ...formData, demo_url: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">GitHub Code URL</label>
            <input
              value={formData.github_url || ""}
              onChange={e => setFormData({ ...formData, github_url: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
              placeholder="https://github.com/username/repo"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Team Size (Members)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={formData.team_size ?? 1}
              onChange={e => setFormData({ ...formData, team_size: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Start Date</label>
            <input
              type="date"
              value={formData.start_date || ""}
              onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">End Date</label>
            <input
              type="date"
              value={formData.end_date || ""}
              onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Technologies & Tech Stack */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Technologies & Tech Stack</span>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Tech Stack (Comma-separated)</label>
          <input
            value={formData.tech_stack_input || ""}
            onChange={e => setFormData({ ...formData, tech_stack_input: e.target.value })}
            className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none"
            placeholder="e.g. React, Next.js, Tailwind CSS, Supabase"
          />
        </div>
      </div>

      {/* Section 6: Project Logo & Media Gallery */}
      <div className="border-t border-border pt-4 space-y-4">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Project Logo & Media Gallery</span>

        {/* Main Logo Upload */}
        <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border">
          <div className="w-12 h-12 bg-muted rounded-full border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo preview" /> : <Briefcase className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Main Project Logo</label>
            <label className={`cursor-pointer inline-flex border border-border bg-background text-foreground px-3 py-1.5 rounded-md text-xs font-medium items-center hover:bg-muted transition-colors ${uploadingLogo ? 'opacity-50' : ''}`}>
              <input type="file" accept="image/*" onChange={uploadLogo} disabled={uploadingLogo} className="hidden" />
              {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />} Upload Logo
            </label>
          </div>
        </div>

        {/* Gallery Images Upload */}
        <div className="p-4 bg-background/50 rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-muted-foreground block">Gallery Images</label>
            <label className={`cursor-pointer inline-flex border border-border bg-background text-foreground px-3 py-1.5 rounded-md text-xs font-medium items-center hover:bg-muted transition-colors ${uploadingImage ? 'opacity-50' : ''}`}>
              <input type="file" accept="image/*" onChange={uploadImage} disabled={uploadingImage} className="hidden" />
              {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />} Add Image
            </label>
          </div>

          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-2">
              {images.map((img: any, i: number) => (
                <div key={i} className="relative w-16 h-16 border border-border rounded-lg overflow-hidden bg-background group">
                  <img src={img.url} className="w-full h-full object-cover" alt="Gallery item" />
                  <button type="button" onClick={() => removeImg(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-5 border-t border-border">
        <button type="button" onClick={handleCancel} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={loading} className="px-6 py-2 bg-foreground text-background text-sm font-medium rounded-md flex items-center hover:opacity-90 transition-opacity">
          {loading ? "Saving..." : "Save Project"}
        </button>
      </div>
    </div>
  );
}

function ProjectModal({ proj, onClose, language }: any) {
  const [showGallery, setShowGallery] = useState(false);
  const [lightboxImgIndex, setLightboxImgIndex] = useState<number | null>(null);

  const images = useMemo(() => {
    if (!proj.image_url) return [];
    try {
      const parsed = JSON.parse(proj.image_url);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return typeof proj.image_url === 'string' && proj.image_url ? [{ url: proj.image_url }] : [];
  }, [proj.image_url]);

  const hasImages = images.length > 0;

  const depthItems = useMemo(() => {
    if (!hasImages) return [];
    return images.map((img: any, idx: number) => ({
      image: typeof img === 'string' ? img : img.url,
      alt: `${proj.title || 'Project'} image ${idx + 1}`
    }));
  }, [images, proj.title, hasImages]);

  const title = language === 'vi' && proj.title_vi ? proj.title_vi : proj.title;
  const desc = language === 'vi' && proj.description_vi ? proj.description_vi : proj.description;
  const role = language === 'vi' && proj.role_vi ? proj.role_vi : proj.role;
  const techStack = Array.isArray(proj.tech_stack)
    ? proj.tech_stack
    : (Array.isArray(proj.tags) ? proj.tags : (typeof proj.tech_stack === 'string' && proj.tech_stack ? proj.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean) : []));

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    if (dateString.includes('-')) {
      return new Date(dateString).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    }
    return dateString;
  };

  // Keyboard navigation & close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImgIndex !== null) {
          setLightboxImgIndex(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImgIndex, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300 font-sans"
      onClick={onClose}
    >
      {/* Medium-sized Animated Modal Box */}
      <div
        className={`bg-card w-full ${showGallery && hasImages ? 'max-w-4xl' : 'max-w-2xl'} max-h-[85vh] rounded-2xl border border-border shadow-2xl flex flex-col md:flex-row relative overflow-hidden transition-all duration-300 animate-in zoom-in-95 fade-in-0`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 bg-background/90 backdrop-blur-md rounded-full hover:bg-muted text-foreground border border-border/80 shadow-md transition-all hover:scale-105"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT/MAIN CONTAINER: Header + Body */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* POPUP HEADER: Logo, Title & Gallery Button (Bottom-Right) */}
          <div className="relative w-full p-6 bg-card border-b border-border/60 shrink-0">
            <div className="flex items-center gap-4 pr-10">
              {proj.logo_url ? (
                <div className="w-12 h-12 rounded-full border border-border bg-white shrink-0 shadow-md flex items-center justify-center overflow-hidden">
                  <img src={proj.logo_url} className="w-full h-full object-cover" alt="Logo" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full border border-border bg-card p-2 shrink-0 shadow-md flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h2 className="text-2xl font-bold text-foreground tracking-tight truncate">{title}</h2>
                {role && <span className="text-xs font-mono text-muted-foreground truncate">{role}</span>}
              </div>
            </div>

            {/* Gallery Toggle Button at Bottom-Right of Header (ONLY shown if project HAS images) */}
            {hasImages && (
              <button
                onClick={() => setShowGallery(!showGallery)}
                className={`absolute bottom-3 right-4 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm ${showGallery
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background/80 hover:bg-muted text-foreground border-border'
                  }`}
                title="Toggle gallery panel"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gallery ({images.length})</span>
              </button>
            )}
          </div>

          {/* POPUP BODY: Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">

            {/* Meta Info Grid: Dates & Team Size (Only rendered if present) */}
            {((proj.start_date || proj.end_date) || proj.team_size) && (
              <div className="flex flex-wrap items-center gap-4 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono text-muted-foreground">
                {(proj.start_date || proj.end_date) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-foreground/80" />
                    <span>{formatDate(proj.start_date)} — {formatDate(proj.end_date)}</span>
                  </div>
                )}

                {(proj.start_date || proj.end_date) && proj.team_size && <span className="opacity-40">|</span>}

                {proj.team_size && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-foreground/80" />
                    <span>Team Size: <strong className="text-foreground font-semibold">{proj.team_size}</strong> {proj.team_size === 1 ? 'member' : 'members'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description Content */}
            {desc && (
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">About Project</span>
                <div
                  className="text-sm text-muted-foreground/90 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5"
                  dangerouslySetInnerHTML={{ __html: desc }}
                />
              </div>
            )}

            {/* Tech Stack Badges */}
            {techStack && techStack.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Technologies & Tools</span>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech: string, i: number) => (
                    <span key={i} className="text-xs font-mono px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-muted-foreground font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* POPUP FOOTER: Live Demo & Source Code buttons (Only if present) */}
          {(proj.demo_url || proj.github_url) && (
            <div className="p-4 md:p-5 border-t border-border bg-card flex items-center gap-3 shrink-0">
              {proj.demo_url && (
                <a
                  href={proj.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium bg-foreground text-background px-4 py-2 rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity font-mono"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              )}
              {proj.github_url && (
                <a
                  href={proj.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium bg-muted text-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-muted/80 border border-border/80 transition-colors font-mono"
                >
                  <Code className="w-3.5 h-3.5" /> View Source
                </a>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE PANEL: Vertical DepthCarousel Image Stack (ONLY shown when toggled and project has images) */}
        {showGallery && hasImages && (
          <div className="w-full md:w-[320px] h-[350px] md:h-auto bg-background/95 border-t md:border-t-0 md:border-l border-border flex flex-col items-center justify-center p-4 relative animate-in slide-in-from-right duration-300 shrink-0 overflow-hidden">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono self-start">Project Screenshots (3D Depth Stack)</span>
            <div className="w-full h-full flex-1 relative flex items-center justify-center overflow-hidden">
              <DepthCarousel
                items={depthItems}
                cardWidth={400}
                cardHeight={400}
                visibleCards={3}
                spread={100}
                tilt={18}
                tiltDirection="right"
                autoplay={true}
                autoplayDelay={3000}
                showControls={false}
                showIndicators={true}
                onChange={(idx) => { }}
                className="w-full h-full"
              />
            </div>
            <button
              onClick={() => setLightboxImgIndex(0)}
              className="mt-2 text-xs font-mono text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Click card to expand full resolution
            </button>
          </div>
        )}

      </div>

      {/* FULLSCREEN LIGHTBOX IMAGE ZOOM MODAL */}
      {lightboxImgIndex !== null && images[lightboxImgIndex] && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxImgIndex(null)}
        >
          {/* Lightbox Header */}
          <div className="w-full flex items-center justify-between text-white text-xs font-mono max-w-5xl z-10">
            <span>{title} ({lightboxImgIndex + 1} / {images.length})</span>
            <button
              onClick={() => setLightboxImgIndex(null)}
              className="mt-15 p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              title="Close image"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Center Image */}
          <div className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center my-auto" onClick={e => e.stopPropagation()}>
            <img
              src={images[lightboxImgIndex].url}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10"
              alt="Zoom view"
            />

            {/* Prev / Next Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImgIndex((lightboxImgIndex - 1 + images.length) % images.length);
                  }}
                  className="absolute left-2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImgIndex((lightboxImgIndex + 1) % images.length);
                  }}
                  className="absolute right-2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer */}
          <div className="text-white/60 text-xs font-mono z-10">
            Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-white">ESC</kbd> or click outside to exit
          </div>
        </div>
      )}
    </div>
  );
}
