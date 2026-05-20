"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { saveCloudData } from "@/app/lib/cloudSave";

const STORAGE_KEYS = [
  "cdex-user-albums",
  "cdex-wishlist",
  "cdex-favorites",
  "cdex-profile-description",
  "cdex-profile-image",
  "cdex-profile-name",
  "cdex-collection-objective",
  "cdex-wishlist-converted-count",
  "cdex-seen-achievements",
];

export default function CloudSync() {
  const lastSnapshot = useRef("");

  useEffect(() => {
    const interval = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const snapshot = JSON.stringify(
        STORAGE_KEYS.map((key) => [key, localStorage.getItem(key)])
      );

      if (snapshot === lastSnapshot.current) return;

      lastSnapshot.current = snapshot;
      await saveCloudData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return null;
}