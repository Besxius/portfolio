"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/utils/providers";
import { supabase } from "@/lib/supabase";
import { Search, Command, Github, Moon, Sun, Menu, X, Palette } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, colorTheme, setColorTheme } = useAppContext();
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
      <nav className="w-full fixed top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border font-sans">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2 font-bold text-xl min-w-[120px]">
            <span className="tracking-tighter">TRONGLE</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">{t.nav.home}</a>
            <a href="#work" className="hover:text-foreground transition-colors">{t.nav.work}</a>
            <a href="#projects" className="hover:text-foreground transition-colors">{t.nav.experience}</a>
            <a href="#skills" className="hover:text-foreground transition-colors">{t.nav.skills}</a>
          </div>

          {/* Controls (Right) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground border border-border rounded-md px-2 py-1 text-xs">
              <Search className="w-3.5 h-3.5" />
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>

            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              <Github className="w-4 h-4" />
              <span>2.2k</span>
            </a>

            <div className="h-4 w-px bg-border mx-1"></div>

            {/* Background Color Switcher */}
            <button
              onClick={() => setColorTheme(colorTheme === 'blue' ? 'green' : 'blue')}
              className="group relative p-1.5 text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-muted/50 flex items-center gap-1.5"
              title={`Switch to ${colorTheme === 'blue' ? 'Dark Green' : 'Dark Blue'} theme`}
            >
              <Palette className="w-4 h-4" />
              <span className={`w-2 h-2 rounded-full ${colorTheme === 'blue' ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'}`} />
              <span className="text-xs font-mono font-medium capitalize hidden lg:inline">{colorTheme === 'blue' ? 'Blue' : 'Green'}</span>
              <span className="absolute -bottom-8 right-0 bg-popover text-popover-foreground text-xs px-2 py-1 border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Bg Color: {colorTheme === 'blue' ? 'Dark Blue' : 'Dark Green'}
              </span>
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="group relative p-1.5 text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-muted/50"
            >
              <Moon className="w-4 h-4 hidden dark:block" />
              <Sun className="w-4 h-4 dark:hidden" />
              <span className="absolute -bottom-8 right-0 bg-popover text-popover-foreground text-xs px-2 py-1 border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Toggle mode D
              </span>
            </button>

            <button onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')} className="text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2 py-1">
              {language.toUpperCase()}
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden p-4 bg-background border-b border-border flex flex-col gap-4 text-sm">
            <a href="#" onClick={() => setIsOpen(false)}>{t.nav.home}</a>
            <a href="#work" onClick={() => setIsOpen(false)}>{t.nav.work}</a>
            <a href="#projects" onClick={() => setIsOpen(false)}>{t.nav.experience}</a>
            <a href="#skills" onClick={() => setIsOpen(false)}>{t.nav.skills}</a>
            <div className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
              <button 
                onClick={() => setColorTheme(colorTheme === 'blue' ? 'green' : 'blue')} 
                className="text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Background Color</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold capitalize ${colorTheme === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {colorTheme === 'blue' ? 'Dark Blue' : 'Dark Green'}
                </span>
              </button>
              <button onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')} className="text-left">
                Language: {language.toUpperCase()}
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-left flex items-center gap-2">
                Toggle Theme
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Floating Avatar when scrolled - Keeping it as requested for feature parity, adapted to new style */}
      <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-500 transform origin-bottom-left ${isScrolled ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-50 pointer-events-none'}`}>
        <div className="flex items-center gap-3 bg-card border border-border p-2 pr-4 rounded-full shadow-lg cursor-pointer hover:border-muted-foreground/50 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-full border border-border overflow-hidden shrink-0 flex items-center justify-center">
            {nameInfo.avatar ? (
              <img src={nameInfo.avatar} className="w-full h-full object-cover" style={{ objectPosition: `${nameInfo.x}% ${nameInfo.y}%`, transform: `scale(${nameInfo.scale})` }} />
            ) : (
              <div className="w-full h-full bg-muted text-muted-foreground flex items-center justify-center font-bold">{nameInfo.en.charAt(0)}</div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wide text-foreground">{language === 'vi' ? nameInfo.vi : nameInfo.en}</span>
          </div>
        </div>
      </div>
    </>
  );
}
