"use client";

import { useState, useEffect } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/shared";

type PayPalButtonProps = {
  sessionId: string;
  amount?: number;
  credits?: number;
  onSuccess?: () => void;
};

/**
 * PayPal payment button.
 * Loads the PayPal JS SDK and renders a button for purchasing credits.
 */
export function PayPalButton({
  sessionId,
  amount = 2,
  credits = 1,
  onSuccess,
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      setSdkReady(true);
      setIsLoading(false);
      return;
    }

    // Load PayPal JS SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [clientId]);

  useEffect(() => {
    if (!sdkReady || !window.paypal) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    window.paypal
      .Buttons({
        createOrder: (_data: unknown, actions: PayPalActions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: "EUR",
                  value: amount.toFixed(2),
                },
                description: `StudySmarter - ${credits} Analyse-Credit${credits !== 1 ? "s" : ""}`,
                custom_id: sessionId,
              },
            ],
          });
        },
        onApprove: async (_data: unknown, actions: PayPalActions) => {
          await actions.order.capture();
          onSuccess?.();
        },
        style: {
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "pay",
          height: 40,
        },
      })
      .render("#paypal-button-container");
  }, [sdkReady, sessionId, amount, credits, onSuccess]);

  if (!clientId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
        Zahlungssystem nicht konfiguriert
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

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
      <div id="paypal-button-container" className="min-h-[40px]" />
    </div>
  );
}

// PayPal SDK types
type PayPalActions = {
  order: {
    create: (options: unknown) => Promise<string>;
    capture: () => Promise<unknown>;
  };
};

// Extend window for PayPal SDK
declare global {
  interface Window {
    paypal?: {
      Buttons: (options: unknown) => { render: (selector: string) => void };
    };
  }
}
