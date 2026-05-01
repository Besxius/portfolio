"use client";

import { useState } from "react";
import { useAppContext } from "./providers";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, Check, X, Plus, Code2, Trash2 } from "lucide-react";

export function Skills({ initialProfile }: { initialProfile: any }) {
  const { t, isAdmin } = useAppContext();
  const [profile, setProfile] = useState(initialProfile || { programming_skills: [], programming_languages: [], development_tools: [], frameworks: [] });
  const [isEditing, setIsEditing] = useState(false);
  
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  
  const [languagesList, setLanguagesList] = useState<any[]>([]);
  const [newLangName, setNewLangName] = useState("");
  const [newLangLogo, setNewLangLogo] = useState("");
  
  const [toolsList, setToolsList] = useState<any[]>([]);
  const [newToolName, setNewToolName] = useState("");
  const [newToolLogo, setNewToolLogo] = useState("");

  const [frameworksList, setFrameworksList] = useState<any[]>([]);
  const [newFrameworkName, setNewFrameworkName] = useState("");
  const [newFrameworkLogo, setNewFrameworkLogo] = useState("");

  const [isUploadingLogo, setIsUploadingLogo] = useState<string | false>(false);
  const [loading, setLoading] = useState(false);

  const startEditing = () => {
    setSkillsList(profile.programming_skills || []);
    setLanguagesList(profile.programming_languages || []);
    setToolsList(profile.development_tools || []);
    setFrameworksList(profile.frameworks || []);
    setIsEditing(true);
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => setSkillsList(skillsList.filter(s => s !== skillToRemove));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(type);
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Math.random()}.${fileExt}`;
    const filePath = `skills/${fileName}`;
    const { error } = await supabase.storage.from('portfolio-images').upload(filePath, file);
    if (!error) {
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
      setUrl(data.publicUrl);
    }
    setIsUploadingLogo(false);
  };

  const handleAddItem = (e: React.FormEvent | undefined, name: string, logo: string, list: any[], setList: (v: any) => void, setName: (v: string) => void, setLogo: (v: string) => void) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (trimmed && !list.find(l => l.name === trimmed)) {
      setList([...list, { name: trimmed, logo_url: logo }]);
      setName("");
      setLogo("");
    }
  };

  const handleRemoveItem = (name: string, list: any[], setList: (v: any) => void) => {
     setList(list.filter(l => l.name !== name));
  };

  const handleSave = async () => {
    setLoading(true);
    let res;
    const payload = { 
       programming_skills: skillsList, 
       programming_languages: languagesList,
       development_tools: toolsList,
       frameworks: frameworksList
    };
    if (profile.id) {
      res = await supabase.from('profiles').update(payload).eq('id', profile.id).select();
    } else {
      res = await supabase.from('profiles').insert([payload]).select();
    }
    
    if (!res?.error && res?.data) {
      setProfile(res.data[0]);
      setIsEditing(false);
    } else if (res?.error) {
      alert("Error saving: " + res.error.message + "\nIf columns are missing, please add 'development_tools' (jsonb) and 'frameworks' (jsonb) to the profiles table.");
      console.error(res.error);
    }
    setLoading(false);
  };

  const pgLangs = profile.programming_languages || [];
  const pgSkills = profile.programming_skills || [];
  const devTools = profile.development_tools || [];
  const proFrameworks = profile.frameworks || [];

  return (
    <section id="skills" className="py-24 relative group min-h-[60vh]">
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
        <button 
          onClick={startEditing}
          className="absolute top-32 right-4 md:right-10 p-3 bg-primary/20 text-primary rounded-full hover:bg-primary shadow-lg hover:text-primary-foreground hover:scale-105 transition-all z-20 opacity-30 group-hover:opacity-100"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      )}

      {isEditing ? (
        <div className="max-w-6xl mx-auto space-y-8 bg-card/90 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-2xl relative z-10 w-full overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border pb-4 w-full">
            <Edit2 className="w-6 h-6 text-primary" />
            <h3 className="font-extrabold text-2xl font-mono text-primary">&lt; Edit_Skills /&gt;</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
             
             {/* Languages */}
             <div className="space-y-6 bg-background p-6 rounded-3xl border border-input shadow-inner w-full min-w-0">
               <h4 className="font-bold text-lg border-b border-border pb-2 text-primary truncate">Languages</h4>
               <form onSubmit={(e) => handleAddItem(e, newLangName, newLangLogo, languagesList, setLanguagesList, setNewLangName, setNewLangLogo)} className="space-y-4">
                 <div>
                   <input value={newLangName} onChange={e => setNewLangName(e.target.value)} className="w-full px-4 py-2 border border-input rounded-xl bg-muted" placeholder="e.g. JavaScript" />
                 </div>
                 <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                     <label className="cursor-pointer bg-primary/20 text-primary px-3 py-2 text-xs font-bold rounded flex-shrink-0">
                       <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, setNewLangLogo, 'lang')} className="hidden"/>
                       {isUploadingLogo === 'lang' ? "..." : "Upload Logo"}
                     </label>
                     {newLangLogo && <img src={newLangLogo} alt="Logo" className="w-8 h-8 rounded shrink-0 object-contain" /> }
                   </div>
                 </div>
                 <button type="submit" disabled={!newLangName} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl flex justify-center items-center gap-2">
                   <Plus className="w-4 h-4"/> Add
                 </button>
               </form>
               <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2">
                 {languagesList.map((l, i) => (
                   <div key={i} className="flex justify-between items-center p-2 rounded-xl border border-border bg-card">
                     <div className="flex items-center gap-3 w-full min-w-0">
                       {l.logo_url ? <img src={l.logo_url} className="w-8 h-8 rounded overflow-hidden p-1 bg-background shrink-0 object-contain" /> : <div className="w-8 h-8 rounded bg-muted shrink-0"/>}
                       <span className="font-bold font-sans text-sm truncate">{l.name}</span>
                     </div>
                     <button onClick={() => handleRemoveItem(l.name, languagesList, setLanguagesList)} className="text-red-500 hover:text-red-400 p-1 shrink-0"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 ))}
               </div>
             </div>

             {/* Development Tools */}
             <div className="space-y-6 bg-background p-6 rounded-3xl border border-input shadow-inner w-full min-w-0">
               <h4 className="font-bold text-lg border-b border-border pb-2 text-primary truncate">Dev Tools</h4>
               <form onSubmit={(e) => handleAddItem(e, newToolName, newToolLogo, toolsList, setToolsList, setNewToolName, setNewToolLogo)} className="space-y-4">
                 <div>
                   <input value={newToolName} onChange={e => setNewToolName(e.target.value)} className="w-full px-4 py-2 border border-input rounded-xl bg-muted" placeholder="e.g. Git, Docker" />
                 </div>
                 <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                     <label className="cursor-pointer bg-primary/20 text-primary px-3 py-2 text-xs font-bold rounded flex-shrink-0">
                       <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, setNewToolLogo, 'tool')} className="hidden"/>
                       {isUploadingLogo === 'tool' ? "..." : "Upload Logo"}
                     </label>
                     {newToolLogo && <img src={newToolLogo} alt="Logo" className="w-8 h-8 rounded shrink-0 object-contain" /> }
                   </div>
                 </div>
                 <button type="submit" disabled={!newToolName} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl flex justify-center items-center gap-2">
                   <Plus className="w-4 h-4"/> Add
                 </button>
               </form>
               <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2">
                 {toolsList.map((l, i) => (
                   <div key={i} className="flex justify-between items-center p-2 rounded-xl border border-border bg-card">
                     <div className="flex items-center gap-3 w-full min-w-0">
                       {l.logo_url ? <img src={l.logo_url} className="w-8 h-8 rounded overflow-hidden p-1 bg-background shrink-0 object-contain" /> : <div className="w-8 h-8 rounded bg-muted shrink-0"/>}
                       <span className="font-bold font-sans text-sm truncate">{l.name}</span>
                     </div>
                     <button onClick={() => handleRemoveItem(l.name, toolsList, setToolsList)} className="text-red-500 hover:text-red-400 p-1 shrink-0"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 ))}
               </div>
             </div>

             {/* Frameworks & Others combined column to save space */}
             <div className="space-y-6 w-full min-w-0">
               <div className="space-y-6 bg-background p-6 rounded-3xl border border-input shadow-inner">
                 <h4 className="font-bold text-lg border-b border-border pb-2 text-primary truncate">Frameworks</h4>
                 <form onSubmit={(e) => handleAddItem(e, newFrameworkName, newFrameworkLogo, frameworksList, setFrameworksList, setNewFrameworkName, setNewFrameworkLogo)} className="space-y-4">
                   <div className="flex gap-2 w-full">
                     <input value={newFrameworkName} onChange={e => setNewFrameworkName(e.target.value)} className="w-full px-4 py-2 border border-input rounded-xl bg-muted" placeholder="e.g. React" />
                     <button type="submit" disabled={!newFrameworkName} className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center"><Plus className="w-5 h-5"/></button>
                   </div>
                   <div className="flex items-center gap-3">
                     <label className="cursor-pointer bg-primary/20 text-primary px-3 py-2 text-xs font-bold rounded flex-shrink-0">
                       <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, setNewFrameworkLogo, 'frame')} className="hidden"/>
                       {isUploadingLogo === 'frame' ? "..." : "Logo"}
                     </label>
                     {newFrameworkLogo && <img src={newFrameworkLogo} alt="Logo" className="w-8 h-8 rounded shrink-0 object-contain" /> }
                   </div>
                 </form>
                 <div className="space-y-2 mt-4 max-h-32 overflow-y-auto pr-2">
                   {frameworksList.map((l, i) => (
                     <div key={i} className="flex justify-between items-center p-2 rounded-xl border border-border bg-card">
                       <div className="flex items-center gap-3 w-full min-w-0">
                         {l.logo_url ? <img src={l.logo_url} className="w-6 h-6 rounded shrink-0 object-contain" /> : <div className="w-6 h-6 rounded bg-muted shrink-0"/>}
                         <span className="font-bold font-sans text-sm truncate">{l.name}</span>
                       </div>
                       <button onClick={() => handleRemoveItem(l.name, frameworksList, setFrameworksList)} className="text-red-500 hover:text-red-400 p-1 shrink-0"><Trash2 className="w-4 h-4"/></button>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="space-y-6 bg-background p-6 rounded-3xl border border-input shadow-inner">
                 <h4 className="font-bold text-lg border-b border-border pb-2 text-primary truncate">Keywords / Skills</h4>
                 <form onSubmit={handleAddSkill} className="flex gap-2">
                   <input value={newSkill} onChange={e => setNewSkill(e.target.value)} className="w-full px-4 py-2 border border-input rounded-xl bg-muted" placeholder="e.g. Web Development" />
                   <button type="submit" disabled={!newSkill} className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center"><Plus className="w-5 h-5"/></button>
                 </form>
                 <div className="flex flex-wrap gap-2 mt-4 max-h-32 overflow-y-auto">
                   {skillsList.map((skill, index) => (
                     <div key={index} className="pl-3 pr-1 py-1 rounded-full border border-border bg-card text-xs font-bold flex items-center gap-2">
                       <span>{skill}</span>
                       <button onClick={() => handleRemoveSkill(skill)} className="p-1 text-red-500 hover:bg-red-500/20 rounded-full"><X className="w-3 h-3"/></button>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

          </div>

          <div className="flex justify-end pt-6 border-t border-border mt-8">
            <button onClick={handleSave} disabled={loading} className="px-8 py-3 bg-primary text-primary-foreground font-black tracking-widest rounded-xl hover:bg-primary/90 shadow-xl flex gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <span className="flex items-center gap-2"><Check className="w-5 h-5"/> Save</span>}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto px-4 relative z-10 flex border-t border-border/50 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16 w-full">
            
            {/* Column 1: Languages */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Languages
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>
              
              <div className="grid grid-cols-2 gap-6 w-full place-items-center">
                {pgLangs.length > 0 ? pgLangs.map((lang: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-4 group">
                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-primary/20 bg-card flex flex-col items-center justify-center p-3 shadow-xl shadow-primary/5 transition-transform duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)] hover:scale-105">
                        {lang.logo_url ? (
                           <img src={lang.logo_url} className="w-10 h-10 object-contain filter group-hover:brightness-110 drop-shadow-md" alt={lang.name}/>
                        ) : (
                           <Code2 className="w-8 h-8 text-primary/50" />
                        )}
                     </div>
                     <span className="font-sans font-bold text-xs tracking-wide text-muted-foreground group-hover:text-foreground transition-colors text-center">{lang.name}</span>
                  </div>
                )) : (
                  <div className="col-span-full text-muted-foreground/50 font-mono text-sm py-12">None</div>
                )}
              </div>
            </div>

            {/* Column 2: Frameworks */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Frameworks
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>
              
              <div className="grid grid-cols-2 gap-6 w-full place-items-center">
                {proFrameworks.length > 0 ? proFrameworks.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-4 group">
                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] border border-primary/20 bg-card flex flex-col items-center justify-center p-3 shadow-xl shadow-primary/5 transition-transform duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)] hover:scale-105">
                        {item.logo_url ? (
                           <img src={item.logo_url} className="w-10 h-10 object-contain filter group-hover:brightness-110 drop-shadow-md" alt={item.name}/>
                        ) : (
                           <Code2 className="w-8 h-8 text-primary/50" />
                        )}
                     </div>
                     <span className="font-sans font-bold text-xs tracking-wide text-muted-foreground group-hover:text-foreground transition-colors text-center">{item.name}</span>
                  </div>
                )) : (
                  <div className="col-span-full text-muted-foreground/50 font-mono text-sm py-12">None</div>
                )}
              </div>
            </div>

            {/* Column 3: Dev Tools */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Dev Tools
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>
              
              <div className="grid grid-cols-2 gap-6 w-full place-items-center">
                {devTools.length > 0 ? devTools.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-4 group">
                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] border border-primary/20 bg-card flex flex-col items-center justify-center p-3 shadow-xl shadow-primary/5 transition-transform duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)] hover:scale-105">
                        {item.logo_url ? (
                           <img src={item.logo_url} className="w-10 h-10 object-contain filter group-hover:brightness-110 drop-shadow-md" alt={item.name}/>
                        ) : (
                           <Code2 className="w-8 h-8 text-primary/50" />
                        )}
                     </div>
                     <span className="font-sans font-bold text-xs tracking-wide text-muted-foreground group-hover:text-foreground transition-colors text-center">{item.name}</span>
                  </div>
                )) : (
                  <div className="col-span-full text-muted-foreground/50 font-mono text-sm py-12">None</div>
                )}
              </div>
            </div>

            {/* Column 4: Keywords */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg md:text-xl font-mono font-bold text-primary mb-12 uppercase tracking-wider relative whitespace-nowrap text-center">
                 Keywords
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50" />
              </h3>

              <div className="w-full flex justify-center flex-wrap gap-3 px-2 bg-muted/10 p-6 rounded-[2rem] border border-border">
                {pgSkills.length > 0 ? pgSkills.map((skill: string, idx: number) => (
                  <div key={idx} className="px-4 py-2 bg-card border border-primary/30 rounded-full font-mono font-bold text-[10px] shadow-sm hover:border-primary hover:text-primary transition-colors cursor-default">
                    {skill}
                  </div>
                )) : (
                  <div className="text-muted-foreground/50 font-mono text-sm py-12">None</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
