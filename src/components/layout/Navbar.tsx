"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Quick Vote" },
  { href: "/profile", label: "My Profile" },
  { href: "/match", label: "Match Helper" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/5 bg-nom8-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-nom8-orange to-nom8-orange-light bg-clip-text text-transparent">
              nom8
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-nom8-orange bg-nom8-orange/10"
                      : "text-nom8-text-muted hover:text-nom8-text hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
