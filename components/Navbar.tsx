"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Hide Navbar on auth pages and admin pages
  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <>
      {/* Click outside overlay */}
      {(isMenuOpen || isProfileOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeAll}
        ></div>
      )}

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            
            {/* Left: Logo & Search */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/feed" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-md">
                  m
                </div>
              </Link>
              <div className="hidden md:flex">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const q = formData.get("q")?.toString() || "";
                    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
                  }} 
                  className="relative"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                  </div>
                  <input name="q" type="text" placeholder="Search MedConnect..." className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64 transition-all" />
                </form>
              </div>
            </div>

            {/* Center: Main Navigation */}
            <div className="hidden lg:flex flex-1 justify-center items-center px-8 h-full">
              <div className="flex space-x-2 h-full">
                <NavIcon href="/feed" active={pathname === "/feed"}>
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                </NavIcon>
                <NavIcon href="/video" active={pathname === "/video"}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </NavIcon>
                <NavIcon href="/knowledge" active={pathname === "/knowledge"}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </NavIcon>
              </div>
            </div>

            {/* Right: Social & Profile */}
            <div className="flex items-center space-x-1 sm:space-x-3 relative z-50">
              {/* Menu Grid (9-dot) */}
              <div className="relative">
                <button onClick={() => {setIsMenuOpen(!isMenuOpen); setIsProfileOpen(false);}} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition shadow-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4zM10 3a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4zM15 3a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"></path></svg>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-[-40px] sm:right-0 mt-2 w-[280px] sm:w-80 bg-white rounded-lg shadow-xl border border-gray-100 p-3 sm:p-4 z-50">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Menu</h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <MenuCard icon="🏥" title="Hospital ERP" href="/erp" onClick={closeAll} />
                      <MenuCard icon="🤖" title="AI Assistant" href="/ai" onClick={closeAll} />
                      <MenuCard icon="👥" title="Patients Queue" href="/queue" onClick={closeAll} />
                      <MenuCard icon="📅" title="Appointments" href="/appointments" onClick={closeAll} />
                      <MenuCard icon="🔬" title="Laboratory" href="/erp/lab" onClick={closeAll} />
                      <MenuCard icon="💊" title="Pharmacy" href="/erp/pharmacy" onClick={closeAll} />
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <Link href="/messages" onClick={closeAll}>
                <button className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition shadow-sm ${pathname.startsWith("/messages") ? "bg-blue-100 text-blue-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path></svg>
                </button>
              </Link>

              {/* Notifications */}
              <Link href="/notifications" onClick={closeAll}>
                <button className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition relative shadow-sm ${pathname === "/notifications" ? "bg-blue-100 text-blue-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                  <span className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative ml-1 sm:ml-2">
                <button onClick={() => {setIsProfileOpen(!isProfileOpen); setIsMenuOpen(false);}} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-300 hover:border-gray-400 transition shadow-sm">
                  <svg className="w-full h-full text-gray-400 bg-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    <Link href="/profile" onClick={closeAll} className="block px-4 py-2 hover:bg-gray-50 flex items-center">
                      <span className="text-xl mr-3">👤</span> <span className="font-medium text-gray-900 text-sm sm:text-base">Your Profile</span>
                    </Link>
                    <Link href="/saved-cases" onClick={closeAll} className="block px-4 py-2 hover:bg-gray-50 flex items-center">
                      <span className="text-xl mr-3">🔖</span> <span className="font-medium text-gray-900 text-sm sm:text-base">Saved Cases</span>
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-red-600">
                      <span className="text-xl mr-3">🚪</span> <span className="font-medium text-sm sm:text-base">Logout</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavIcon({ children, href, active }: { children: React.ReactNode, href: string, active: boolean }) {
  return (
    <Link href={href} className="h-full flex">
      <div className={`px-10 h-full flex items-center justify-center transition-colors duration-200 border-b-[3px]
        ${active ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:bg-gray-100 rounded-lg my-1 hover:text-gray-700'}`}>
        {children}
      </div>
    </Link>
  );
}

function MenuCard({ icon, title, href }: { icon: string, title: string, href: string }) {
  return (
    <Link href={href} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl mr-3">{icon}</div>
      <span className="font-medium text-gray-900 text-sm">{title}</span>
    </Link>
  );
}
