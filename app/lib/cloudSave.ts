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
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("SUPABASE USER", user);
    console.log("SUPABASE USER ERROR", userError);

    if (!user) {
      console.log("Aucun utilisateur connecté");
      return;
    }

    const data: Record<string, string | null> = {};

    await new Promise((resolve) => setTimeout(resolve, 100));

STORAGE_KEYS.forEach((key) => {
  data[key] = localStorage.getItem(key);
});

    console.log("DATA TO SAVE", data);

    const { error } = await supabase.from("user_data").upsert({
      user_id: user.id,
      data,
      updated_at: new Date().toISOString(),
    });

    console.log("SUPABASE SAVE ERROR", error);

    if (!error) {
      console.log("Sauvegarde cloud réussie");
    }
  } catch (err) {
    console.error("SAVE CLOUD CRASH", err);
  }
}
export function clearLocalCdexData() {
  STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}
export async function loadCloudData() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", user.id)
      .single();

    console.log("LOAD CLOUD", data, error);

    if (error || !data?.data) return false;

    Object.entries(data.data).forEach(([key, value]) => {
      if (typeof value === "string") {
        localStorage.setItem(key, value);
      }
    });

    return true;
  } catch (err) {
    console.error("LOAD CLOUD CRASH", err);
    return false;
  }
}