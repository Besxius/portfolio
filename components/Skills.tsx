"use client";

import { useState } from "react";
import { useAppContext } from "./providers";
import { supabase } from "@/lib/supabase";
import { Edit2, Plus, Trash2, Check, X, Code2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";
import { useRouter } from "next/navigation";

function LevelBars({ level, onChange }: { level: number, onChange?: (val: number) => void }) {
  // Normalize old 0-100 values to 1-5
  const displayLevel = level > 5 ? Math.max(1, Math.round(level / 20)) : Math.max(1, level);
  
  return (
    <div className="flex gap-1.5 w-full items-center">
      {[1, 2, 3, 4, 5].map((val) => (
        <div
          key={val}
          onClick={() => onChange && onChange(val)}
          className={`h-2.5 rounded-full flex-1 transition-all ${onChange ? 'cursor-pointer hover:scale-110' : ''} ${val <= displayLevel ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]' : 'bg-muted border border-border/50'}`}
        />
      ))}
    </div>
  );
}

function CategoryEditor({ title, table, items, setItems, hasLogo = true, onChanged }: any) {
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState(3);
  const [newLogo, setNewLogo] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrlCallback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Math.random()}.${fileExt}`;
    const filePath = `skills/${fileName}`;
    const { error } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (!error) {
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
      setUrlCallback(data.publicUrl);
    }
    setUploading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const payload: any = { name: newName.trim(), level: newLevel };
    if (hasLogo) payload.logo_url = newLogo;
    
    const { data, error } = await supabase.from(table).insert([payload]).select();
    if (!error && data) {
      setItems([...items, data[0]]);
      setNewName("");
      setNewLevel(3);
      setNewLogo("");
      if (onChanged) onChanged();
    }
  };

  const doDelete = async () => {
    if (!confirmId) return;
    await supabase.from(table).delete().eq("id", confirmId);
    setItems(items.filter((i: any) => i.id !== confirmId));
    setConfirmId(null);
    if (onChanged) onChanged();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditData({ ...item, level: item.level > 5 ? Math.max(1, Math.round(item.level / 20)) : item.level });
  };

  const saveEdit = async () => {
    const { data, error } = await supabase.from(table).update(editData).eq("id", editingId).select();
    if (!error && data) {
      setItems(items.map((i: any) => i.id === editingId ? data[0] : i));
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6 bg-background p-6 rounded-3xl border border-input shadow-inner w-full min-w-0 flex flex-col">
      <ConfirmModal 
        isOpen={!!confirmId}
        title="Delete Skill"
        message="Are you sure you want to remove this item? This action cannot be undone."
        confirmText="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />

      <h4 className="font-bold text-lg border-b border-border pb-2 text-primary truncate">{title}</h4>
      
      {/* ADD FORM */}
      <form onSubmit={handleAdd} className="space-y-4 shrink-0 w-full overflow-hidden">
        <div>
          <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" placeholder={`Add ${title}...`} />
        </div>
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Level</span>
           <LevelBars level={newLevel} onChange={setNewLevel} />
        </div>
        {hasLogo && (
          <div className="flex items-center justify-between gap-2 mt-2">
            <label className="cursor-pointer flex-1 bg-primary/20 text-primary px-3 py-2 text-xs font-bold rounded-xl text-center hover:bg-primary/30 transition-colors truncate shadow-sm">
              <input type="file" accept="image/*" onChange={e => handleUpload(e, setNewLogo)} className="hidden"/>
              {uploading ? "Uploading..." : "Upload Logo"}
            </label>
            {newLogo && <img src={newLogo} alt="Logo" className="w-9 h-9 rounded-xl shrink-0 object-contain bg-muted p-1 border border-border" /> }
          </div>
        )}
        <button type="submit" disabled={!newName || uploading} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl flex justify-center items-center gap-2 text-sm shadow-md hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4"/> Add New
        </button>
      </form>

      {/* LIST */}
      <div className="space-y-3 mt-4 max-h-72 overflow-y-auto overflow-x-hidden pr-2 flex-1 w-full">
        {items.map((item: any) => (
          <div key={item.id} className="p-3 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2 w-full transition-all hover:border-primary/30">
            {editingId === item.id ? (
              // EDIT MODE
              <div className="space-y-4 w-full">
                <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all font-sans text-sm outline-none font-bold shadow-sm" />
                <div className="flex flex-col gap-2 w-full">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Level</span>
                   <LevelBars level={editData.level} onChange={(val) => setEditData({...editData, level: val})} />
                </div>
                {hasLogo && (
                  <div className="flex items-center justify-between gap-2">
                    <label className="cursor-pointer flex-1 bg-primary/10 text-primary px-3 py-2 text-xs font-bold rounded-xl text-center hover:bg-primary/20 transition-colors truncate shadow-sm">
                      <input type="file" accept="image/*" onChange={e => handleUpload(e, (url) => setEditData({...editData, logo_url: url}))} className="hidden"/>
                      {uploading ? "..." : "Change Logo"}
                    </label>
                    {editData.logo_url && <img src={editData.logo_url} alt="Logo" className="w-9 h-9 rounded-xl shrink-0 object-contain bg-muted p-1 border border-border" /> }
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <button onClick={saveEdit} disabled={uploading} className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm hover:opacity-90"><Check className="w-3.5 h-3.5"/> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-muted text-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm hover:bg-muted/80"><X className="w-3.5 h-3.5"/> Cancel</button>
                </div>
              </div>
            ) : (
              // VIEW MODE
              <div className="flex justify-between items-center w-full min-w-0 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {hasLogo && (
                     item.logo_url ? <img src={item.logo_url} className="w-10 h-10 rounded-lg overflow-hidden p-1.5 bg-muted border border-border shrink-0 object-contain" /> : <div className="w-10 h-10 rounded-lg bg-muted border border-border shrink-0 flex items-center justify-center"><Code2 className="w-5 h-5 text-muted-foreground/50"/></div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1 gap-1 w-full">
                    <span className="font-bold font-sans text-sm truncate">{item.name}</span>
                    <LevelBars level={item.level} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => startEdit(item)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                  <button onClick={() => setConfirmId(item.id)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Skills({ initialLanguages, initialFrameworks, initialDevTools, initialCapabilities }: any) {
  const { t, isAdmin, language } = useAppContext();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);

  const [langs, setLangs] = useState(initialLanguages || []);
  const [frames, setFrames] = useState(initialFrameworks || []);
  const [tools, setTools] = useState(initialDevTools || []);
  const [caps, setCaps] = useState(initialCapabilities || []);

  return (
    <section id="skills" className="py-24 relative min-h-[60vh]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce"/>
        </div>
        <div className="h-16 w-px border-l-2 border-dashed border-primary/30" />
      </div>

      <div className="text-center mb-24 relative z-10 pt-16">
        <div className="flex justify-center mb-8">
           <Code2 className="w-24 h-24 text-primary opacity-80" />
        </div>
        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tight mb-4 text-primary">
          {t.sections.skillsTitle}
        </h2>
        <div className="w-32 h-1 bg-primary mx-auto rounded-full mb-8 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
        <p className="font-sans text-muted-foreground md:text-lg">
          {t.sections.skillsDesc}
        </p>
      </div>

      {isAdmin && !isEditing && (
        <div className="absolute top-32 right-10 z-40">
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 hover:bg-primary/20 bg-primary/10 text-primary border border-primary/50 rounded-xl font-sans font-bold text-sm shadow-md backdrop-blur-md transition-all hover:scale-105">
            <Edit2 className="w-4 h-4" /> {language === 'vi' ? 'Sửa Kỹ Năng' : 'Edit Skills'}
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="max-w-[1600px] mx-auto space-y-8 bg-card/90 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] border border-border shadow-2xl relative z-20 w-[95%]">
          <div className="flex items-center justify-between border-b border-border pb-6 w-full">
            <div className="flex items-center gap-3">
               <Edit2 className="w-8 h-8 text-primary" />
               <h3 className="font-extrabold text-3xl font-mono text-primary">&lt; Edit_Skills /&gt;</h3>
            </div>
            <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:opacity-90 flex items-center gap-2">
               <Check className="w-5 h-5"/> Done
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full items-start">
            <CategoryEditor title="Languages" table="languages" items={langs} setItems={setLangs} onChanged={() => router.refresh()} />
            <CategoryEditor title="Frameworks" table="frameworks" items={frames} setItems={setFrames} onChanged={() => router.refresh()} />
            <CategoryEditor title="Dev Tools" table="dev_tools" items={tools} setItems={setTools} onChanged={() => router.refresh()} />
            <CategoryEditor title="Capabilities" table="capabilities" items={caps} setItems={setCaps} hasLogo={false} onChanged={() => router.refresh()} />
          </div>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto px-4 relative z-10 flex border-t border-border/50 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 w-full">
            {/* Languages */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Languages
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>
              <div className="grid grid-cols-2 gap-6 w-full place-items-center">
                {langs.map((item: any) => (
                  <div key={item.id} className="flex flex-col items-center gap-4 group w-full px-2">
                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-primary/20 bg-card flex flex-col items-center justify-center p-3 shadow-xl shadow-primary/5 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden">
                        {item.logo_url ? (
                           <img src={item.logo_url} className="w-10 h-10 object-contain filter group-hover:brightness-110 drop-shadow-md z-10" alt={item.name}/>
                        ) : (
                           <Code2 className="w-8 h-8 text-primary/50 z-10" />
                        )}
                     </div>
                     <span className="font-sans font-bold text-sm tracking-wide text-muted-foreground group-hover:text-foreground transition-colors text-center">{item.name}</span>
                     <div className="w-20"><LevelBars level={item.level} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frameworks */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Frameworks
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>
              <div className="grid grid-cols-2 gap-6 w-full place-items-center">
                {frames.map((item: any) => (
                  <div key={item.id} className="flex flex-col items-center gap-4 group w-full px-2">
                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-primary/20 bg-card flex flex-col items-center justify-center p-3 shadow-xl shadow-primary/5 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden">
                        {item.logo_url ? (
                           <img src={item.logo_url} className="w-10 h-10 object-contain filter group-hover:brightness-110 drop-shadow-md z-10" alt={item.name}/>
                        ) : (
                           <Code2 className="w-8 h-8 text-primary/50 z-10" />
                        )}
                     </div>
                     <span className="font-sans font-bold text-sm tracking-wide text-muted-foreground group-hover:text-foreground transition-colors text-center">{item.name}</span>
                     <div className="w-20"><LevelBars level={item.level} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev Tools */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Dev Tools
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>
              <div className="grid grid-cols-2 gap-6 w-full place-items-center">
                {tools.map((item: any) => (
                  <div key={item.id} className="flex flex-col items-center gap-4 group w-full px-2">
                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-primary/20 bg-card flex flex-col items-center justify-center p-3 shadow-xl shadow-primary/5 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden">
                        {item.logo_url ? (
                           <img src={item.logo_url} className="w-10 h-10 object-contain filter group-hover:brightness-110 drop-shadow-md z-10" alt={item.name}/>
                        ) : (
                           <Code2 className="w-8 h-8 text-primary/50 z-10" />
                        )}
                     </div>
                     <span className="font-sans font-bold text-sm tracking-wide text-muted-foreground group-hover:text-foreground transition-colors text-center">{item.name}</span>
                     <div className="w-20"><LevelBars level={item.level} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Capabilities
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {caps.map((item: any) => (
                  <div key={item.id} className="flex flex-col items-center gap-3 bg-card border border-border px-6 py-4 rounded-3xl shadow-sm hover:border-primary/50 transition-colors">
                    <span className="font-mono font-bold text-sm tracking-wide">{item.name}</span>
                    <div className="w-24"><LevelBars level={item.level} /></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
