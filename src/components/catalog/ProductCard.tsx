import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, Badge } from "@/components/shared";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produkt/${product.id}`}>
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge size="sm">{product.subject}</Badge>
          </div>
          <CardTitle className="line-clamp-2">{product.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {product.description && (
            <p className="line-clamp-3 text-sm text-gray-500">
              {product.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-lg font-bold text-gray-900">
            {Number(product.price_eur).toFixed(2)} &euro;
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
            <FileText className="h-4 w-4" />
            Details
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
