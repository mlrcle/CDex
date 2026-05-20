"use client";

import { useState } from "react";

import { supabase } from "../lib/supabase";
import {
  loadCloudData,
  saveCloudData,
  clearLocalCdexData,
} from "../lib/cloudSave";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      await saveCloudData();
      setMessage("Compte créé. Vérifie tes emails.");
    }

    setLoading(false);
  }

  async function signIn() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      clearLocalCdexData();
      await loadCloudData();

      setMessage("Connexion réussie.");

      window.location.href = "/profile";
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2rem] border border-blue-100 bg-white/80 p-7 shadow-lg">
        <p className="text-sm font-black uppercase tracking-widest text-blue-500">
          Compte
        </p>

        <h1 className="mt-2 text-5xl font-black text-[#2155ff]">
          Connexion
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Connecte-toi ou crée ton compte CDex.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none"
          />

          <button
            onClick={signIn}
            disabled={loading}
            className="rounded-2xl bg-[#2155ff] px-6 py-4 text-lg font-black text-white"
          >
            Se connecter
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4 text-lg font-black text-[#2155ff]"
          >
            Créer un compte
          </button>

          {message && (
            <p className="rounded-2xl bg-blue-50 px-5 py-4 text-sm font-bold text-[#2155ff]">
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}