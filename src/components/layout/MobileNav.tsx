"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const iconPaths = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  pokeball: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 7a3 3 0 110 6 3 3 0 010-6z",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

function NavIcon({ d, active }: { d: string; active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-blue-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d={d} />
    </svg>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const tabs = [
    { href: "/", icon: iconPaths.home, label: "Home" },
    { href: "/traders", icon: iconPaths.search, label: "Traders" },
    ...(session
      ? [
          { href: "/dashboard", icon: iconPaths.pokeball, label: "My Pokemon" },
          { href: "/messages", icon: iconPaths.chat, label: "Messages" },
          isAdmin
            ? { href: "/admin", icon: iconPaths.shield, label: "Admin" }
            : { href: "/dashboard/edit", icon: iconPaths.user, label: "Profile" },
        ]
      : [
          { href: "/auth/login", icon: iconPaths.user, label: "Sign In" },
        ]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 safe-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <NavIcon d={tab.icon} active={active} />
              <span className={`text-[10px] ${active ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
