# Developer Portfolio and Content Management System

## Overview
A modern, high-performance personal portfolio application integrated with an internal Content Management System (CMS). Built using Next.js 16 (App Router), React 19, Tailwind CSS v4, and Supabase, this project enables real-time dynamic content updates and a seamless multi-language user experience.

## Key Features
* **Internationalization (i18n):** Native support for seamless localization toggling between English and Vietnamese.
* **Internal CMS (Admin Mode):** Protected authentication allowing the administrator to add, edit, delete, or hide projects and work experiences directly from the user interface without modifying the source code.
* **Real-Time Database Integration:** Full synchronization with a Supabase PostgreSQL backend for instant data persistence and updates.
* **Theme Management:** Adaptive Dark and Light mode support utilizing `next-themes`.
* **Responsive Architecture:** Fully optimized across mobile, tablet, and desktop viewports via Tailwind CSS v4.

## Tech Stack

### Frontend
* **Framework:** Next.js 16.2.0 (App Router) and React 19.2.4
* **Styling:** Tailwind CSS v4.0 (`@tailwindcss/postcss`)
* **Icons:** Lucide React
* **Utility Libraries:** `clsx`, `tailwind-merge` (for optimized class management)

### Backend and Database
* **Backend-as-a-Service:** Supabase (PostgreSQL Database and Client SDK)

---

## Directory Structure
```text
├── app/                  # Next.js App Router (pages, layout, and global styles)
│   ├── globals.css       # Tailwind v4 configuration
│   ├── layout.tsx        # Application root layout
│   └── page.tsx          # Main application entry point
├── components/           # Reusable UI components (Hero, Projects, Work, Contact, etc.)
├── lib/                  # Core utilities and configuration
│   ├── i18n.ts           # Language dictionaries (EN/VI) and localization logic
│   ├── supabase.ts       # Supabase client initialization
│   └── utils.ts          # Helper functions for dynamic class merging
└── public/               # Static assets (images, company logos, and CV documents)