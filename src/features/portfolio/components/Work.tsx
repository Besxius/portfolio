"use client";

import { useState } from "react";
import { useAppContext } from "@/components/providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Plus, Trash2, Eye, Building2, MapPin, Briefcase, Code2, ChevronDown, RefreshCw } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function Work({ initialWorks }: { initialWorks: any[] }) {
  const { t, isAdmin, language } = useAppContext();
  const [works, setWorks] = useState(initialWorks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

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
    setFormData(w);
    setEditingId(w.id);
  };

  const handleAddNew = () => {
    setFormData({
      company: "", company_vi: "",
      role: "", role_vi: "",
      work_type: "Full-time", work_type_vi: "Toàn thời gian",
      location: "", location_vi: "",
      logo_url: "",
      start_date: "", end_date: "",
      is_hidden: false
    });
    setEditingId("new");
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...formData };
    if (!payload.start_date) payload.start_date = null;
    if (!payload.end_date) payload.end_date = null;

    if (editingId === "new") {
      const { data, error } = await supabase.from("work_history").insert([payload]).select();
      if (error) {
        alert("Lỗi lưu dữ liệu: " + error.message + "\n(Vui lòng chắc chắn bạn đã tạo bảng work_history trên Supabase)");
      }
      if (!error && data) {
        setWorks([...works, data[0]]);
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from("work_history").update(payload).eq("id", editingId).select();
      if (error) {
        alert("Lỗi cập nhật: " + error.message);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '∞';
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

  // Hardcoded mock data for bullet points and badges since DB doesn't have it
  const getMockDetails = (company: string, role: string) => {
    return {
      bullets: [
        "Design and build Pro components/blocks, from Figma to production-ready React.",
        "Build and maintain the @shadcncraft registry.",
        "Build and enhance features for the marketing website."
      ],
      badges: ["TypeScript", "Next.js", "Tailwind CSS"]
    };
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
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>

      {editingId && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-xl mb-12">
          <WorkForm language={language} formData={formData} setFormData={setFormData} handleSave={handleSave} handleCancel={() => setEditingId(null)} loading={loading} />
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
                    <div className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <img src={group.logo_url} className="w-full h-full object-cover" alt="Logo" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="font-bold text-lg text-foreground tracking-tight">
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
                {/* Timeline vertical line that spans across all roles */}
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border/50 z-0"></div>

                {group.roles.map((work, roleIndex) => {
                  const roleName = language === 'vi' && work.role_vi ? work.role_vi : work.role;
                  const workType = language === 'vi' && work.work_type_vi ? work.work_type_vi : work.work_type;
                  const duration = getDuration(work.start_date, work.end_date);
                  const isHidden = work.is_hidden;
                  const mock = getMockDetails(group.company, roleName);

                  return (
                    <div key={work.id} className={`group/role flex gap-6 relative z-10 ${isHidden ? 'opacity-50 grayscale' : ''}`}>
                      
                      {/* Timeline Dot Icon */}
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center shrink-0 z-10">
                          <Code2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-foreground text-[15px]">{roleName}</h4>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <div className="flex gap-1 opacity-0 group-hover/role:opacity-100 transition-opacity">
                                <button onClick={() => handleToggleHide(work)} className="p-1 hover:text-foreground text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleEdit(work)} className="p-1 hover:text-foreground text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(work.id)} className="p-1 hover:text-red-500 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                            <button className="p-1 text-muted-foreground hover:text-foreground">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono mb-4">
                          <span>{workType}</span>
                          <span className="opacity-50">|</span>
                          <span>{formatDate(work.start_date)} — {formatDate(work.end_date)}</span>
                          <span className="opacity-50">|</span>
                          <span>{duration}</span>
                        </div>

                        {/* Bullets */}
                        <ul className="space-y-2 mb-4">
                          {mock.bullets.map((bullet, i) => (
                            <li key={i} className="flex gap-2 text-sm text-muted-foreground/90 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0 mt-1.5"></span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mock.badges.map((badge, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-muted/50 border border-border/50 text-muted-foreground">
                              {badge}
                            </span>
                          ))}
                        </div>
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

function WorkForm({ language, formData, setFormData, handleSave, handleCancel, loading }: any) {
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
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h3 className="font-bold text-lg text-foreground font-mono">Edit Work History</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="font-medium text-sm text-muted-foreground mb-2">English</div>
          <input value={formData.company || ""} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Company Name" />
          <input value={formData.role || ""} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Role/Position" />
          <input value={formData.work_type || ""} onChange={e => setFormData({ ...formData, work_type: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Work Type" />
          <input value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Location" />
        </div>
        <div className="space-y-4">
          <div className="font-medium text-sm text-muted-foreground mb-2">Vietnamese</div>
          <input value={formData.company_vi || ""} onChange={e => setFormData({ ...formData, company_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Company Name (VI)" />
          <input value={formData.role_vi || ""} onChange={e => setFormData({ ...formData, role_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Role/Position (VI)" />
          <input value={formData.work_type_vi || ""} onChange={e => setFormData({ ...formData, work_type_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Work Type (VI)" />
          <input value={formData.location_vi || ""} onChange={e => setFormData({ ...formData, location_vi: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder="Location (VI)" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-xs text-muted-foreground font-mono block mb-1">Start Date</label><input type="date" value={formData.start_date || ""} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" /></div>
        <div><label className="text-xs text-muted-foreground font-mono block mb-1">End Date (Empty = Present)</label><input type="date" value={formData.end_date || ""} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" /></div>
      </div>

      <div className="flex items-center gap-4 border-t border-border pt-6">
        <div className="w-12 h-12 bg-muted rounded-md border border-border flex items-center justify-center shrink-0 overflow-hidden">
          {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain p-1" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <label className={`cursor-pointer inline-flex border border-border bg-background text-foreground px-3 py-1.5 rounded-md text-xs font-medium items-center hover:bg-muted transition-colors ${uploadingImage ? 'opacity-50' : ''}`}>
            <input type="file" accept="image/*" onChange={uploadLogo} disabled={uploadingImage} className="hidden" />
            {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Plus className="w-3 h-3 mr-2" />} Upload Logo
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button type="button" onClick={handleCancel} className="px-4 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-muted">Cancel</button>
        <button type="button" onClick={handleSave} disabled={loading} className="px-4 py-1.5 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90">{loading ? "Saving..." : "Save"}</button>
      </div>
    </div>
  )
}
