import Link from "next/link";

type AlbumCardProps = {
  id: string;
  title: string;
  artist: string;
  year: number;
  discovered: boolean;
  rare: boolean;
  cover: string;
};

export default function AlbumCard({
  id,
  title,
  artist,
  year,
  discovered,
  rare,
  cover,
}: AlbumCardProps) {
  return (
    <Link
      href={`/album/${id}`}
      className={`group rounded-2xl border p-3 transition hover:-translate-y-1 hover:shadow-xl ${
        rare
          ? "border-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.35)]"
          : "border-blue-200"
      } bg-white/80`}
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-blue-100">
        {discovered ? (
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 grayscale">
            <div className="h-24 w-24 rounded-full border-4 border-gray-500 opacity-50" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{artist}</p>
        {year !== 0 && <p className="text-xs text-slate-400">{year}</p>}
      </div>
    </Link>
  );
}
