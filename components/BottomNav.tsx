import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-6 z-50 md:hidden">
      <Link href="/feed" className="flex flex-col items-center text-sm text-gray-700 hover:text-indigo-600">
        <span className="text-2xl">🏠</span>
        <span>Home</span>
      </Link>
      <Link href="/video" className="flex flex-col items-center text-sm text-gray-700 hover:text-indigo-600">
        <span className="text-2xl">🎥</span>
        <span>Videos</span>
      </Link>
      <Link href="/knowledge" className="flex flex-col items-center text-sm text-gray-700 hover:text-indigo-600">
        <span className="text-2xl">📚</span>
        <span>Knowledge</span>
      </Link>
    </nav>
  );
}
