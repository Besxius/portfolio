"use client";

import { useState } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { GraduationCap, ChevronDown, ChevronUp, Plus, Edit2, Trash2, Eye, Loader2, Building2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function Education({ initialEducations = [] }: { initialEducations?: any[] }) {
  const { isAdmin, language } = useAppContext();
  const [educations, setEducations] = useState(initialEducations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [expandedEducations, setExpandedEducations] = useState<Record<string, boolean>>({});

  const visibleEducations = isAdmin ? educations : educations.filter(e => !e.is_hidden);

  const sortedEducations = [...visibleEducations].sort((a, b) => {
    const timeA = a.start_date ? new Date(a.start_date).getTime() : new Date().getTime();
    const timeB = b.start_date ? new Date(b.start_date).getTime() : new Date().getTime();
    return timeB - timeA;
  });

  const handleEdit = (edu: any) => {
    setValidationError(null);
    const techStackStr = Array.isArray(edu.tech_stack)
      ? edu.tech_stack.join(', ')
      : (Array.isArray(edu.skills) ? edu.skills.join(', ') : (edu.tech_stack || edu.skills || ''));

    setFormData({
      ...edu,
      tech_stack_input: techStackStr
    });
    setEditingId(edu.id);
  };

  const handleAddNew = () => {
    setValidationError(null);
    setFormData({
      school: "", school_vi: "",
      degree: "", degree_vi: "",
      major: "", major_vi: "",
      start_date: "", end_date: "",
      description: "", description_vi: "",
      tech_stack_input: "",
      logo_url: "",
      is_hidden: false
    });
    setEditingId("new");
  };

  const handleSave = async () => {
    setValidationError(null);
    const schoolText = (formData.school || formData.school_vi || "").trim();

    if (!schoolText) {
      setValidationError("School / University Name is required.");
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
      const { data, error } = await supabase.from("education").insert([payload]).select();
      if (error) {
        alert("Save Error: " + error.message);
      }
      if (!error && data) {
        setEducations([...educations, data[0]]);
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from("education").update(payload).eq("id", editingId).select();
      if (error) {
        alert("Update Error: " + error.message);
      }
      if (!error && data) {
        setEducations(educations.map(e => e.id === editingId ? data[0] : e));
        setEditingId(null);
      }
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    setConfirmId(id);
  };

  const doDelete = async () => {
    if (!confirmId) return;
    await supabase.from("education").delete().eq("id", confirmId);
    setEducations(educations.filter(e => e.id !== confirmId));
    setConfirmId(null);
  };

  const handleToggleHide = async (edu: any) => {
    const { data } = await supabase.from("education").update({ is_hidden: !edu.is_hidden }).eq("id", edu.id).select();
    if (data) {
      setEducations(educations.map(e => e.id === edu.id ? data[0] : e));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedEducations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    if (dateString.includes('-')) {
      return new Date(dateString).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    }
    return dateString;
  };

  const hasHtmlContent = (str?: string) => {
    if (!str) return false;
    const stripped = str.replace(/<[^>]*>/g, '').trim();
    return stripped.length > 0;
  };

  return (
    <section id="education" className="w-full max-w-4xl mx-auto py-12 flex flex-col font-sans px-4">
      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Education"
        message="Are you sure you want to remove this education entry? This action cannot be undone."
        confirmText="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Education</h2>
        {isAdmin && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground border border-border rounded-md font-medium text-xs transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Education
          </button>
        )}
      </div>

      {editingId && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-xl mb-12">
          <EducationForm 
            formData={formData} 
            setFormData={setFormData} 
            handleSave={handleSave} 
            handleCancel={() => setEditingId(null)} 
            loading={loading}
            validationError={validationError} 
          />
        </div>
      )}

      {visibleEducations.length === 0 && !editingId && (
        <div className="text-center py-10 text-muted-foreground opacity-70 font-mono text-sm"> No education logged. </div>
      )}

      {sortedEducations.length > 0 && !editingId && (
        <div className="flex flex-col w-full">
          {sortedEducations.map((edu) => {
            const schoolName = language === 'vi' && edu.school_vi ? edu.school_vi : edu.school;
            const degreeName = language === 'vi' && edu.degree_vi ? edu.degree_vi : edu.degree;
            const majorName = language === 'vi' && edu.major_vi ? edu.major_vi : edu.major;
            
            const rawDescription = language === 'vi' && edu.description_vi ? edu.description_vi : edu.description;
            const showDescription = hasHtmlContent(rawDescription);

            const techStack = Array.isArray(edu.tech_stack)
              ? edu.tech_stack
              : (Array.isArray(edu.skills) ? edu.skills : (typeof edu.tech_stack === 'string' && edu.tech_stack ? edu.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean) : []));

            const isHidden = edu.is_hidden;
            const isExpanded = !!expandedEducations[edu.id];

            return (
              <div key={edu.id} className={`group relative flex flex-col border-b border-border/50 py-8 first:pt-0 last:border-0 ${isHidden ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex gap-4">
                  {/* Timeline Icon */}
                  <div className="flex flex-col items-center mt-1">
                    {edu.logo_url ? (
                      <div className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm z-10">
                        <img src={edu.logo_url} className="w-full h-full object-cover" alt="Logo" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center shrink-0 shadow-sm z-10">
                        <GraduationCap className="w-4.5 h-4.5 text-muted-foreground" />
                      </div>
                    )}
                    {/* Vertical line */}
                    <div className="w-px h-full bg-border/50 mt-2" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-xl text-foreground tracking-tight">
                        {schoolName}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleToggleHide(edu)} className="p-1 hover:text-foreground text-muted-foreground" title="Toggle visibility"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleEdit(edu)} className="p-1 hover:text-foreground text-muted-foreground" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(edu.id)} className="p-1 hover:text-red-500 text-muted-foreground" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}

                        {/* Chevron Toggle Button - ONLY rendered if description exists */}
                        {showDescription && (
                          <button 
                            onClick={() => toggleExpand(edu.id)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meta (Dates, Degree, Major) */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3 font-mono">
                      {(edu.start_date || edu.end_date) && (
                        <span>{formatDate(edu.start_date)} — {formatDate(edu.end_date)}</span>
                      )}
                      {degreeName && (edu.start_date || edu.end_date) && <span className="opacity-50">|</span>}
                      {degreeName && <span>{degreeName}</span>}
                      {majorName && (degreeName || edu.start_date || edu.end_date) && <span className="opacity-50">|</span>}
                      {majorName && <span>{majorName}</span>}
                    </div>

                    {/* Description / Content (Only rendered if present, max 5 lines unless expanded) */}
                    {showDescription && (
                      <div
                        className={`text-sm text-muted-foreground/90 leading-relaxed mb-3 transition-all [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5 ${
                          isExpanded ? 'line-clamp-none' : 'line-clamp-5'
                        }`}
                        dangerouslySetInnerHTML={{ __html: rawDescription }}
                      />
                    )}

                    {/* Tech Stack / Skills Badges (Only rendered if present) */}
                    {techStack && techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {techStack.map((skill: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EducationForm({ formData, setFormData, handleSave, handleCancel, loading, validationError }: any) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `education-logos/${fileName}`;
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
          {formData.id ? "Edit Education" : "Add Education"}
        </span>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
          {validationError}
        </div>
      )}

      {/* Section 1: English Basic Info */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Basic Information (EN)</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">School / University (EN) *</label>
            <input 
              value={formData.school || ""} 
              onChange={e => setFormData({ ...formData, school: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. FPT University" 
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Degree (EN)</label>
            <input 
              value={formData.degree || ""} 
              onChange={e => setFormData({ ...formData, degree: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Bachelor's degree" 
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Major / Field of Study (EN)</label>
            <input 
              value={formData.major || ""} 
              onChange={e => setFormData({ ...formData, major: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Software Engineering" 
            />
          </div>
        </div>
      </div>

      {/* Section 2: Vietnamese Information */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vietnamese Information (VI)</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">School / University (VI)</label>
            <input 
              value={formData.school_vi || ""} 
              onChange={e => setFormData({ ...formData, school_vi: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Đại học FPT" 
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Degree (VI)</label>
            <input 
              value={formData.degree_vi || ""} 
              onChange={e => setFormData({ ...formData, degree_vi: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Cử nhân" 
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block">Major / Field of Study (VI)</label>
            <input 
              value={formData.major_vi || ""} 
              onChange={e => setFormData({ ...formData, major_vi: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
              placeholder="e.g. Kỹ thuật phần mềm" 
            />
          </div>
        </div>
      </div>

      {/* Section 3: Duration */}
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
            <label className="text-[10px] font-semibold text-muted-foreground block">End Date</label>
            <input 
              type="date" 
              value={formData.end_date || ""} 
              onChange={e => setFormData({ ...formData, end_date: e.target.value })} 
              className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
            />
          </div>
        </div>
      </div>

      {/* Section 4: Descriptions */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description & Activities</span>
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

      {/* Section 5: Tech Stack / Skills */}
      <div className="border-t border-border pt-4 space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Technologies & Skills</span>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground block">Tech Stack / Skills (Comma-separated)</label>
          <input 
            value={formData.tech_stack_input || ""} 
            onChange={e => setFormData({ ...formData, tech_stack_input: e.target.value })} 
            className="w-full px-3.5 py-2 rounded-md border border-input bg-background hover:bg-muted focus:ring-1 focus:ring-foreground text-sm outline-none mt-1" 
            placeholder="e.g. C++, Java, Data Structures, Algorithms, System Design" 
          />
        </div>
      </div>

      {/* Section 6: School Logo */}
      <div className="border-t border-border pt-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-muted rounded-md border border-border flex items-center justify-center shrink-0 overflow-hidden">
          {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain p-1" alt="Logo preview" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">School Logo</label>
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
          {loading ? "Saving..." : "Save Education"}
        </button>
      </div>
    </div>
  );
}
