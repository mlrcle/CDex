"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getAchievements,
  getCompletedAchievementXp,
  Achievement,
} from "@/app/lib/achievements";
import { useRouter } from "next/navigation";

type Album = {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  rarity?: string;
  xp?: number;
  addedAt?: string;
  createdAt?: string;
  cover?: string;
  duration?: string;
  estimatedValue?: string;
  rating?: number;
  source?: string;
};

export default function AchievementsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [wishlistConvertedCount, setWishlistConvertedCount] = useState(0);

  useEffect(() => {
    setAlbums(JSON.parse(localStorage.getItem("cdex-user-albums") || "[]"));

    setWishlistConvertedCount(
      Number(localStorage.getItem("cdex-wishlist-converted-count") || 0)
    );
  }, []);

  const achievements = useMemo(() => {
    return getAchievements(albums, wishlistConvertedCount);
  }, [albums, wishlistConvertedCount]);

  const completedAchievements = achievements.filter(
    (achievement) => achievement.completed
  );
const router = useRouter();
  const totalXp = getCompletedAchievementXp(achievements);

  const groupedAchievements = useMemo(() => {
    const groups: Record<string, Achievement[]> = {};

    achievements.forEach((achievement) => {
      if (!groups[achievement.category]) {
        groups[achievement.category] = [];
      }

      groups[achievement.category].push(achievement);
    });

    return groups;
  }, [achievements]);

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
      <button
  onClick={() => router.back()}
  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 shadow-[0_10px_25px_rgba(33,85,255,0.14)] transition active:scale-95"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2155ff"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M15 18L9 12L15 6" />
  </svg>
</button>
      <section className="rounded-[2.5rem] border border-blue-100/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(33,85,255,0.12)] backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Succès
        </p>

        <h1 className="mt-3 text-5xl font-black leading-none tracking-tight text-[#2155ff]">
          Objectifs
        </h1>

        <p className="mt-5 text-sm font-semibold leading-7 text-[#5e6b85]">
          Débloque des objectifs pour gagner de l’XP bonus.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard
            label="Validés"
            value={`${completedAchievements.length}/${achievements.length}`}
          />

          <StatCard label="XP bonus" value={`${totalXp} XP`} />
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-5">
        {Object.entries(groupedAchievements).map(([category, items]) => (
          <section
            key={category}
            className="rounded-[2.2rem] border border-blue-100/70 bg-white/85 p-5 shadow-[0_15px_45px_rgba(33,85,255,0.10)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#2155ff]">
                {category}
              </h2>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6b7895]">
                {items.filter((achievement) => achievement.completed).length}/
                {items.length}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {items.map((achievement) => {
                const progress = Math.min(
                  100,
                  Math.round((achievement.current / achievement.target) * 100)
                );

                return (
                  <article
                    key={achievement.id}
                    className={`rounded-[1.8rem] border p-4 transition ${
                      achievement.completed
                        ? "border-[#2155ff]/20 bg-blue-50/70"
                        : "border-blue-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-[#071f4f]">
                            {achievement.title}
                          </h3>

                          {achievement.completed && (
                            <span className="rounded-full bg-[#2155ff] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                              Validé
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm font-semibold leading-6 text-[#5e6b85]">
                          {achievement.description}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-2xl bg-[#2155ff] px-3 py-2 text-sm font-black text-white shadow-[0_8px_25px_rgba(33,85,255,0.25)]">
                        +{achievement.xp}
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-black text-[#6b7895]">
                          {achievement.current}/{achievement.target}
                        </p>

                        <p className="text-xs font-black text-[#2155ff]">
                          {progress}%
                        </p>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-blue-100/70">
                        <div
                          className={`h-full rounded-full transition-all ${
                            achievement.completed
                              ? "bg-[#2155ff]"
                              : "bg-[#7c9cff]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <Link
        href="/profile"
        className="mt-6 block rounded-[2rem] bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow-[0_12px_35px_rgba(33,85,255,0.35)]"
      >
        Retour au profil
      </Link>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.8rem] border border-blue-100 bg-white p-4 shadow-[0_8px_25px_rgba(33,85,255,0.08)]">
      <p className="text-xs font-black uppercase text-[#6b7895]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#2155ff]">{value}</p>
    </div>
  );
}
