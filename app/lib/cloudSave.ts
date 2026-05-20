import { supabase } from "./supabase";

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

export async function saveCloudData() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const data: Record<string, string | null> = {};

  STORAGE_KEYS.forEach((key) => {
    data[key] = localStorage.getItem(key);
  });

  const result = await supabase.from("user_data").upsert({
    user_id: user.id,
    data,
    updated_at: new Date().toISOString(),
  });
  console.log("SUPABASE SAVE RESULT", result);
}

export async function loadCloudData() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("user_data")
    .select("data")
    .eq("user_id", user.id)
    .single();

  if (error || !data?.data) return false;

  Object.entries(data.data).forEach(([key, value]) => {
    if (typeof value === "string") {
      localStorage.setItem(key, value);
    }
  });

  return true;
}