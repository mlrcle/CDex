import Link from "next/link";

export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Wishlist
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Mes envies
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Garde ici les albums que tu aimerais trouver ou ajouter plus tard.
        </p>

        <div className="mt-8 rounded-[2rem] border border-dashed border-blue-200 bg-blue-50/70 p-6 text-center">
          <h2 className="text-2xl font-black text-[#2155ff]">
            Wishlist vide
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5e6b85]">
            Aucun album recherché pour le moment.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <button className="rounded-2xl bg-[#2155ff] px-6 py-4 text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]">
            Ajouter un album
          </button>

          <Link
            href="/"
            className="rounded-2xl border border-blue-100 bg-[#edf5ff] px-6 py-4 text-center text-lg font-black text-[#2155ff]"
          >
            Retour accueil
          </Link>
        </div>
      </section>
    </main>
  );
}