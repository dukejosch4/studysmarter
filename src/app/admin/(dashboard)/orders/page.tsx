"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button, Badge } from "@/components/shared";
import type { OrderWithProduct } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirm = async (orderId: string) => {
    setConfirmingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm`, {
        method: "POST",
      });
      if (res.ok) {
        fetchOrders();
      }
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Bestellungen</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">Noch keine Bestellungen.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">E-Mail</th>
                <th className="px-6 py-3 font-medium text-gray-500">Produkt</th>
                <th className="px-6 py-3 font-medium text-gray-500">Preis</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Datum</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {order.customer_email}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {order.products?.title || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {order.products
                      ? `${Number(order.products.price_eur).toFixed(2)} €`
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(order.id)}
                        loading={confirmingId === order.id}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Bestätigen
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "secondary" }> = {
    pending: { label: "Offen", variant: "warning" },
    confirmed: { label: "Bestätigt", variant: "success" },
    expired: { label: "Abgelaufen", variant: "secondary" },
  };
  const config = map[status] || map.pending;
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}
