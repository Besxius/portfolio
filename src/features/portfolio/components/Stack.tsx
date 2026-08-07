"use client";

import { useState } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { Edit2, Plus, Trash2, Code2, Upload, X, Image as ImageIcon } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useRouter } from "next/navigation";

function CategoryEditor({ title, table, items, setItems, onChanged }: {
  title: string;
  table: string;
  items: any[];
  setItems: (items: any[]) => void;
  onChanged?: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState("");
  const [uploadingAdd, setUploadingAdd] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ id?: string; name?: string; logo_url?: string }>({});
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
    const filePath = `skills/${fileName}`;
    const { error } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleUploadNewLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAdd(true);
    const url = await uploadImage(file);
    if (url) setNewLogo(url);
    setUploadingAdd(false);
  };

  const handleUploadEditLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEdit(true);
    const url = await uploadImage(file);
    if (url) {
      setEditData((prev) => ({ ...prev, logo_url: url }));
    }
    setUploadingEdit(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const payload: { name: string; logo_url?: string } = { name: newName.trim() };
    if (newLogo) payload.logo_url = newLogo;

    const { data, error } = await supabase.from(table).insert([payload]).select();
    if (!error && data) {
      setItems([...items, data[0]]);
      setNewName("");
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
    setEditData({ id: item.id, name: item.name, logo_url: item.logo_url || "" });
  };

  const saveEdit = async () => {
    if (!editingId || !editData.name?.trim()) return;
    const payload = {
      name: editData.name.trim(),
      logo_url: editData.logo_url || null
    };

    const { data, error } = await supabase.from(table).update(payload).eq("id", editingId).select();
    if (!error && data) {
      setItems(items.map((i: any) => (i.id === editingId ? data[0] : i)));
      setEditingId(null);
      setEditData({});
      if (onChanged) onChanged();
    }
  };

  return (
    <div className="space-y-4 bg-card p-4 rounded-xl border border-border/80 flex flex-col font-sans shadow-sm">
      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Stack Item"
        message="Are you sure you want to remove this stack item?"
        confirmText="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
      <h4 className="font-bold text-sm border-b border-border/60 pb-2 text-foreground truncate">{title}</h4>

      {/* Add New Stack Form */}
      <form onSubmit={handleAdd} className="space-y-2.5 shrink-0 w-full bg-muted/40 p-2.5 rounded-lg border border-border/50">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-foreground"
          placeholder={`Add to ${title}...`}
        />
        
        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex-1 bg-background text-foreground px-2.5 py-1.5 text-xs font-medium rounded-md text-center hover:bg-muted truncate border border-border flex items-center justify-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-muted-foreground" />
            <input type="file" accept="image/*" onChange={handleUploadNewLogo} className="hidden" />
            <span>{uploadingAdd ? "Uploading..." : newLogo ? "Change Logo" : "Upload Logo"}</span>
          </label>

          {newLogo && (
            <div className="relative shrink-0 group">
              <img src={newLogo} alt="Preview" className="w-7 h-7 rounded border border-border object-contain bg-white p-0.5" />
              <button
                type="button"
                onClick={() => setNewLogo("")}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!newName.trim() || uploadingAdd}
          className="w-full py-1.5 bg-foreground text-background font-medium rounded-md text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </form>

      {/* Existing Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1 flex-1">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-2">No items yet</p>
        )}
        {items.map((item: any) => (
          <div key={item.id} className="p-2.5 rounded-lg border border-border/70 bg-background flex flex-col gap-2 transition-all">
            {editingId === item.id ? (
              <div className="space-y-2.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Editing Stack</span>
                <input
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-2.5 py-1 rounded text-xs border border-input bg-background outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="Stack name"
                />

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex-1 bg-muted/60 text-foreground px-2 py-1 text-[11px] font-medium rounded text-center hover:bg-muted truncate border border-border flex items-center justify-center gap-1">
                    <Upload className="w-3 h-3 text-muted-foreground" />
                    <input type="file" accept="image/*" onChange={handleUploadEditLogo} className="hidden" />
                    <span>{uploadingEdit ? "Uploading..." : editData.logo_url ? "Replace Logo" : "Upload Logo"}</span>
                  </label>

                  {editData.logo_url ? (
                    <div className="relative shrink-0">
                      <img src={editData.logo_url} alt="Logo" className="w-6 h-6 rounded border border-border object-contain bg-white p-0.5" />
                      <button
                        type="button"
                        onClick={() => setEditData({ ...editData, logo_url: "" })}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        title="Remove Logo"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveEdit}
                    disabled={uploadingEdit || !editData.name?.trim()}
                    className="flex-1 py-1 bg-foreground text-background rounded text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditData({}); }}
                    className="flex-1 py-1 bg-muted text-foreground rounded text-xs font-medium hover:bg-muted/80 border border-border"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {item.logo_url ? (
                    <img src={item.logo_url} alt={item.name} className="w-5 h-5 object-contain shrink-0 bg-white p-0.5 rounded border border-border/50" />
                  ) : (
                    <Code2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-medium text-xs truncate text-foreground">{item.name}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="p-1 text-red-500/70 hover:text-red-500 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Stack({
  initialLanguages = [],
  initialFrontend = [],
  initialBackend = [],
  initialWorkflowAi = [],
  initialCodingTools = []
}: {
  initialLanguages?: any[];
  initialFrontend?: any[];
  initialBackend?: any[];
  initialWorkflowAi?: any[];
  initialCodingTools?: any[];
}) {
  const { isAdmin } = useAppContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [langs, setLangs] = useState(initialLanguages);
  const [frontends, setFrontends] = useState(initialFrontend);
  const [backends, setBackends] = useState(initialBackend);
  const [workflows, setWorkflows] = useState(initialWorkflowAi);
  const [codingTools, setCodingTools] = useState(initialCodingTools);

  const sections = [
    { id: '01', title: 'Language', data: langs },
    { id: '02', title: 'Frontend', data: frontends },
    { id: '03', title: 'Backend & Database', data: backends },
    { id: '04', title: 'Workflow & AI', data: workflows },
    { id: '05', title: 'Coding Tool', data: codingTools },
  ];

  return (
    <section id="stack" className="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col font-mono">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-sans font-bold tracking-tight text-foreground">Stack</h2>
        {isAdmin && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground border border-border rounded-md font-medium text-xs font-sans transition-colors"
          >
            <Edit2 className="w-3 h-3" /> {isEditing ? "Done" : "Edit Stack"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-12">
          <CategoryEditor
            title="Language"
            table="languages"
            items={langs}
            setItems={setLangs}
            onChanged={() => router.refresh()}
          />
          <CategoryEditor
            title="Frontend"
            table="frontend"
            items={frontends}
            setItems={setFrontends}
            onChanged={() => router.refresh()}
          />
          <CategoryEditor
            title="Backend & Database"
            table="backend"
            items={backends}
            setItems={setBackends}
            onChanged={() => router.refresh()}
          />
          <CategoryEditor
            title="Workflow & AI"
            table="workflow_ai"
            items={workflows}
            setItems={setWorkflows}
            onChanged={() => router.refresh()}
          />
          <CategoryEditor
            title="Coding Tool"
            table="coding_tools"
            items={codingTools}
            setItems={setCodingTools}
            onChanged={() => router.refresh()}
          />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {sections.map((section) => (
            <div
              key={section.id}
              className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-8 py-6 border-b border-border/50 first:pt-0 last:border-0 items-start"
            >
              <div className="text-sm font-medium text-muted-foreground pt-1.5">
                {String(section.data.length).padStart(2, '0')} {section.title}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {section.data.length === 0 ? (
                  <span className="text-xs text-muted-foreground/60 italic pt-1.5">No items</span>
                ) : (
                  section.data.map((item: any) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-background border border-border/70 rounded-full hover:border-foreground/30 transition-colors group shadow-xs"
                    >
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          className="w-4 h-4 object-contain brightness-0 invert opacity-75 group-hover:opacity-100 transition-opacity"
                          alt={item.name}
                        />
                      ) : (
                        <Code2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
