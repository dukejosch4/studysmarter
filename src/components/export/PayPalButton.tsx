"use client";

import { CreditCard } from "lucide-react";

type PayPalButtonProps = {
  amount?: number;
  credits?: number;
};

/**
 * PayPal payment button.
 * Opens paypal.me link for manual payment.
 */
export function PayPalButton({
  amount = 2,
  credits = 1,
}: PayPalButtonProps) {
  const paypalMeUrl = `https://paypal.me/Fabian112003/${amount.toFixed(2)}EUR`;

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">
          {credits} Analyse-Credit{credits !== 1 ? "s" : ""} kaufen
        </p>
        <p className="text-xs text-gray-500">
          {amount.toFixed(2)} EUR via PayPal
        </p>
      </div>
      <a
        href={paypalMeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <CreditCard className="h-4 w-4" />
        Mit PayPal bezahlen
      </a>
    </div>
  );
}
