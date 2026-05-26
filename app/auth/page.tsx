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
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupPopup, setSignupPopup] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!signupEmail.trim() || !signupPassword.trim()) {
      setSignupPopup("Remplis l'email et le mot de passe pour créer un compte.");
      setTimeout(() => setSignupPopup(""), 2400);
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });

    if (error) {
      setMessage(error.message);
    } else {
      await saveCloudData();
      setSignupOpen(false);
      setSignupPopup("");
      setSignupEmail("");
      setSignupPassword("");
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
            onClick={() => {
              setSignupEmail(email);
              setSignupPassword("");
              setSignupOpen(true);
              setMessage("");
            }}
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

      {signupOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#071f4f]/35 px-5 backdrop-blur-sm">
          {signupPopup && (
            <div className="fixed left-1/2 top-7 z-[1001] w-[calc(100%-4rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-blue-100 bg-white/95 px-5 py-4 text-center text-sm font-black text-[#2155ff] shadow-[0_14px_35px_rgba(33,85,255,0.22)] backdrop-blur-xl">
              {signupPopup}
            </div>
          )}

          <section className="w-full max-w-sm rounded-[2rem] border border-blue-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(33,85,255,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
                  Nouveau compte
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#2155ff]">
                  Rejoins CDex
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSignupOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg font-black text-[#2155ff] active:scale-95"
                aria-label="Fermer"
              >
                x
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none"
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none"
              />

              <button
                type="button"
                onClick={signUp}
                disabled={loading}
                className="rounded-2xl bg-[#2155ff] px-6 py-4 text-base font-black text-white disabled:opacity-60"
              >
                Créer mon compte
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
