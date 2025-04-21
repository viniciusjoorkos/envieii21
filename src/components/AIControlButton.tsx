
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, MessageSquare, Plus, X, Zap, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import whatsappService from '@/services/whatsappService';
import openaiService from '@/services/openaiService';

interface AIControlButtonProps {
  className?: string;
  onToggle?: (isPaused: boolean) => void;
}

const AIControlButton: React.FC<AIControlButtonProps> = ({ className, onToggle }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [quickResponses, setQuickResponses] = useState<string[]>([
    "Olá, como posso ajudar?",
    "Obrigado pelo contato! Em breve retornarei."
  ]);
  const [newResponse, setNewResponse] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [canActivateAI, setCanActivateAI] = useState(false);

  useEffect(() => {
    // Check if both services are connected
    const checkConnections = () => {
      const whatsappStatus = whatsappService.getStatus();
      const openaiStatus = openaiService.getStatus();
      
      const isConnected = whatsappStatus === 'authenticated' && openaiStatus.isConnected;
      setCanActivateAI(isConnected);
      
      // If services disconnect, pause AI
      if (!isConnected && !isPaused) {
        setIsPaused(true);
        if (onToggle) onToggle(true);
      }
    };
    
    // Initial check
    checkConnections();
    
    // Set up WhatsApp status listener
    whatsappService.registerEventHandlers({
      onStatusChange: () => checkConnections(),
    });
    
    // Load saved quick responses from localStorage
    const savedResponses = localStorage.getItem('quickResponses');
    if (savedResponses) {
      try {
        setQuickResponses(JSON.parse(savedResponses));
      } catch (error) {
        console.error('Error loading quick responses:', error);
      }
    }
    
    // Set up event listener for changes in OpenAI connection status
    const handleOpenAIStatusChange = () => {
      checkConnections();
    };
    
    window.addEventListener('openai-status-change', handleOpenAIStatusChange);
    
    return () => {
      window.removeEventListener('openai-status-change', handleOpenAIStatusChange);
    };
  }, [isPaused, onToggle]);

  const toggleAIStatus = () => {
    // If trying to activate AI but services not connected
    if (!isPaused && !canActivateAI) {
      toast({
        title: "Não é possível ativar IA",
        description: "Conecte o WhatsApp e adicione sua chave da OpenAI primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    const newStatus = !isPaused;
    setIsPaused(newStatus);
    
    // Toast com efeito visual avançado
    toast({
      title: newStatus ? "IA Pausada" : "IA Ativada",
      description: newStatus 
        ? "Suas respostas rápidas estão disponíveis agora." 
        : "O assistente de IA está respondendo automaticamente.",
      className: newStatus 
        ? "bg-amber-900/80 border-amber-400 text-amber-50 animate-thunder-flash" 
        : "bg-blue-900/80 border-blue-400 text-blue-50 animate-energy-pulse",
      action: (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-electric-slide pointer-events-none"></div>
      ),
    });

    if (onToggle) {
      onToggle(newStatus);
    }
    
    // Show quick responses when AI is paused
    if (newStatus) {
      setShowQuickResponses(true);
    } else {
      setShowQuickResponses(false);
    }
    
    // Notify the server about AI status change
    if (whatsappService.checkFullIntegration()) {
      const envieiiToken = whatsappService.getEnvieiiToken();
      // In a real implementation, this would notify the server about AI status
      console.log(`AI status changed to ${newStatus ? 'paused' : 'active'} for token: ${envieiiToken}`);
    }
  };

  const addQuickResponse = () => {
    if (newResponse.trim()) {
      const updatedResponses = [...quickResponses, newResponse.trim()];
      setQuickResponses(updatedResponses);
      setNewResponse('');
      setIsAddingResponse(false);
      
      // Save to localStorage
      localStorage.setItem('quickResponses', JSON.stringify(updatedResponses));
      
      // Toast com animação futurista
      toast({
        title: "Resposta rápida adicionada",
        description: "Sua nova resposta rápida está disponível para uso.",
        className: "bg-indigo-900/80 border-indigo-400 text-indigo-50 relative overflow-hidden",
        action: (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent animate-flow"></div>
        ),
      });
    }
  };

  const removeQuickResponse = (index: number) => {
    const updatedResponses = [...quickResponses];
    updatedResponses.splice(index, 1);
    setQuickResponses(updatedResponses);
    
    // Save to localStorage
    localStorage.setItem('quickResponses', JSON.stringify(updatedResponses));
    
    toast({
      title: "Resposta rápida removida",
      description: "A resposta rápida foi removida com sucesso.",
      className: "bg-amber-900/80 border-amber-400 text-amber-50",
    });
  };

  const useQuickResponse = (response: string) => {
    // Em um app real, isso enviaria a mensagem
    toast({
      title: "Mensagem enviada",
      description: "Sua resposta rápida foi enviada com sucesso.",
      className: "bg-green-900/80 border-green-400 text-green-50 relative overflow-hidden",
      action: (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-flow"></div>
      ),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={toggleAIStatus}
        className={`relative overflow-hidden group ${className} ${
          isPaused 
            ? 'bg-amber-900/30 hover:bg-amber-800/40 border-amber-600/30 text-amber-200' 
            : 'bg-blue-900/30 hover:bg-blue-800/40 border-blue-600/30 text-blue-200'
        } ${!canActivateAI && !isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
        variant="outline"
      >
        <span className="relative z-10 flex items-center gap-2">
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
          {isPaused ? 'Ativar IA' : 'Pausar IA'}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
      </Button>

      {showQuickResponses && (
        <div className="mt-2 space-y-2 bg-card-bg/50 p-3 rounded-md border border-neon-gold/10 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground/80">Respostas Rápidas</h3>
            <Dialog open={isAddingResponse} onOpenChange={setIsAddingResponse}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus size={14} />
                  <span className="sr-only">Adicionar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card-bg border-neon-gold/20 text-foreground">
                <DialogHeader>
                  <DialogTitle>Adicionar Resposta Rápida</DialogTitle>
                  <DialogDescription className="text-foreground/60">
                    Crie uma nova resposta para uso rápido durante atendimentos.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Digite sua resposta rápida..."
                    className="bg-dark-bg border-neon-gold/30"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={addQuickResponse}
                    className="bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200"
                  >
                    <Save size={16} className="mr-2" />
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {quickResponses.map((response, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 rounded-md hover:bg-blue-900/10 transition-colors cursor-pointer group/item"
                onClick={() => useQuickResponse(response)}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-foreground/80 truncate">{response}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeQuickResponse(index);
                  }}
                >
                  <X size={12} />
                  <span className="sr-only">Remover</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIControlButton;
