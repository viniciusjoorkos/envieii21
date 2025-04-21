import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import whatsappService from '@/services/whatsappService';
import { awardPoints } from '@/utils/gamification';
import openaiService from '@/services/openaiService';

// Lazy load QRCode component
const QRCodeSVG = lazy(() => import('qrcode.react').then(module => ({ default: module.QRCodeSVG })));

const WhatsAppConnector = () => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const initializeWhatsApp = async () => {
      try {
        // Register event listeners
        whatsappService.registerEventHandlers({
          onQRCodeReceived: (qrCode) => {
            if (!mounted) return;
            console.log('QR Code received in component:', qrCode?.substring(0, 20) + '...');
            setQrCodeData(qrCode);
            setConnectionStatus('connecting');
            setIsGenerating(false);
          },
          onStatusChange: (status) => {
            if (!mounted) return;
            console.log('Status changed to:', status);
            setConnectionStatus(status);
            
            if (status === 'authenticated') {
              setQrCodeData(null);
              
              // Play connection sound
              const connectSound = new Audio('/connect.mp3');
              connectSound.volume = 0.3;
              connectSound.play().catch(error => console.error('Error playing sound:', error));
              
              // Award points for connecting WhatsApp
              awardPoints(100, "Conexão WhatsApp");
              
              toast({
                title: "WhatsApp Conectado!",
                description: "Seu WhatsApp foi conectado com sucesso!",
                className: "bg-green-900/80 border-green-400 text-green-50 relative overflow-hidden",
              });
            } else if (status === 'timeout') {
              toast({
                title: "Tempo limite excedido",
                description: "O QR Code expirou. Por favor, tente novamente.",
                variant: "destructive",
              });
              setIsGenerating(false);
            } else if (status === 'failed') {
              toast({
                title: "Falha na conexão",
                description: "Ocorreu um erro ao conectar com o WhatsApp.",
                variant: "destructive",
              });
              setIsGenerating(false);
            }
          },
          onMessageReceived: (message) => {
            if (!mounted) return;
            console.log('Message received:', message);
            
            const openaiStatus = openaiService.getStatus();
            if (openaiStatus.isConnected) {
              console.log('Processing message with OpenAI');
            }
          }
        });
      } catch (error) {
        console.error('Error initializing WhatsApp:', error);
        setConnectionStatus('failed');
        setIsGenerating(false);
      }
    };
    
    initializeWhatsApp();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  const handleGenerateQrCode = () => {
    setIsGenerating(true);
    
    toast({
      title: "Gerando QR Code",
      description: "Por favor, aguarde enquanto preparamos o QR Code para conexão.",
      className: "bg-blue-900/80 border-blue-400 text-blue-50 relative overflow-hidden",
    });
    
    const token = localStorage.getItem('envieiiToken');
    if (token) {
      whatsappService.setEnvieiiToken(token);
    }
    
    whatsappService.generateQrCode();
  };
  
  const statusLabels = {
    'disconnected': 'Desconectado',
    'connecting': 'Aguardando leitura do QR code',
    'connected': 'Conectado',
    'authenticated': 'Autenticado',
    'timeout': 'Tempo limite excedido',
    'failed': 'Falha na conexão'
  };
  
  const statusColor = {
    'disconnected': 'text-red-500',
    'connecting': 'text-yellow-500',
    'connected': 'text-blue-500',
    'authenticated': 'text-green-500',
    'timeout': 'text-red-500',
    'failed': 'text-red-500'
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className={`w-48 h-48 border-2 border-dashed border-neon-gold/40 rounded flex items-center justify-center mb-4 ${
        qrCodeData ? 'bg-white p-2' : ''
      }`}>
        {qrCodeData ? (
          <Suspense fallback={<div className="animate-pulse">Carregando QR Code...</div>}>
            <QRCodeSVG
              value={qrCodeData}
              size={160}
              level="M"
              includeMargin={true}
            />
          </Suspense>
        ) : (
          <p className="text-foreground/60 text-center px-4">
            {isGenerating 
              ? "Gerando QR Code..." 
              : connectionStatus === 'authenticated'
                ? "WhatsApp conectado"
                : "Clique para gerar QR Code"}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${
          connectionStatus === 'authenticated' ? "bg-green-500" :
          connectionStatus === 'connecting' ? "bg-yellow-500" :
          "bg-red-500"
        }`}></div>
        <span className={`text-sm ${statusColor[connectionStatus as keyof typeof statusColor] || 'text-foreground/60'}`}>
          {statusLabels[connectionStatus as keyof typeof statusLabels] || 'Status desconhecido'}
        </span>
      </div>
      
      <Button 
        onClick={handleGenerateQrCode} 
        disabled={isGenerating || connectionStatus === 'connecting' || connectionStatus === 'authenticated'}
        className="bg-dark-bg hover:bg-neon-gold/20 text-neon-gold border border-neon-gold/50 relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center gap-2">
          <QrCode size={16} />
          {connectionStatus === 'authenticated' 
            ? 'WhatsApp Conectado' 
            : isGenerating 
              ? 'Gerando...' 
              : 'Gerar QR Code'}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-gold/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
      </Button>
      
      <p className="mt-4 text-sm text-foreground/60 text-center">
        {connectionStatus === 'connecting' 
          ? "Escaneie o QR Code com seu WhatsApp para conectar sua conta. O código expira em 60 segundos." 
          : connectionStatus === 'authenticated'
            ? "Seu WhatsApp está conectado e pronto para uso."
            : "Clique no botão acima para gerar um QR Code e conectar seu WhatsApp."}
      </p>
    </div>
  );
};

export default WhatsAppConnector;
