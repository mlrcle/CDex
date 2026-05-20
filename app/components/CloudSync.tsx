"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { saveCloudData, loadCloudData } from "@/app/lib/cloudSave";

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

function getLocalSnapshot() {
  return JSON.stringify(
    STORAGE_KEYS.map((key) => [key, localStorage.getItem(key)])
  );
}

export default function CloudSync() {
  const lastLocalSnapshot = useRef("");
  const lastCloudUpdatedAt = useRef("");

  useEffect(() => {
    const interval = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const localSnapshot = getLocalSnapshot();

      if (localSnapshot !== lastLocalSnapshot.current) {
        lastLocalSnapshot.current = localSnapshot;
        await saveCloudData();
      }

      const { data } = await supabase
        .from("user_data")
        .select("updated_at")
        .eq("user_id", user.id)
        .single();

      if (!data?.updated_at) return;

      if (
        lastCloudUpdatedAt.current &&
        data.updated_at !== lastCloudUpdatedAt.current
      ) {
        lastCloudUpdatedAt.current = data.updated_at;

        await loadCloudData();

        window.location.reload();
        return;
      }

      lastCloudUpdatedAt.current = data.updated_at;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return null;
}