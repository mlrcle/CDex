"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideCollectionValue, setHideCollectionValue] = useState(false);
  const [hideWishlist, setHideWishlist] = useState(false);

  const [notifications, setNotifications] = useState(false);
  const [friendActivity, setFriendActivity] = useState(false);
  const [wishlistAlerts, setWishlistAlerts] = useState(false);
  const [recommendations, setRecommendations] = useState(false);

  const [autoSave, setAutoSave] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [holographicEffects, setHolographicEffects] = useState(true);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [scanVibration, setScanVibration] = useState(true);
  const [scanSound, setScanSound] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 20);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.addEventListener("close-settings", closeSettings);

    return () => {
      window.removeEventListener("close-settings", closeSettings);
    };
  }, []);

  function closeSettings() {
    setClosing(true);

    setTimeout(() => {
      const previousPage =
        sessionStorage.getItem("cdex-last-page-before-settings") || "/";

      router.push(previousPage);
    }, 220);
  }

  function clearLocalData() {
    const confirmDelete = confirm(
      "Tu veux vraiment supprimer toutes les données locales de CDex ?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem("cdex-user-albums");
    localStorage.removeItem("cdex-favorites");
    localStorage.removeItem("cdex-profile-description");

    alert("Données locales supprimées.");
  }

  function repairDuplicates() {
    const savedAlbums = localStorage.getItem("cdex-user-albums");
    const albums = savedAlbums ? JSON.parse(savedAlbums) : [];

    const cleanedAlbums = Array.from(
      new Map(
        albums.map((album: any) => [album.musicBrainzId || album.id, album])
      ).values()
    );

    localStorage.setItem("cdex-user-albums", JSON.stringify(cleanedAlbums));

    alert("Doublons nettoyés.");
  }

  return (
    <main
      className={`fixed inset-0 z-[900] overflow-y-auto bg-[#f7fbff] px-5 py-6 transition-transform duration-300 ease-out ${
        closing || !mounted ? "translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="mx-auto max-w-md pb-24">
        <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
            Paramètres
          </p>

          <h1 className="text-5xl font-black leading-none text-[#2155ff]">
            Réglages
          </h1>

          <p className="mt-5 text-base leading-7 text-[#5e6b85]">
            Gère ton expérience CDex, l’affichage, la confidentialité, le scan et tes données locales.
          </p>
        </section>

        <SettingsSection title="Compte">
          <Link
            href="/auth"
            className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-black text-[#2155ff]"
          >
            Connexion / Compte
          </Link>
        </SettingsSection>

        <SettingsSection title="Apparence">
          <SettingLine title="Animations" value={animations} setValue={setAnimations} />
          <SettingLine title="Effets holographiques" value={holographicEffects} setValue={setHolographicEffects} />

          <button className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-black text-[#2155ff]">
            Thème clair / sombre — bientôt
          </button>

          <button className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-black text-[#2155ff]">
            Taille des cartes — bientôt
          </button>
        </SettingsSection>

        <SettingsSection title="Confidentialité">
          <SettingLine title="Profil privé" value={privateProfile} setValue={setPrivateProfile} />
          <SettingLine title="Cacher la valeur de la collection" value={hideCollectionValue} setValue={setHideCollectionValue} />
          <SettingLine title="Cacher la wishlist" value={hideWishlist} setValue={setHideWishlist} />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingLine title="Notifications" value={notifications} setValue={setNotifications} />
          <SettingLine title="Activité des amis" value={friendActivity} setValue={setFriendActivity} />
          <SettingLine title="Alertes wishlist" value={wishlistAlerts} setValue={setWishlistAlerts} />
          <SettingLine title="Recommandations" value={recommendations} setValue={setRecommendations} />
        </SettingsSection>

        <SettingsSection title="Streaming">
          <button className="rounded-2xl bg-green-50 px-5 py-4 text-left text-sm font-black text-green-700">
            Connecter Spotify — bientôt
          </button>

          <button className="rounded-2xl bg-purple-50 px-5 py-4 text-left text-sm font-black text-purple-700">
            Connecter Deezer — bientôt
          </button>

          <button className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-black text-[#2155ff]">
            Playlist automatique — bientôt
          </button>
        </SettingsSection>

        <SettingsSection title="Scanner et recherche">
          <SettingLine title="Suggestions automatiques" value={autoSuggestions} setValue={setAutoSuggestions} />
          <SettingLine title="Vibration au scan" value={scanVibration} setValue={setScanVibration} />
          <SettingLine title="Son au scan" value={scanSound} setValue={setScanSound} />

          <button className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-black text-[#2155ff]">
            Tri de recherche par défaut — bientôt
          </button>
        </SettingsSection>

        <SettingsSection title="Collection et données">
          <SettingLine title="Sauvegarde automatique" value={autoSave} setValue={setAutoSave} />

          <button className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-black text-[#2155ff]">
            Exporter ma collection — bientôt
          </button>

          <button className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-black text-[#2155ff]">
            Importer une collection — bientôt
          </button>

          <button
            onClick={repairDuplicates}
            className="rounded-2xl border border-yellow-100 bg-yellow-50 px-5 py-4 text-left text-sm font-black text-yellow-700"
          >
            Réparer / supprimer les doublons
          </button>
        </SettingsSection>

        <section className="mt-6 rounded-[2rem] border border-red-100 bg-red-50/70 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-red-500">
            Danger
          </h2>

          <button
            onClick={clearLocalData}
            className="mt-5 w-full rounded-2xl bg-red-500 px-5 py-4 text-sm font-black text-white"
          >
            Supprimer les données locales
          </button>
        </section>
      </div>
    </main>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
      <h2 className="text-2xl font-black text-[#2155ff]">
        {title}
      </h2>

      <div className="mt-5 flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}

function SettingLine({
  title,
  value,
  setValue,
}: {
  title: string;
  value: boolean;
  setValue: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => setValue(!value)}
      className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4"
    >
      <span className="text-sm font-black text-[#071f4f]">
        {title}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          value
            ? "bg-[#2155ff] text-white"
            : "bg-white text-blue-500"
        }`}
      >
        {value ? "ON" : "OFF"}
      </span>
    </button>
  );
}