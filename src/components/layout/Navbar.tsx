"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "儀表板" },
  { href: "/tw-stocks", label: "台股庫存" },
  { href: "/us-stocks", label: "美股庫存" },
  { href: "/backup", label: "備份還原" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F0E8]/90 backdrop-blur border-b border-[#E0D8CC]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-[#6B5344] tracking-wide text-sm">
          台美股資產儀表板
        </span>
        <div className="flex gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#8B9E77] text-white"
                    : "text-[#3A3028] hover:bg-[#E8E0D4]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
