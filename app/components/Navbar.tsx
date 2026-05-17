import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <>
      {/* TOP NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-blue-100/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-cdex.png"
              alt="CDex"
              width={42}
              height={42}
            />

            <p className="text-2xl font-black text-[#2155ff]">
              CD<span className="text-[#ff4b4b]">ex</span>
            </p>
          </Link>
        </div>
      </nav>

      {/* BOTTOM NAVBAR */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-100/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2 text-center text-xs font-bold text-blue-700">
          
          <Link
            href="/"
            className="rounded-xl px-2 py-2 hover:bg-blue-50"
          >
            Accueil
          </Link>

          <Link
            href="/collection"
            className="rounded-xl px-2 py-2 hover:bg-blue-50"
          >
            Collection
          </Link>

          <Link
            href="/add"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2155ff] text-2xl text-white shadow-lg shadow-blue-300"
          >
            +
          </Link>

          <Link
            href="/community"
            className="rounded-xl px-2 py-2 hover:bg-blue-50"
          >
            Social
          </Link>

          <Link
            href="/profile"
            className="rounded-xl px-2 py-2 hover:bg-blue-50"
          >
            Profil
          </Link>
        </div>
      </nav>
    </>
  );
}