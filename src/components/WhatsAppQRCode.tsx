import { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { toast } from "@/hooks/use-toast";
import whatsappService from "@/services/whatsappService";

interface WhatsAppQRCodeProps {
  userId: string;
  onReady?: () => void;
}

export default function WhatsAppQRCode({ userId, onReady }: WhatsAppQRCodeProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleQR = (event: CustomEvent) => {
      if (mounted) {
        setQrCode(event.detail);
        setIsLoading(false);
      }
    };

    const handleReady = () => {
      if (mounted) {
        setIsLoading(false);
        onReady?.();
      }
    };

    const handleError = (event: CustomEvent) => {
      if (mounted) {
        console.error("Erro no WhatsApp:", event.detail);
        toast({
          title: "Erro na conexão",
          description: "Não foi possível conectar ao WhatsApp. Tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    // Adiciona listeners
    whatsappService.on("qr", handleQR);
    whatsappService.on("ready", handleReady);
    whatsappService.on("error", handleError);

    // Inicializa o WhatsApp imediatamente
    whatsappService.init(userId);

    return () => {
      mounted = false;
      whatsappService.off("qr", handleQR);
      whatsappService.off("ready", handleReady);
      whatsappService.off("error", handleError);
    };
  }, [userId, onReady]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!qrCode) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCode
          value={qrCode}
          size={256}
          level="H"
          includeMargin={true}
          className="w-full h-full"
        />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Escaneie o QR Code com o WhatsApp no seu celular
      </p>
    </div>
  );
} 