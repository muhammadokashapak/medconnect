"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const hideNav = [
    "/login",
    "/register",
    "/admin",
  ].some((path) => pathname?.startsWith(path)) || pathname?.startsWith("/messages/");

  if (hideNav) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-xl z-50 md:hidden">
      <div className="max-w-3xl mx-auto px-4 py-2 flex justify-between items-center">
        <NavItem href="/feed" label="Home" icon="🏠" active={pathname === "/feed"} />
        <NavItem href="/messages" label="Chats" icon="💬" active={pathname.startsWith("/messages")} />
        <NavItem href="/video" label="Videos" icon="🎥" active={pathname === "/video"} />
        <NavItem href="/knowledge" label="Knowledge" icon="📚" active={pathname === "/knowledge"} />
      </div>
    </nav>
  );
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean; }) {
  return (
    <Link href={href} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition ${active ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>
      <span className="text-xl">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
