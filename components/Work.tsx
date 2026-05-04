"use client";

import { useState } from "react";
import { useAppContext } from "./providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Plus, Trash2, Eye, Building2, MapPin, Briefcase } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

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
    if (!dateString) return language === 'vi' ? 'Hiện tại' : 'Present';
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' });
  };
  const getYear = (dateString?: string) => {
    if (!dateString) return new Date().getFullYear().toString();
    return new Date(dateString).getFullYear().toString();
  };

  return (
    <section id="work" className="py-24 max-w-[1400px] mx-auto relative flex flex-col justify-center min-h-[60vh] overflow-hidden">
      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Work Experience"
        message="Are you sure you want to remove this work experience entry? This action cannot be undone."
        confirmText="Delete"
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
          <Building2 className="w-24 h-24 text-primary opacity-80" />
        </div>
        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tight mb-6 text-primary">{t.sections.workTitle || "Work Experience"}</h2>
        <div className="flex items-center justify-center mb-6">
          <div className="h-[2px] w-12 bg-primary/20" />
          <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] mx-4" />
          <div className="h-[2px] w-12 bg-primary/20" />
        </div>
        <p className="font-sans text-muted-foreground md:text-lg">
          {t.sections.workDesc || "My professional career journey"}
        </p>
      </div>

      <div className="absolute top-32 right-10 z-30">
        {isAdmin && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-6 py-2.5 hover:bg-primary/20 bg-primary/10 text-primary border border-primary/50 rounded-xl font-sans font-bold text-sm shadow-md backdrop-blur-md transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> {t.admin.addWork || "Add Work"}
          </button>
        )}
      </div>

      {editingId && (
        <div className="bg-card/90 backdrop-blur-md p-8 rounded-3xl border border-primary/50 shadow-2xl mb-12 max-w-4xl mx-auto relative z-20">
          <WorkForm language={language} formData={formData} setFormData={setFormData} handleSave={handleSave} handleCancel={() => setEditingId(null)} loading={loading} />
        </div>
      )}

      {visibleWorks.length === 0 && !editingId && (
        <div className="text-center py-20 text-muted-foreground opacity-70 font-mono z-10 relative"> No work experience logged. </div>
      )}

      {visibleWorks.length > 0 && !editingId && (
        <div className="relative w-full overflow-x-auto pb-12 pt-8 px-8 snap-x snap-mandatory flex gap-8 items-start scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {/* Horizontal Connecting Line */}
          <div className="absolute top-[5rem] left-8 right-8 h-[2px] bg-primary/30 -z-10 rounded-full" />

          {sortedWorks.map((work, idx) => {
            const year = getYear(work.start_date);
            const isHidden = work.is_hidden;

            return (
              <div key={work.id} className={`snap-center shrink-0 w-[300px] md:w-[350px] relative flex flex-col items-center group transition-all ${isHidden ? 'opacity-50 grayscale' : ''}`}>

                {/* Year Badge */}
                <div className="bg-background text-primary font-mono text-sm font-bold px-4 py-1.5 rounded-full border border-primary/40 shadow-md mb-5 z-10 whitespace-nowrap">
                  {year}
                </div>

                {/* Timeline Dot */}
                <div className="w-5 h-5 bg-primary rounded-full border-4 border-background shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] z-10 mb-8 group-hover:scale-150 transition-transform" />

                {/* Content Card */}
                <div className="w-full bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl hover:border-primary/50 transition-colors mt-2 relative">

                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-1 z-40 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggleHide(work)} className="p-1.5 bg-background border border-border rounded-full hover:text-primary shadow-sm"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleEdit(work)} className="p-1.5 bg-background border border-border text-primary rounded-full shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(work.id)} className="p-1.5 bg-background border border-border text-red-500 rounded-full shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-background flex items-center justify-center overflow-hidden border border-border/50 shrink-0 shadow-sm">
                      {work.logo_url ? (
                        <img src={work.logo_url} className="w-full h-full object-contain p-1.5" alt="Logo" />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold font-sans text-lg text-foreground truncate" title={language === 'vi' && work.company_vi ? work.company_vi : work.company}>
                        {language === 'vi' && work.company_vi ? work.company_vi : work.company}
                      </h3>
                      <p className="text-sm font-sans font-bold text-primary truncate">
                        {language === 'vi' && work.role_vi ? work.role_vi : work.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-border/50 text-sm font-sans text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="truncate">{language === 'vi' && work.work_type_vi ? work.work_type_vi : work.work_type}</span>
                    </div>
                    {((language === 'vi' && work.location_vi) || work.location) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                        <span className="truncate">{language === 'vi' && work.location_vi ? work.location_vi : work.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs font-mono font-bold pt-2 mt-2 border-t border-border/30">
                      {formatDate(work.start_date)} — {formatDate(work.end_date)}
                    </div>
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
        <h3 className="font-bold text-xl text-primary font-mono">&lt; Edit_Work_History /&gt;</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        <div className="space-y-4 bg-card/50 p-6 rounded-3xl border border-border">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🇺🇸</span> <span className="font-bold text-sm">English</span></div>
          <input value={formData.company || ""} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" placeholder="Company Name" />
          <input value={formData.role || ""} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Role/Position" />
          <input value={formData.work_type || ""} onChange={e => setFormData({ ...formData, work_type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Work Type (Remote, Full-time, etc.)" />
          <input value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Location" />
        </div>
        <div className="space-y-4 bg-card/50 p-6 rounded-3xl border border-border">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🇻🇳</span> <span className="font-bold text-sm">Tiếng Việt</span></div>
          <input value={formData.company_vi || ""} onChange={e => setFormData({ ...formData, company_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" placeholder="Tên Công Ty (nếu có)" />
          <input value={formData.role_vi || ""} onChange={e => setFormData({ ...formData, role_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Vị trí/Vai trò" />
          <input value={formData.work_type_vi || ""} onChange={e => setFormData({ ...formData, work_type_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Hình thức làm việc (Từ xa, Toàn thời gian)" />
          <input value={formData.location_vi || ""} onChange={e => setFormData({ ...formData, location_vi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none shadow-sm" placeholder="Địa điểm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/30 p-6 rounded-3xl border border-border text-sm">
        <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2 block">Start Date</label><input type="date" value={formData.start_date || ""} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all shadow-sm outline-none" /></div>
        <div><label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2 block">End Date (Optional/Present)</label><input type="date" value={formData.end_date || ""} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all shadow-sm outline-none" /></div>
      </div>

      <div className="bg-card/30 p-6 rounded-3xl border border-border flex items-center gap-6">
        <div className="w-20 h-20 bg-background rounded-xl border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
          {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain p-2" /> : <Building2 className="w-8 h-8 text-muted-foreground/30" />}
        </div>
        <div className="flex-1">
          <label className={`cursor-pointer inline-flex bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold items-center hover:bg-primary/20 transition-colors ${uploadingImage ? 'opacity-50' : ''}`}>
            <input type="file" accept="image/*" onChange={uploadLogo} disabled={uploadingImage} className="hidden" />
            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Upload Company Logo
          </label>
          <p className="text-xs text-muted-foreground mt-2 font-mono">Square format (PNG/JPG) recommended. Transparent background looks best.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
        <button type="button" onClick={handleCancel} className="px-6 py-2 border rounded-xl bg-background font-bold hover:bg-muted">Cancel</button>
        <button type="button" onClick={handleSave} disabled={loading} className="px-8 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90">{loading ? "Saving..." : "Save Work Experience"}</button>
      </div>
    </div>
  )
}
