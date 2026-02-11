"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/shared";

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
      <Button
        asChild
        className="w-full"
      >
        <a href={paypalMeUrl} target="_blank" rel="noopener noreferrer">
          <CreditCard className="mr-2 h-4 w-4" />
          Mit PayPal bezahlen
        </a>
      </Button>
    </div>
  );
}
