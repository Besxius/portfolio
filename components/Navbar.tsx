"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "./providers";
import { supabase } from "@/lib/supabase";
import { Moon, Sun, Menu, X, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { firaCode } from "@/app/layout";

// Note: Ensure @/app/layout exports firaCode or use a hardcoded font-family if it errors.
export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, colorTheme, setColorTheme, t } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [nameInfo, setNameInfo] = useState({ en: 'Le Duc Trong', vi: 'Lê Đức Trọng', avatar: '', x: 50, y: 50, scale: 1 });

  useEffect(() => {
    supabase.from('profiles').select('full_name, full_name_vi, avatar_url, avatar_x, avatar_y, avatar_scale').limit(1).then(({ data }) => {
      if (data && data[0]) {
         setNameInfo({ 
             en: data[0].full_name || 'Le Duc Trong', 
             vi: data[0].full_name_vi || 'Lê Đức Trọng', 
             avatar: data[0].avatar_url || '',
             x: data[0].avatar_x || 50,
             y: data[0].avatar_y || 50,
             scale: data[0].avatar_scale || 1
         });
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <nav className="w-full fixed top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2 font-mono font-bold text-xl md:text-2xl min-w-[200px] transition-all">
          <span className="text-primary tracking-widest">&lt;C/&gt;</span>
          <span className="tracking-wide">Portfolio</span>
        </div>

        <div className="hidden md:flex items-center gap-10 font-sans font-medium text-sm">
          <a href="#" className="hover:text-primary transition-colors text-primary">{t.nav.home}</a>
          <a href="#work" className="hover:text-primary transition-colors">{t.nav.work}</a>
          <a href="#experience" className="hover:text-primary transition-colors">{t.nav.experience}</a>
          <a href="#skills" className="hover:text-primary transition-colors">{t.nav.skills}</a>
          <a href="#contact" className="hover:text-primary transition-colors">{t.nav.contact}</a>
        </div>

        {/* Social / Controls (Right) */}
        <div className="hidden md:flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')} className="font-bold hover:text-primary transition-colors">
              {language.toUpperCase()}
            </button>
            <button
              onClick={() => setColorTheme(colorTheme === 'blue' ? 'green' : 'blue')}
              className="p-1 hover:text-primary transition-colors"
            >
               <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 hover:text-primary transition-colors"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X/> : <Menu/>}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden p-4 bg-background border-b border-border flex flex-col gap-4 font-sans text-sm">
          <a href="#" onClick={() => setIsOpen(false)}>{t.nav.home}</a>
          <a href="#work" onClick={() => setIsOpen(false)}>{t.nav.work}</a>
          <a href="#experience" onClick={() => setIsOpen(false)}>{t.nav.experience}</a>
          <a href="#skills" onClick={() => setIsOpen(false)}>{t.nav.skills}</a>
          <a href="#contact" onClick={() => setIsOpen(false)}>{t.nav.contact}</a>
          <div className="flex items-center gap-4 pt-4 border-t border-border">
             <button onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}>{language.toUpperCase()} / Language</button>
             <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Toggle Theme</button>
          </div>
        </div>
      )}
    </nav>

      {/* Floating Avatar when scrolled */}
      <div className={`fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[100] transition-all duration-500 transform origin-bottom-left ${isScrolled ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-50 pointer-events-none'}`}>
         <div className="flex items-center gap-3 bg-background/80 backdrop-blur-xl border border-border/50 p-2 pr-5 rounded-full shadow-2xl group cursor-pointer hover:border-primary/50 transition-colors" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-12 h-12 rounded-full border-2 border-primary/50 overflow-hidden shrink-0 group-hover:border-primary transition-colors flex items-center justify-center">
               {nameInfo.avatar ? (
                  <img src={nameInfo.avatar} className="w-full h-full object-cover" style={{ objectPosition: `${nameInfo.x}% ${nameInfo.y}%`, transform: `scale(${nameInfo.scale})` }} />
               ) : (
                  <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">{nameInfo.en.charAt(0)}</div>
               )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-foreground leading-tight">{language === 'vi' ? nameInfo.vi : nameInfo.en}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">Developer</span>
            </div>
         </div>
      </div>
    </>
  );
}
