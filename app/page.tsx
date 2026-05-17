import Link from "next/link";
import AlbumCard from "./components/AlbumCard";
import { albums } from "./data/albums";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-xl">
        <h1 className="text-5xl font-black text-blue-800">
          Bienvenue dans CD<span className="text-red-500">ex</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Le Pokédex moderne pour scanner, classer et admirer ta collection de CD.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <button className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-700">
            Scanner un CD
          </button>

          <Link
            href="/collection"
            className="rounded-2xl border border-blue-300 px-6 py-3 font-bold text-blue-700 hover:bg-blue-50"
          >
            Voir ma collection
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white/80 p-6 shadow">
          <p className="text-sm text-slate-500">Albums découverts</p>
          <p className="text-3xl font-black text-blue-700">124 / 342</p>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow">
          <p className="text-sm text-slate-500">Valeur estimée</p>
          <p className="text-3xl font-black text-blue-700">2 450 €</p>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow">
          <p className="text-sm text-slate-500">Niveau</p>
          <p className="text-3xl font-black text-blue-700">23</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-black">Derniers albums ajoutés</h2>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} {...album} />
          ))}
        </div>
      </section>
    </main>
  );
}