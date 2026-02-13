"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: "/traders", label: "Traders" },
    ...(session
      ? [
          { href: "/dashboard", label: "My Pokemon" },
          { href: "/messages", label: "Messages" },
          ...((session.user as any).role === "ADMIN"
            ? [{ href: "/admin", label: "Admin" }]
            : []),
        ]
      : []),
  ];

  return (
    <header className="hidden md:block bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <img src="/images/logo-navbar.png" alt="Skyliners Trades" className="h-9" />
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
                <Avatar
                  username={session.user.username}
                  displayName={session.user.displayName}
                  avatarUrl={session.user.avatarUrl}
                  team={session.user.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
                  size="sm"
                />
                <span className="text-sm font-medium">{session.user.displayName || session.user.username}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
