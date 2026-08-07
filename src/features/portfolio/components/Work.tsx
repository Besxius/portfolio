"use client";

import { useState } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Plus, Trash2, Eye, Building2, Code2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function Work({ initialWorks }: { initialWorks: any[] }) {
  const { isAdmin, language } = useAppContext();
  const [works, setWorks] = useState(initialWorks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedWorks, setExpandedWorks] = useState<Record<string, boolean>>({});

  const visibleWorks = isAdmin ? works : works.filter(w => !w.is_hidden);

  const sortedWorks = [...visibleWorks].sort((a, b) => {
    const timeA = a.start_date ? new Date(a.start_date).getTime() : new Date().getTime();
    const timeB = b.start_date ? new Date(b.start_date).getTime() : new Date().getTime();
    return timeB - timeA;
  });

  // Group by company
  const groupedWorks: { company: string, logo_url: string, location: string, roles: any[] }[] = [];

  sortedWorks.forEach(work => {
    const companyName = language === 'vi' && work.company_vi ? work.company_vi : work.company;
    const locationStr = language === 'vi' && work.location_vi ? work.location_vi : work.location;

    let group = groupedWorks.find(g => g.company === companyName);
    if (!group) {
      group = {
        company: companyName,
        logo_url: work.logo_url,
        location: locationStr,
        roles: []
      };
      groupedWorks.push(group);
    }
    group.roles.push(work);
  });

  const handleEdit = (w: any) => {
    setValidationError(null);
    const techStackStr = Array.isArray(w.tech_stack) 
      ? w.tech_stack.join(', ') 
      : (w.tech_stack || '');
    
    setFormData({
      ...w,
      tech_stack_input: techStackStr
    });
    setEditingId(w.id);
  };

  const handleAddNew = () => {
    setValidationError(null);
    setFormData({
      company: "", company_vi: "",
      role: "", role_vi: "",
      work_type: "Full-time", work_type_vi: "Toàn thời gian",
      location: "", location_vi: "",
      description: "", description_vi: "",
      tech_stack_input: "",
      logo_url: "",
      start_date: "", end_date: "",
      is_hidden: false
    });
    setEditingId("new");
  };

  const handleSave = async () => {
    setValidationError(null);
    const companyText = (formData.company || formData.company_vi || "").trim();
    const roleText = (formData.role || formData.role_vi || "").trim();

    if (!companyText) {
      setValidationError("Company Name is required.");
      return;
    }
    if (!roleText) {
      setValidationError("Role / Position is required.");
      return;
    }

    setLoading(true);
    const techStackArr = formData.tech_stack_input 
      ? formData.tech_stack_input.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const payload = { ...formData };
    delete payload.tech_stack_input;
    payload.tech_stack = techStackArr;

    if (!payload.start_date) payload.start_date = null;
    if (!payload.end_date) payload.end_date = null;

    if (editingId === "new") {
      const { data, error } = await supabase.from("work_history").insert([payload]).select();
      if (error) {
        alert("Save Error: " + error.message);
      }
      if (!error && data) {
        setWorks([...works, data[0]]);
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from("work_history").update(payload).eq("id", editingId).select();
      if (error) {
        alert("Update Error: " + error.message);
      }
      if (!error && data) {
        setWorks(works.map(w => w.id === editingId ? data[0] : w));
        setEditingId(null);
      }
    }
    setLoading(false);
  };

  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setConfirmId(id);
  };

  const doDelete = async () => {
    if (!confirmId) return;
    await supabase.from("work_history").delete().eq("id", confirmId);
    setWorks(works.filter(w => w.id !== confirmId));
    setConfirmId(null);
  };

  const handleToggleHide = async (w: any) => {
    const { data } = await supabase.from("work_history").update({ is_hidden: !w.is_hidden }).eq("id", w.id).select();
    if (data) { setWorks(works.map(p => p.id === w.id ? data[0] : p)); }
  };

  const toggleExpand = (id: string) => {
    setExpandedWorks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
  };

  const getDuration = (start?: string, end?: string) => {
    if (!start) return "";
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : new Date();

    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();

    if (months <= 0) return "1m";

    const y = Math.floor(months / 12);
    const m = months % 12;

    const res = [];
    if (y > 0) res.push(`${y}y`);
    if (m > 0) res.push(`${m}m`);

    return res.join(" ");
  };

  const hasHtmlContent = (str?: string) => {
    if (!str) return false;
    const stripped = str.replace(/<[^>]*>/g, '').trim();
    return stripped.length > 0;
  };

  return (
    <section id="work" className="w-full max-w-4xl mx-auto py-12 flex flex-col font-sans px-4">
      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Work Experience"
        message="Are you sure you want to remove this work experience entry? This action cannot be undone."
        confirmText="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Experience</h2>
        {isAdmin && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground border border-border rounded-md font-medium text-xs transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </button>
        )}
      </div>

      {editingId && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-xl mb-12">
          <WorkForm 
            formData={formData} 
            setFormData={setFormData} 
            handleSave={handleSave} 
            handleCancel={() => setEditingId(null)} 
            loading={loading}
            validationError={validationError} 
          />
        </div>
      )}

      {visibleWorks.length === 0 && !editingId && (
        <div className="text-center py-10 text-muted-foreground opacity-70 font-mono text-sm"> No work experience logged. </div>
      )}

      {groupedWorks.length > 0 && !editingId && (
        <div className="flex flex-col w-full">
          {groupedWorks.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col border-b border-border/50 py-8 first:pt-0 last:border-0 relative">

              {/* Company Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {group.logo_url ? (
                    <div className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img src={group.logo_url} className="w-full h-full object-cover" alt="Logo" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center shrink-0 shadow-sm">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="font-bold text-xl text-foreground tracking-tight">
                    {group.company}
                  </h3>
                </div>
                {group.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                    <span>{group.location}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  </div>
                )}
              </div>

              {/* Roles List */}
              <div className="flex flex-col gap-8 relative">
                {/* Timeline vertical line */}
                <div className="absolute left-[17px] top-0 bottom-0 w-px bg-border/50 z-0"></div>

                {group.roles.map((work) => {
                  const roleName = language === 'vi' && work.role_vi ? work.role_vi : work.role;
                  const workType = language === 'vi' && work.work_type_vi ? work.work_type_vi : work.work_type;
                  const duration = getDuration(work.start_date, work.end_date);
                  const isHidden = work.is_hidden;

                  const rawDescription = language === 'vi' && work.description_vi ? work.description_vi : work.description;
                  const showDescription = hasHtmlContent(rawDescription);

                  const techStack = Array.isArray(work.tech_stack) 
                    ? work.tech_stack 
                    : (typeof work.tech_stack === 'string' && work.tech_stack ? work.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

                  const isExpanded = !!expandedWorks[work.id];

                  return (
                    <div key={work.id} className={`group/role flex gap-6 relative z-10 ${isHidden ? 'opacity-50 grayscale' : ''}`}>

                      {/* Timeline Dot Icon */}
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center shrink-0 z-10 shadow-sm">
                          <Code2 className="w-4.5 h-4.5 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-foreground text-base">{roleName}</h4>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <div className="flex gap-1.5 opacity-0 group-hover/role:opacity-100 transition-opacity">
                                <button onClick={() => handleToggleHide(work)} className="p-1 hover:text-foreground text-muted-foreground" title="Toggle visibility"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => handleEdit(work)} className="p-1 hover:text-foreground text-muted-foreground" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(work.id)} className="p-1 hover:text-red-500 text-muted-foreground" title="Delete"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}

                            {/* Chevron Toggle Button - ONLY shown if description content exists */}
                            {showDescription && (
                              <button 
                                onClick={() => toggleExpand(work.id)}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-mono mb-3">
                          {workType && <span>{workType}</span>}
                          {workType && (work.start_date || work.end_date) && <span className="opacity-50">|</span>}
                          {(work.start_date || work.end_date) && (
                            <span>{formatDate(work.start_date)} — {formatDate(work.end_date)}</span>
                          )}
                          {duration && <span className="opacity-50">|</span>}
                          {duration && <span>{duration}</span>}
                        </div>

                        {/* Description / Content (Render max 5 lines unless expanded) */}
                        {showDescription && (
                          <div
                            className={`text-sm text-muted-foreground/90 leading-relaxed mb-3 transition-all [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5 ${
                              isExpanded ? 'line-clamp-none' : 'line-clamp-5'
                            }`}
                            dangerouslySetInnerHTML={{ __html: rawDescription }}
                          />
                        )}

                        {/* Tech Stack Badges (Only rendered if present) */}
                        {techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {techStack.map((tech: string, i: number) => (
                              <span key={i} className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WorkForm({ formData, setFormData, handleSave, handleCancel, loading, validationError }: any) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    const { error } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (!error) {
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
      setFormData({ ...formData, logo_url: data.publicUrl });
    }
    setUploadingImage(false);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {formData.id ? "Edit Work Experience" : "Add Work Experience"}
        </span>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
          {validationError}
        </div>
      )}

      {/* Section 1: English Details */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Basic Information (EN)</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Company Name (EN) *</label>
            <input 
              value={formData.company || ""} 
              onChange={e => setFormData({ ...formData, company: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Acme Corp" 
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Role / Position (EN) *</label>
            <input 
              value={formData.role || ""} 
              onChange={e => setFormData({ ...formData, role: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Senior Frontend Developer" 
            />
          </div>
        </div>
      </div>

      {/* Section 2: Vietnamese Details */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vietnamese Information (VI)</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Company Name (VI)</label>
            <input 
              value={formData.company_vi || ""} 
              onChange={e => setFormData({ ...formData, company_vi: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Công ty Acme" 
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Role / Position (VI)</label>
            <input 
              value={formData.role_vi || ""} 
              onChange={e => setFormData({ ...formData, role_vi: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Lập trình viên Frontend" 
            />
          </div>
        </div>
      </div>

      {/* Section 3: Work Type & Location */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Employment & Location</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Work Type (EN)</label>
            <input 
              list="work-type-options-en"
              value={formData.work_type || ""} 
              onChange={e => setFormData({ ...formData, work_type: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Full-time" 
            />
            <datalist id="work-type-options-en">
              <option value="Full-time" />
              <option value="Part-time" />
              <option value="Contract" />
              <option value="Remote" />
              <option value="Freelance" />
              <option value="Internship" />
            </datalist>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Work Type (VI)</label>
            <input 
              list="work-type-options-vi"
              value={formData.work_type_vi || ""} 
              onChange={e => setFormData({ ...formData, work_type_vi: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Toàn thời gian" 
            />
            <datalist id="work-type-options-vi">
              <option value="Toàn thời gian" />
              <option value="Bán thời gian" />
              <option value="Hợp đồng dịch vụ" />
              <option value="Từ xa" />
              <option value="Tự do" />
              <option value="Thực tập" />
            </datalist>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Location (EN)</label>
            <input 
              value={formData.location || ""} 
              onChange={e => setFormData({ ...formData, location: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. San Francisco, CA" 
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Location (VI)</label>
            <input 
              value={formData.location_vi || ""} 
              onChange={e => setFormData({ ...formData, location_vi: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. TP. Hồ Chí Minh" 
            />
          </div>
        </div>
      </div>

      {/* Section 4: Dates */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Duration</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Start Date</label>
            <input 
              type="date" 
              value={formData.start_date || ""} 
              onChange={e => setFormData({ ...formData, start_date: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">End Date (Leave blank for Present)</label>
            <input 
              type="date" 
              value={formData.end_date || ""} 
              onChange={e => setFormData({ ...formData, end_date: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
            />
          </div>
        </div>
      </div>

      {/* Section 5: Descriptions */}
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

      {/* Section 6: Tech Stack */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Technologies</span>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground block">Tech Stack (Comma-separated)</label>
          <input 
            value={formData.tech_stack_input || ""} 
            onChange={e => setFormData({ ...formData, tech_stack_input: e.target.value })} 
            className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
            placeholder="e.g. React, TypeScript, Next.js, Tailwind CSS, Supabase" 
          />
        </div>
      </div>

      {/* Section 7: Company Logo */}
      <div className="border-t border-border pt-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-muted rounded-md border border-border flex items-center justify-center shrink-0 overflow-hidden">
          {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain p-1" alt="Logo preview" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Company Logo</label>
          <label className={`cursor-pointer inline-flex border border-border bg-background text-foreground px-3 py-1.5 rounded-md text-xs font-medium items-center hover:bg-muted transition-colors ${uploadingImage ? 'opacity-50' : ''}`}>
            <input type="file" accept="image/*" onChange={uploadLogo} disabled={uploadingImage} className="hidden" />
            {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />} Upload Logo
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-5 border-t border-border">
        <button type="button" onClick={handleCancel} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={loading} className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          {loading ? "Saving..." : "Save Experience"}
        </button>
      </div>
    </div>
  );
}
