import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Carrega o componente do QR Code de forma lazy
const WhatsAppQRCode = lazy(() => import("./WhatsAppQRCode"));

interface WhatsAppQRCodeWrapperProps {
  userId: string;
  onReady?: () => void;
}

export default function WhatsAppQRCodeWrapper({
  userId,
  onReady,
}: WhatsAppQRCodeWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Skeleton className="h-64 w-64 rounded-lg" />
        </div>
      }
    >
      <WhatsAppQRCode userId={userId} onReady={onReady} />
    </Suspense>
  );
} 