"use client";

import { useAppContext } from "@/components/providers";
import { GraduationCap, ChevronDown } from "lucide-react";

export function Education() {
  const { language } = useAppContext();
  
  // Hardcoded FPT University data
  const educations = [
    {
      id: "1",
      school: "FPT University",
      school_vi: "Đại học FPT",
      startDate: "08.2021",
      endDate: "06.2025",
      degree: "Bachelor's degree",
      degree_vi: "Cử nhân",
      major: "Software Engineering",
      major_vi: "Kỹ thuật phần mềm",
      skills: ["C++", "Java", "Python", "DSA", "Databases", "System Design", "Software Engineering", "Agile"],
    }
  ];

  return (
    <section id="education" className="w-full max-w-4xl mx-auto py-12 flex flex-col font-sans px-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Education</h2>
      </div>

      <div className="flex flex-col w-full">
        {educations.map((edu) => {
          const schoolName = language === 'vi' ? edu.school_vi : edu.school;
          const degreeName = language === 'vi' ? edu.degree_vi : edu.degree;
          const majorName = language === 'vi' ? edu.major_vi : edu.major;
          
          return (
            <div key={edu.id} className="group relative flex flex-col border-b border-border/50 py-8 first:pt-0 last:border-0">
              <div className="flex gap-4">
                {/* Timeline Icon */}
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center shrink-0 z-10">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {/* Vertical line connecting down (timeline) */}
                  <div className="w-px h-full bg-border mt-2" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-foreground tracking-tight">
                      {schoolName}
                    </h3>
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Meta (Dates, Degree, Major) */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-4">
                    <span className="font-mono text-xs">{edu.startDate} — {edu.endDate}</span>
                    <span className="opacity-50">|</span>
                    <span>{degreeName}</span>
                    <span className="opacity-50">|</span>
                    <span>{majorName}</span>
                  </div>

                  {/* Skills / Badges */}
                  {edu.skills && edu.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {edu.skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-muted/50 border border-border/50 text-muted-foreground">
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
    </section>
  );
}
