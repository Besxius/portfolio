"use client";

import { useState } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { Edit2, Plus, Trash2, Check, X, Code2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useRouter } from "next/navigation";

// Minimal LevelBar (optional in new design, maybe hide it or keep it small)
function LevelBars({ level, onChange }: { level: number, onChange?: (val: number) => void }) {
  const displayLevel = level > 5 ? Math.max(1, Math.round(level / 20)) : Math.max(1, level);
  return (
    <div className="flex gap-1 w-full items-center">
      {[1, 2, 3, 4, 5].map((val) => (
        <div
          key={val}
          onClick={() => onChange && onChange(val)}
          className={`h-1 rounded-full flex-1 transition-all ${onChange ? 'cursor-pointer hover:bg-foreground/50' : ''} ${val <= displayLevel ? 'bg-foreground' : 'bg-border'}`}
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
    <div className="space-y-4 bg-card p-4 rounded-xl border border-border flex flex-col font-sans">
      <ConfirmModal isOpen={!!confirmId} title="Delete Skill" message="Are you sure you want to remove this item?" confirmText="Delete" onConfirm={doDelete} onCancel={() => setConfirmId(null)} />
      <h4 className="font-bold text-sm border-b border-border pb-2 text-foreground truncate">{title}</h4>

      <form onSubmit={handleAdd} className="space-y-3 shrink-0 w-full">
        <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-foreground" placeholder={`Add ${title}...`} />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase text-muted-foreground">Level</span>
          <LevelBars level={newLevel} onChange={setNewLevel} />
        </div>
        {hasLogo && (
          <div className="flex items-center gap-2 mt-1">
            <label className="cursor-pointer flex-1 bg-muted text-foreground px-2 py-1.5 text-xs font-medium rounded-md text-center hover:bg-muted/80 truncate border border-border">
              <input type="file" accept="image/*" onChange={e => handleUpload(e, setNewLogo)} className="hidden" />
              {uploading ? "..." : "Upload Logo"}
            </label>
            {newLogo && <img src={newLogo} alt="Logo" className="w-7 h-7 rounded shrink-0 object-contain bg-white p-0.5" />}
          </div>
        )}
        <button type="submit" disabled={!newName || uploading} className="w-full py-1.5 bg-foreground text-background font-medium rounded-md text-sm hover:opacity-90"><Plus className="w-4 h-4 inline-block mr-1" /> Add</button>
      </form>

      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1 flex-1">
        {items.map((item: any) => (
          <div key={item.id} className="p-2 rounded-md border border-border bg-background flex flex-col gap-2">
            {editingId === item.id ? (
              <div className="space-y-2">
                <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full px-2 py-1 rounded text-sm border border-input bg-background" />
                <LevelBars level={editData.level} onChange={(val) => setEditData({ ...editData, level: val })} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={uploading} className="flex-1 py-1 bg-foreground text-background rounded text-xs">Save</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-1 bg-muted rounded text-xs border border-border">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium text-sm truncate">{item.name}</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(item)} className="p-1 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setConfirmId(item.id)} className="p-1 text-red-500/70 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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

  const sections = [
    { id: '01', title: 'Language', data: langs },
    { id: '02', title: 'Frontend / Frameworks', data: frames },
    { id: '03', title: 'Dev Tools', data: tools },
    { id: '04', title: 'Capabilities', data: caps },
  ];

  return (
    <section id="skills" className="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col font-mono">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-sans font-bold tracking-tight text-foreground">Stack</h2>
        {isAdmin && (
          <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground border border-border rounded-md font-medium text-xs font-sans transition-colors">
            <Edit2 className="w-3 h-3" /> {isEditing ? "Done" : "Edit Stack"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
          <CategoryEditor title="Languages" table="languages" items={langs} setItems={setLangs} onChanged={() => router.refresh()} />
          <CategoryEditor title="Frameworks" table="frameworks" items={frames} setItems={setFrames} onChanged={() => router.refresh()} />
          <CategoryEditor title="Dev Tools" table="dev_tools" items={tools} setItems={setTools} onChanged={() => router.refresh()} />
          <CategoryEditor title="Capabilities" table="capabilities" items={caps} setItems={setCaps} hasLogo={false} onChanged={() => router.refresh()} />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {sections.map((section) => (
            <div key={section.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-8 py-6 border-b border-border/50 first:pt-0 last:border-0 items-start">
              <div className="text-sm text-muted-foreground pt-1.5">
                {section.id} {section.title}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {section.data.map((item: any) => (
                  <div key={item.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-border/70 rounded-full hover:border-foreground/30 transition-colors group">
                    {item.logo_url ? (
                      <img src={item.logo_url} className="w-4 h-4 object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity" alt={item.name} />
                    ) : (
                      <Code2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
