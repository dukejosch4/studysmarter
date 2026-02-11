"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/shared";
import { signIn, signUp } from "@/app/actions/auth";

export default function AnmeldenPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        const result = await signIn(formData);
        if (result?.error) setError(result.error);
      } else {
        const result = await signUp(formData);
        if (result?.error) setError(result.error);
        if (result?.success) setSuccess(result.success);
      }
    } catch {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md items-center px-4 py-12">
      <div className="w-full space-y-6">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {mode === "login" ? "Willkommen zurück" : "Account erstellen"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === "login"
              ? "Melde dich an, um auf deine Analysen zuzugreifen"
              : "Registriere dich für gespeicherte Analysen"}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Dein Name"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="name@uni.de"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Mindestens 6 Zeichen"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {mode === "login" ? "Anmelden" : "Registrieren"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {mode === "login"
              ? "Noch kein Account? Registrieren"
              : "Schon registriert? Anmelden"}
          </button>
        </div>
      </div>
    </div>
  );
}
