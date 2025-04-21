import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';
import openaiService from '@/services/openaiService';
import whatsappService from '@/services/whatsappService';
import { awardPoints } from '@/utils/gamification';
import { toast } from '@/hooks/use-toast';
import { registerOpenAIKey } from '@/services/whatsapp/socketHandler';

const OpenAIConnector = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  useEffect(() => {
    // Initialize the OpenAI service
    openaiService.initialize();
    
    // Check if already connected
    const status = openaiService.getStatus();
    setIsConnected(status.isConnected);
    
    // If connected, set the masked API key
    if (status.apiKey) {
      setApiKey('sk-••••••••••••••••••••••••••••••');
    }
  }, []);
  
  const handleValidateKey = async () => {
    if (!apiKey || apiKey.startsWith('sk-••••')) return;
    
    setIsValidating(true);
    
    const isValid = await openaiService.validateApiKey(apiKey);
    
    if (isValid) {
      setIsConnected(true);
      setApiKey('sk-••••••••••••••••••••••••••••••');
      
      // Award points for connecting OpenAI
      awardPoints(100, "Conexão OpenAI");
      
      // Play achievement sound
      // const achievementSound = new Audio('/achievement.mp3');
      // achievementSound.volume = 0.3;
      // achievementSound.play().catch(error => console.error('Error playing sound:', error));
      
      // If WhatsApp is also connected, notify the server about the OpenAI key
      const whatsappStatus = whatsappService.getStatus();
      if (whatsappStatus === 'authenticated') {
        const envieiiToken = whatsappService.getEnvieiiToken();
        if (envieiiToken) {
          // Register the OpenAI key with the server
          registerOpenAIKey(envieiiToken, apiKey);
          
          toast({
            title: "Assistente ativado",
            description: "WhatsApp e OpenAI estão conectados. O assistente virtual está ativo!",
            className: "bg-green-900/80 border-green-400 text-green-50 relative overflow-hidden",
          });
          
          // Award additional points for completing full integration
          awardPoints(300, "Integração completa");
        }
      }
    }
    
    setIsValidating(false);
  };
  
  const handleDisconnect = () => {
    openaiService.disconnect();
    setIsConnected(false);
    setApiKey('');
  };
  
  return (
    <div className="space-y-4">
      <p className="text-foreground/80 mb-4">
        {isConnected 
          ? "Sua chave da OpenAI está conectada." 
          : "Adicione sua chave da OpenAI para habilitar recursos de IA"}
      </p>
      
      <div className="grid grid-cols-5 gap-4">
        <Input 
          type={apiKey.startsWith('sk-••••') ? "text" : "password"}
          value={apiKey}
          onChange={(e) => !isConnected && setApiKey(e.target.value)}
          placeholder="sk-..." 
          className="col-span-4 bg-dark-bg border-neon-gold/30 rounded p-2 text-foreground"
          disabled={isConnected || isValidating}
        />
        
        {isConnected ? (
          <Button 
            onClick={handleDisconnect}
            className="bg-red-900/30 hover:bg-red-800/40 text-red-200 border border-red-600/30 relative overflow-hidden group"
          >
            <span className="relative z-10">Desconectar</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
          </Button>
        ) : (
          <Button 
            onClick={handleValidateKey}
            disabled={!apiKey || isValidating}
            className="bg-dark-bg hover:bg-neon-gold/20 text-neon-gold border border-neon-gold/50 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {isValidating ? 'Validando...' : 'Validar'}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-gold/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
          </Button>
        )}
      </div>
      
      {!isConnected && (
        <>
          <p className="text-foreground/60 text-sm">
            Não compartilhamos sua chave com terceiros
          </p>
          <p className="text-blue-400 text-sm mt-2">
            <span className="inline-flex items-center">
              <Key size={14} className="mr-1 text-yellow-400" />
              Ganhe 100 pontos ao conectar sua API OpenAI!
            </span>
          </p>
        </>
      )}
    </div>
  );
};

export default OpenAIConnector;
