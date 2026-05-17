import Link from "next/link";

export default function CommunityPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Communauté
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Découvrir
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          La partie communauté permettra plus tard de trouver des amis, comparer des collections et découvrir des albums.
        </p>

        <div className="mt-8 rounded-[2rem] border border-dashed border-blue-200 bg-blue-50/70 p-6 text-center">
          <h2 className="text-2xl font-black text-[#2155ff]">
            Communauté bientôt disponible
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5e6b85]">
            On l’ajoutera quand la collection principale sera fonctionnelle.
          </p>
        </div>

        <Link
          href="/"
          className="mt-7 block rounded-2xl border border-blue-100 bg-[#edf5ff] px-6 py-4 text-center text-lg font-black text-[#2155ff]"
        >
          Retour accueil
        </Link>
      </section>
    </main>
  );
}