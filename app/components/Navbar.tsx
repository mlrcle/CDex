import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-3xl font-black text-blue-700">
          CD<span className="text-red-500">ex</span>
        </Link>

        <div className="hidden gap-6 md:flex">
          <Link href="/">Accueil</Link>
          <Link href="/collection">Collection</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/community">Communauté</Link>
          <Link href="/profile">Profil</Link>
        </div>
      </div>
    </nav>
  );
}
