"use client";

import { useEffect, useRef } from "react";

import { supabase } from "@/app/lib/supabase";
import {
  saveCloudData,
  loadCloudData,
} from "@/app/lib/cloudSave";

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
    let mounted = true;

    async function setupRealtime() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      const interval = setInterval(async () => {
        const snapshot = JSON.stringify(
          STORAGE_KEYS.map((key) => [
            key,
            localStorage.getItem(key),
          ])
        );

        if (snapshot === lastSnapshot.current) return;

        lastSnapshot.current = snapshot;

        await saveCloudData();
      }, 3000);

      const channel = supabase
        .channel("cloud-sync")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_data",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            await loadCloudData();

            window.dispatchEvent(new Event("storage"));
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }

    setupRealtime();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}