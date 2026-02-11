"use client";

import { useState } from "react";
import { ExternalLink, Check, Mail } from "lucide-react";
import { Button } from "@/components/shared";

type PurchaseFormProps = {
  productId: string;
  productTitle: string;
  priceEur: number;
};

export function PurchaseForm({
  productId,
  productTitle,
  priceEur,
}: PurchaseFormProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"pay" | "confirm" | "done">("pay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paypalUrl = `https://paypal.me/Fabian112003/${priceEur}EUR`;

  const handleConfirm = async () => {
    if (!email) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          customer_email: email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bestellung fehlgeschlagen");
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <Check className="mx-auto mb-3 h-10 w-10 text-green-600" />
        <h3 className="mb-2 text-lg font-semibold text-green-900">
          Bestellung eingegangen!
        </h3>
        <p className="text-sm text-green-700">
          Wir prüfen deine Zahlung und senden dir den Download-Link an{" "}
          <strong>{email}</strong>. Das dauert in der Regel wenige Stunden.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Jetzt kaufen</h3>
        <span className="text-2xl font-bold text-indigo-600">
          {priceEur.toFixed(2)} &euro;
        </span>
      </div>

      <div className="space-y-4">
        {/* Step 1: Pay via PayPal */}
        <div>
          <p className="mb-2 text-sm text-gray-600">
            1. Bezahle über PayPal:
          </p>
          <a
            href={paypalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            Mit PayPal bezahlen ({priceEur.toFixed(2)} &euro;)
          </a>
        </div>

        {/* Step 2: Email + Confirm */}
        <div className="border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm text-gray-600">
            2. Gib deine E-Mail-Adresse ein und bestätige:
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <Button
              onClick={handleConfirm}
              loading={loading}
              disabled={!email}
            >
              Ich habe bezahlt
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="text-xs text-gray-400">
          Nach Bestätigung deiner Zahlung erhältst du einen Download-Link per
          E-Mail. Der Link ist 72 Stunden gültig.
        </p>
      </div>
    </div>
  );
}
