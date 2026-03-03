"use client";

import { useState, useRef, useEffect } from "react";
import type { Hero, HeroRole } from "@/types/hero";
import HeroIcon from "./HeroIcon";

interface HeroSelectorProps {
  heroes: Hero[];
  role?: HeroRole;
  value: string | null;
  onChange: (slug: string | null) => void;
  placeholder?: string;
  excludeSlugs?: string[];
}

export default function HeroSelector({
  heroes,
  role,
  value,
  onChange,
  placeholder = "Select hero...",
  excludeSlugs = [],
}: HeroSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = heroes
    .filter((h) => (role ? h.role === role : true))
    .filter((h) => !excludeSlugs.includes(h.slug))
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()));

  const selected = heroes.find((h) => h.slug === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-nom8-card border border-white/10 rounded-lg px-3 py-2 text-left flex items-center gap-2 hover:border-white/20 transition-colors"
      >
        {selected ? (
          <>
            <HeroIcon hero={selected} size="sm" />
            <span className="text-sm font-medium">{selected.name}</span>
          </>
        ) : (
          <span className="text-sm text-nom8-text-muted">{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-nom8-card border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border-none rounded px-2 py-1 text-sm text-nom8-text placeholder:text-nom8-text-muted focus:outline-none focus:ring-1 focus:ring-nom8-orange/50"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {value && (
              <button
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full px-3 py-2 text-left text-sm text-nom8-text-muted hover:bg-white/5 transition-colors"
              >
                Clear selection
              </button>
            )}
            {filtered.map((hero) => (
              <button
                key={hero.slug}
                onClick={() => {
                  onChange(hero.slug);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 transition-colors ${
                  hero.slug === value ? "bg-nom8-orange/10" : ""
                }`}
              >
                <HeroIcon hero={hero} size="sm" />
                <span className="text-sm">{hero.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-nom8-text-muted">
                No heroes found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
