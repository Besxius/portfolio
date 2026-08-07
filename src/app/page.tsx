import { supabase } from "@/lib/supabase";
import { Hero } from "@/features/portfolio/components/Hero";
import { Projects } from "@/features/portfolio/components/Projects";
import { Work } from "@/features/portfolio/components/Work";
import { Education } from "@/features/portfolio/components/Education";
import { Skills } from "@/features/portfolio/components/Skills";
import { Contact } from "@/features/portfolio/components/Contact";

export const revalidate = 0;

export default async function Home() {
  const { data: profiles } = await supabase.from('profiles').select('*').order('updated_at', { ascending: false }).limit(1);
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;
  const { data: projects } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
  const { data: works } = await supabase.from('work_history').select('*').order('start_date', { ascending: false });

  const { data: languages } = await supabase.from('languages').select('*').order('name');
  const { data: frameworks } = await supabase.from('frameworks').select('*').order('name');
  const { data: devTools } = await supabase.from('dev_tools').select('*').order('name');
  const { data: capabilities } = await supabase.from('capabilities').select('*').order('name');

  return (
    <div className="pb-16">
      <Hero
        initialProfile={profile}
        initialStats={{
          languages: languages?.length || 0,
          frameworks: frameworks?.length || 0,
          devTools: devTools?.length || 0
        }}
      />
      <Work initialWorks={works || []} />
      <Education />
      <Projects initialProjects={projects || []} />
      <Skills
        initialLanguages={languages || []}
        initialFrameworks={frameworks || []}
        initialDevTools={devTools || []}
        initialCapabilities={capabilities || []}
      />
      <Contact initialProfile={profile} />
    </div>
  );
}
