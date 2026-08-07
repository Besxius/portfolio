import { supabase } from "@/lib/supabase";
import { Hero } from "@/features/portfolio/components/Hero";
import { Projects } from "@/features/portfolio/components/Projects";
import { Work } from "@/features/portfolio/components/Work";
import { Education } from "@/features/portfolio/components/Education";
import { Stack } from "@/features/portfolio/components/Stack";
import { Contact } from "@/features/portfolio/components/Contact";

export const revalidate = 0;

export default async function Home() {
  const { data: profiles } = await supabase.from('profiles').select('*').order('updated_at', { ascending: false }).limit(1);
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;
  const { data: projects } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
  const { data: works } = await supabase.from('work_history').select('*').order('start_date', { ascending: false });
  const { data: educations } = await supabase.from('education').select('*').order('start_date', { ascending: false });

  const { data: languages } = await supabase.from('languages').select('*').order('name');
  const { data: frontend } = await supabase.from('frontend').select('*').order('name');
  const { data: backend } = await supabase.from('backend').select('*').order('name');
  const { data: workflowAi } = await supabase.from('workflow_ai').select('*').order('name');
  const { data: codingTools } = await supabase.from('coding_tools').select('*').order('name');

  return (
    <div className="pb-16">
      <Hero initialProfile={profile} />
      <Work initialWorks={works || []} />
      <Education initialEducations={educations || []} />
      <Projects initialProjects={projects || []} />
      <Stack
        initialLanguages={languages || []}
        initialFrontend={frontend || []}
        initialBackend={backend || []}
        initialWorkflowAi={workflowAi || []}
        initialCodingTools={codingTools || []}
      />
      <Contact initialProfile={profile} />
    </div>
  );
}
