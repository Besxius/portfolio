import { supabase } from "@/lib/supabase";
import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { Contact } from "@/components/Contact";

export const revalidate = 0;

export default async function Home() {
  const { data: profiles } = await supabase.from('profiles').select('*').order('updated_at', { ascending: false }).limit(1);
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;
  const { data: projects } = await supabase.from('projects').select('*').order('display_order', { ascending: true });

  return (
    <div className="space-y-32 pb-16">
      <Hero initialProfile={profile} />
      <Experience initialProjects={projects || []} />
      <Skills initialProfile={profile} />
      <Contact initialProfile={profile} />
    </div>
  );
}
