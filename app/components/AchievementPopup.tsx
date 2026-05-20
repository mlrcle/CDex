"use client";

import { useEffect, useMemo, useState } from "react";
import { getAchievements } from "@/app/lib/achievements";

type ToastAchievement = {
  id: string;
  title: string;
  xp: number;
};

export default function AchievementPopup() {
  const [toast, setToast] = useState<ToastAchievement | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const completedAchievements = useMemo(() => {
    const albums = JSON.parse(localStorage.getItem("cdex-user-albums") || "[]");
    const wishlistConvertedCount = Number(
      localStorage.getItem("cdex-wishlist-converted-count") || 0
    );

    return getAchievements(albums, wishlistConvertedCount).filter(
      (achievement) => achievement.completed
    );
  }, [tick]);

  useEffect(() => {
    const seenIds = JSON.parse(
      localStorage.getItem("cdex-seen-achievements") || "[]"
    );

    const newAchievement = completedAchievements.find(
      (achievement) => !seenIds.includes(achievement.id)
    );

    if (!newAchievement) return;

    const updatedSeenIds = [...seenIds, newAchievement.id];
    localStorage.setItem(
      "cdex-seen-achievements",
      JSON.stringify(updatedSeenIds)
    );

    setToast({
      id: newAchievement.id,
      title: newAchievement.title,
      xp: newAchievement.xp,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, [completedAchievements]);

  if (!toast) return null;

  return (
    <div className="fixed left-1/2 top-7 z-[9999] w-[calc(100%-4rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-blue-100 bg-white/95 px-5 py-4 text-center shadow-[0_14px_35px_rgba(33,85,255,0.22)] backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2155ff]">
        Objectif débloqué
      </p>

      <p className="mt-2 text-base font-black text-[#071f4f]">
        {toast.title}
      </p>

      <p className="mt-1 text-sm font-black text-[#2155ff]">
        +{toast.xp} XP
      </p>
    </div>
  );
}