import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Phone, QrCode, Key, LogOut, User, Users, Trophy, Star, Zap, Gift, Bolt } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AIControlButton from '@/components/AIControlButton';
import SmartTags, { TagType } from '@/components/SmartTags';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import WhatsAppConnector from '@/components/WhatsAppConnector';
import OpenAIConnector from '@/components/OpenAIConnector';
import whatsappService from '@/services/whatsappService';
import openaiService from '@/services/openaiService';
import { getUserPoints, getUserLevel } from '@/utils/gamification';
import { Input } from '@/components/ui/input';
import EDCREDChat from '@/components/EDCREDChat';

interface Challenge {
  id: number;
  title: string;
  progress?: number;
  total?: number;
  points: number;
  completed?: boolean;
}

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [mockConversations, setMockConversations] = useState<{id: string, name: string, lastMessage: string, tags: TagType[]}[]>([
    { id: '1', name: 'João Silva', lastMessage: 'Olá, gostaria de saber mais sobre o plano premium', tags: ['interessado'] },
    { id: '2', name: 'Maria Oliveira', lastMessage: 'Não estou conseguindo acessar minha conta', tags: ['reclamação', 'suporte'] },
    { id: '3', name: 'Carlos Santos', lastMessage: 'Quanto custa o plano básico?', tags: ['venda potencial'] },
  ]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [isAIPaused, setIsAIPaused] = useState(false);
  const [userPoints, setUserPoints] = useState(350); // Mock points
  const [userLevel, setUserLevel] = useState('Iniciante');
  const [qrConnected, setQrConnected] = useState(false);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [newLevel, setNewLevel] = useState('');
  const [lastMessageContent, setLastMessageContent] = useState('');
  const [envieiiToken, setEnvieiiToken] = useState('');
  const [showRewardConfirmation, setShowRewardConfirmation] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{title: string, description: string, cost: number}>({
    title: '',
    description: '',
    cost: 0
  });
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [openaiConnected, setOpenaiConnected] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: ''
  });
  const [showEdcredChat, setShowEdcredChat] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedToken = localStorage.getItem('envieiiToken');
    if (storedToken) {
      setEnvieiiToken(storedToken);
    } else {
      const newToken = 'ENV-' + Math.random().toString(16).substring(2, 10).toUpperCase();
      setEnvieiiToken(newToken);
      localStorage.setItem('envieiiToken', newToken);
    }
    
    const checkConnections = () => {
      setWhatsappConnected(whatsappService.getStatus() === 'authenticated');
      setOpenaiConnected(openaiService.getStatus().isConnected);
    };
    
    whatsappService.registerEventHandlers({
      onStatusChange: (status) => {
        setWhatsappConnected(status === 'authenticated');
        
        if (status === 'authenticated' && openaiConnected) {
          setTimeout(() => {
            const messagesTab = document.querySelector('[data-state="inactive"][value="messages"]') as HTMLElement;
            if (messagesTab) messagesTab.click();
          }, 1000);
        }
      }
    });
    
    checkConnections();
    
    setUserPoints(getUserPoints());
    
    const handlePointsUpdated = (event: CustomEvent<{points: number}>) => {
      setUserPoints(event.detail.points);
    };
    
    const handleLevelUp = (event: CustomEvent<{level: string}>) => {
      setNewLevel(event.detail.level);
      setShowLevelUpAnimation(true);
      
      const levelUpSound = new Audio('/level-up.mp3');
      levelUpSound.volume = 0.3;
      levelUpSound.play().catch(error => console.error('Erro ao reproduzir som:', error));
      
      setTimeout(() => {
        setShowLevelUpAnimation(false);
      }, 3000);
    };
    
    window.addEventListener('pointsUpdated', handlePointsUpdated as EventListener);
    window.addEventListener('levelUp', handleLevelUp as EventListener);
    
    const openaiInterval = setInterval(() => {
      const status = openaiService.getStatus();
      if (status.isConnected !== openaiConnected) {
        setOpenaiConnected(status.isConnected);
        
        if (status.isConnected && whatsappConnected) {
          setTimeout(() => {
            const messagesTab = document.querySelector('[data-state="inactive"][value="messages"]') as HTMLElement;
            if (messagesTab) messagesTab.click();
          }, 1000);
        }
      }
    }, 2000);
    
    updateUserLevel(userPoints);
    
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdated as EventListener);
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
      clearInterval(openaiInterval);
    };
  }, [navigate, openaiConnected, whatsappConnected]);
  
  const updateUserLevel = (points: number) => {
    let level = 'Iniciante';
    
    if (points >= 1000) {
      level = 'Master';
    } else if (points >= 500) {
      level = 'Pró';
    }
    
    if (level !== userLevel && userLevel !== '') {
      setNewLevel(level);
      setShowLevelUpAnimation(true);
      
      const levelUpSound = new Audio('/level-up.mp3');
      levelUpSound.volume = 0.3;
      levelUpSound.play().catch(error => console.error('Erro ao reproduzir som:', error));
      
      setTimeout(() => {
        setShowLevelUpAnimation(false);
      }, 3000);
    }
    
    setUserLevel(level);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate('/');
  };
  
  const handleConnectQR = () => {
    toast({
      title: "Gerando QR Code",
      description: "Por favor, aguarde enquanto preparamos o QR Code para conexão.",
      className: "bg-blue-900/80 border-blue-400 text-blue-50 relative overflow-hidden",
      action: (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-flow"></div>
      ),
    });

    setTimeout(() => {
      toast({
        title: "QR Code pronto",
        description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        className: "bg-blue-900/80 border-blue-400 text-blue-50",
      });

      setTimeout(() => {
        toast({
          title: "Conexão não concluída",
          description: "Tempo limite excedido. Tente novamente.",
          variant: "destructive",
        });
      }, 15000);
    }, 3000);
  };
  
  const handleAddAPIKey = () => {
    toast({
      title: "Token da OpenAI adicionado",
      description: "Seu token foi validado com sucesso!",
      className: "bg-green-900/80 border-green-400 text-green-50 relative overflow-hidden",
      action: (
        <div className="absolute inset-0 bg-gradient-to-tr from-green-400/10 via-transparent to-blue-400/10 animate-energy-pulse"></div>
      ),
    });

    awardPoints(100, "Conexão OpenAI");
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleConversationClick = (id: string) => {
    const convo = mockConversations.find(c => c.id === id);
    if (convo) {
      setLastMessageContent(convo.lastMessage);
    }
    
    setSelectedConvoId(id);
    awardPoints(5, "Interação com conversa");
  };

  const handleAddTag = (tag: TagType) => {
    if (selectedConvoId && tag) {
      setMockConversations(prevConvos => 
        prevConvos.map(convo => 
          convo.id === selectedConvoId 
            ? { ...convo, tags: [...convo.tags.filter(t => t !== tag), tag] } 
            : convo
        )
      );
      
      awardPoints(10, "Adição de etiqueta");
    }
  };

  const handleRemoveTag = (tag: TagType) => {
    if (selectedConvoId && tag) {
      setMockConversations(prevConvos => 
        prevConvos.map(convo => 
          convo.id === selectedConvoId 
            ? { ...convo, tags: convo.tags.filter(t => t !== tag) } 
            : convo
        )
      );
    }
  };

  const awardPoints = (points: number, reason: string) => {
    const newTotalPoints = userPoints + points;
    setUserPoints(newTotalPoints);
    
    toast({
      title: `+${points} pontos!`,
      description: `Você ganhou pontos por: ${reason}`,
      className: "bg-indigo-900/80 border-indigo-400 text-indigo-50 relative overflow-hidden",
      action: (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent animate-flow"></div>
      ),
    });
    
    updateUserLevel(newTotalPoints);
  };

  const handleRedeemReward = (reward: {title: string, description: string, cost: number}) => {
    if (userPoints >= reward.cost) {
      setSelectedReward(reward);
      setShowRewardConfirmation(true);
    } else {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de mais ${reward.cost - userPoints} pontos para resgatar esta recompensa.`,
        variant: "destructive",
      });
    }
  };

  const confirmRedeemReward = () => {
    setUserPoints(prev => prev - selectedReward.cost);
    setShowRewardConfirmation(false);
    toast({
      title: "Recompensa resgatada!",
      description: `${selectedReward.title} foi ativado na sua conta.`,
      className: "bg-blue-900/80 border-blue-400 text-blue-50 relative overflow-hidden",
      action: (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-energy-pulse"></div>
      ),
    });
    if (selectedReward.title === "Chamadas de Voz") {
    }
    else if (selectedReward.title === "Desconto de 10%") {
    }
  };

  const selectedConversation = mockConversations.find(convo => convo.id === selectedConvoId);

  const weeklyChallenges = [
    { id: 1, title: "Envie 50 mensagens", progress: 32, total: 50, points: 100 },
    { id: 2, title: "Conecte o WhatsApp", completed: qrConnected, points: 200 },
    { id: 3, title: "Adicione 5 etiquetas", progress: 2, total: 5, points: 50 },
  ];

  const topUsers = [
    { name: "Rafaela S.", points: 1250, level: "Master" },
    { name: "Carlos M.", points: 980, level: "Pró" },
    { name: "João V.", points: 750, level: "Pró" },
    { name: userName, points: userPoints, level: userLevel },
    { name: "Ana P.", points: 320, level: "Iniciante" },
  ].sort((a, b) => b.points - a.points);
  
  const availableRewards = [
    { 
      title: "Desconto de 10%", 
      description: "Na próxima renovação",
      cost: 500
    },
    { 
      title: "Chamadas de Voz", 
      description: "Ativar por 7 dias",
      cost: 300
    }
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const renderChallengeProgress = (challenge: { progress?: number; total?: number }) => {
    if (challenge.progress !== undefined && challenge.total !== undefined && challenge.total > 0) {
      const percentage = Math.round((challenge.progress / challenge.total) * 100);
      const width = (challenge.progress / challenge.total) * 100;

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{percentage}%</span>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div 
              className="h-full rounded-full bg-blue-600" 
              style={{ width: `${width}%` }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-dark-bg text-foreground relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/30 blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-400/30 blur-3xl animate-pulse-slow delay-2000"></div>
      </div>
      
      {showLevelUpAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
          <div className="bg-card-bg/90 border border-neon-gold/30 p-8 rounded-lg max-w-md shadow-lg relative overflow-hidden animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-purple-500/10 to-indigo-500/10 animate-energy-pulse"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-900/50 border-2 border-blue-400/30 flex items-center justify-center animate-float">
                <Bolt size={40} className="text-neon-gold animate-thunder-flash" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-300">Nível Aumentado!</h2>
              <p className="text-center text-xl font-semibold mb-4 text-neon-gold">{newLevel}</p>
              <p className="text-center text-foreground/80">Você subiu de nível e desbloqueou novos recursos!</p>
              <Button 
                className="w-full mt-6 bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200"
                onClick={() => setShowLevelUpAnimation(false)}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Dialog open={showRewardConfirmation} onOpenChange={setShowRewardConfirmation}>
        <DialogContent className="bg-card-bg border-neon-gold/20 text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift size={18} className="text-indigo-400" />
              Confirmar Resgate
            </DialogTitle>
            <DialogDescription className="text-foreground/60">
              Você está prestes a resgatar uma recompensa com seus pontos.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-dark-bg/50 rounded-md border border-neon-gold/10 my-4">
            <h3 className="font-medium text-lg">{selectedReward.title}</h3>
            <p className="text-foreground/70 text-sm mt-1">{selectedReward.description}</p>
            <div className="flex items-center gap-2 mt-3 text-yellow-300">
              <Star size={16} />
              <span>{selectedReward.cost} pontos</span>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRewardConfirmation(false)}
              className="border-neon-gold/30 text-neon-gold"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmRedeemReward}
              className="bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Gift size={16} />
                Confirmar Resgate
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="bg-card-bg border-b border-neon-gold/20 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-300 animate-pulse">ENVIEII</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-neon-gold" />
              <span className="text-foreground/80">{userName}</span>
              
              <Badge 
                className={
                  userLevel === 'Master' ? "bg-purple-900/40 text-purple-200 border-purple-600/30" :
                  userLevel === 'Pró' ? "bg-blue-900/40 text-blue-200 border-blue-600/30" :
                  "bg-green-900/40 text-green-200 border-green-600/30"
                }
              >
                {userLevel}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 bg-blue-900/20 px-2 py-1 rounded-full border border-blue-600/30">
              <Star size={14} className="text-yellow-400" />
              <span className="text-sm text-blue-200">{userPoints} pts</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1 bg-dark-bg/80 px-2 py-1 rounded-md border border-neon-gold/20">
              <span className="text-xs text-foreground/60">Token:</span>
              <span className="text-xs font-mono text-neon-gold">{envieiiToken}</span>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-foreground/70 hover:text-foreground"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="mb-8 grid grid-cols-6 gap-4">
            <TabsTrigger value="main" className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="connect" className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold">
              Conectar
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold">
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold relative">
              Desafios
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold">
              Configurações
            </TabsTrigger>
            <TabsTrigger value="sup" className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold">
              Sup
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="main" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-card-bg border-neon-gold/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Uso do Plano</CardTitle>
                  <MessageSquare className="h-5 w-5 text-neon-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0 / 10.000</div>
                  <p className="text-foreground/60 text-sm mt-1">Mensagens utilizadas</p>
                  <div className="w-full h-2 bg-dark-bg rounded-full mt-4">
                    <div className="w-0 h-full bg-neon-gold rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card-bg border-neon-gold/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Status</CardTitle>
                  <div className="flex h-3 w-3">
                    <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-medium text-green-500">Ativo</div>
                  <p className="text-foreground/60 text-sm mt-1">Sistema operando normalmente</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card-bg border-neon-gold/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">Meu Nível</CardTitle>
                  <Trophy className="h-5 w-5 text-neon-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-medium flex items-center gap-2">
                    <span>{userLevel}</span>
                    <Badge 
                      className={
                        userLevel === 'Master' ? "bg-purple-900/40 text-purple-200 border-purple-600/30" :
                        userLevel === 'Pró' ? "bg-blue-900/40 text-blue-200 border-blue-600/30" :
                        "bg-green-900/40 text-green-200 border-green-600/30"
                      }
                    >
                      {userPoints} pts
                    </Badge>
                  </div>
                  <p className="text-foreground/60 text-sm mt-1">Próximo nível: {userLevel === 'Iniciante' ? '500 pts' : userLevel === 'Pró' ? '1000 pts' : 'Nível máximo'}</p>
                  <div className="w-full h-2 bg-dark-bg rounded-full mt-4">
                    <div 
                      className={`h-full rounded-full ${
                        userLevel === 'Master' ? "bg-purple-500" :
                        userLevel === 'Pró' ? "bg-blue-500" :
                        "bg-green-500"
                      }`}
                      style={{ 
                        width: `${
                          userLevel === 'Master' ? '100' :
                          userLevel === 'Pró' ? `${((userPoints - 500) / 5)}` :
                          `${(userPoints / 5)}`
                        }%` 
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card-bg border-neon-gold/20 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-400" />
                    Ranking Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topUsers.map((user, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-md ${
                          user.name === userName ? "bg-blue-900/20 border border-blue-500/30" : "bg-dark-bg/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                            index === 0 ? "bg-yellow-500/20 text-yellow-300" :
                            index === 1 ? "bg-gray-400/20 text-gray-300" :
                            index === 2 ? "bg-amber-600/20 text-amber-300" :
                            "bg-blue-800/20 text-blue-300"
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{user.name}</span>
                          <Badge 
                            className={
                              user.level === 'Master' ? "bg-purple-900/40 text-purple-200 border-purple-600/30" :
                              user.level === 'Pró' ? "bg-blue-900/40 text-blue-200 border-blue-600/30" :
                              "bg-green-900/40 text-green-200 border-green-600/30"
                            }
                          >
                            {user.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400" />
                          <span>{user.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card-bg border-neon-gold/20">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AIControlButton 
                    className="w-full" 
                    onToggle={setIsAIPaused}
                  />
                  
                  <Button 
                    onClick={handleAdminClick}
                    className="w-full bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Users size={16} />
                      Todos os Usuários (Administrar)
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
                  </Button>

                  <Button 
                    onClick={() => setShowEdcredChat(true)}
                    className="w-full bg-blue-900/30 hover:bg-blue-800/40 border border-blue-600/30 text-blue-200 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <MessageSquare size={16} />
                      Edcred2025
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="connect" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-card-bg border-neon-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-neon-gold" />
                    Conectar WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <WhatsAppConnector />
                </CardContent>
              </Card>
              
              <Card className="bg-card-bg border-neon-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-neon-gold" />
                    API OpenAI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OpenAIConnector />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-card-bg border-neon-gold/20 md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Conversas</span>
                    <AIControlButton className="h-8 text-xs" onToggle={setIsAIPaused} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  {mockConversations.length > 0 ? (
                    <div className="divide-y divide-neon-gold/10">
                      {mockConversations.map((convo) => (
                        <div 
                          key={convo.id} 
                          className={`py-3 px-4 hover:bg-blue-900/10 cursor-pointer transition-colors ${
                            selectedConvoId === convo.id ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''
                          }`}
                          onClick={() => handleConversationClick(convo.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium text-foreground/90">{convo.name}</h3>
                            <SmartTags tags={convo.tags} size="sm" />
                          </div>
                          <p className="text-sm text-foreground/60 truncate">{convo.lastMessage}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground/60">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma conversa ativa</h3>
                      <p>Conecte seu WhatsApp para começar a utilizar o ENVIEII</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-card-bg border-neon-gold/20 md:col-span-3">
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle>
                      {selectedConversation 
                        ? selectedConversation.name
                        : "Mensagens"}
                    </CardTitle>
                    <p className="text-sm text-foreground/60 mt-1">
                      {selectedConversation 
                        ? "Conversa ativa" 
                        : "Selecione uma conversa para visualizar"}
                    </p>
                  </div>
                  {selectedConversation && (
                    <SmartTags 
                      tags={selectedConversation.tags} 
                      showAddButton={true}
                      editable={true}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      messageContent={lastMessageContent}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  {selectedConversation ? (
                    <div className="space-y-4">
                      <div className="bg-dark-bg/50 p-4 rounded-md border border-neon-gold/10">
                        <p className="text-foreground/80">{selectedConversation.lastMessage}</p>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-blue-900/30 p-4 rounded-md border border-blue-500/20 max-w-[80%] relative overflow-hidden group">
                          <p className="text-blue-100 relative z-10">Como posso ajudar com o plano premium?</p>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow pointer-events-none"></div>
                        </div>
                      </div>
                      <div className="p-4 text-center text-foreground/60 text-sm">
                        Status: {isAIPaused ? "Modo manual ativado" : "IA respondendo automaticamente"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-foreground/60">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
                      <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                      <p>Escolha uma conversa à esquerda para visualizar as mensagens</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="challenges" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-card-bg border-neon-gold/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy size={18} className="text-yellow-400" />
                      Desafios Semanais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {weeklyChallenges.map((challenge) => (
                        <div key={challenge.id} className="bg-dark-bg/50 p-4 rounded-md border border-neon-gold/10">
                          <div className="flex flex-wrap justify-between items-center mb-3">
                            <h3 className="font-medium text-foreground/90">{challenge.title}</h3>
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-400" />
                              <span className="text-sm">{challenge.points} pts</span>
                            </div>
                          </div>
                          
                          {challenge.hasOwnProperty('completed') ? (
                            <div className="flex items-center gap-2">
                              {challenge.completed ? (
                                <Badge className="bg-green-900/40 text-green-200 border-green-600/30">
                                  Completado
                                </Badge>
                              ) : (
                                <Button 
                                  onClick={handleConnectQR} 
                                  className="bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200 text-xs h-8 relative overflow-hidden group"
                                >
                                  <span className="relative z-10">Completar agora</span>
                                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-foreground/70">
                                <span>Progresso: {challenge.progress || 0}/{challenge.total || 0}</span>
                                {renderChallengeProgress(challenge)}
                              </div>
                              <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full relative overflow-hidden"
                                  style={{ width: `${((challenge.progress || 0) / (challenge.total || 1)) * 100}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent animate-flow"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="bg-card-bg border-neon-gold/20">
                  <CardHeader>
                    <CardTitle>Meus Pontos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-900/30 border-2 border-blue-500/30 mb-4 relative">
                        <div className="text-2xl font-bold text-blue-200">{userPoints}</div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 via-transparent to-indigo-400/10 animate-energy-pulse"></div>
                      </div>
                      <h3 className="text-xl font-medium mb-1">Nível: {userLevel}</h3>
                      <p className="text-foreground/60 text-sm">
                        {userLevel === 'Master' 
                          ? 'Você alcançou o nível máximo!' 
                          : `Próximo nível: ${userLevel === 'Iniciante' ? '500' : '1000'} pontos`}
                      </p>
                      
                      <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-sm text-foreground/70">
                          <span>Progresso</span>
                          <span>
                            {userLevel === 'Master' 
                              ? '100%' 
                              : `${Math.round(userPoints / (userLevel === 'Iniciante' ? 5 : 10))}%`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full relative overflow-hidden ${
                              userLevel === 'Master' ? "bg-purple-500" :
                              userLevel === 'Pró' ? "bg-blue-500" :
                              "bg-green-500"
                            }`}
                            style={{ 
                              width: `${
                                userLevel === 'Master' ? '100' :
                                userLevel === 'Pró' ? `${((userPoints - 500) / 5)}` :
                                `${(userPoints / 5)}`
                              }%` 
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-flow"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium mb-2">Recompensas Disponíveis</h4>
                      
                      {availableRewards.map((reward, index) => (
                        <div key={index} className="p-3 bg-dark-bg/50 rounded-md border border-neon-gold/10 flex justify-between items-center relative overflow-hidden group">
                          <div className="relative z-10">
                            <p className="font-medium">{reward.title}</p>
                            <p className="text-sm text-foreground/60">{reward.description}</p>
                          </div>
                          <Button 
                            disabled={userPoints < reward.cost}
                            onClick={() => handleRedeemReward(reward)}
                            className="bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200 text-xs h-8 disabled:opacity-50 relative z-10"
                          >
                            <Star size={12} className="mr-1 text-yellow-400" />
                            Resgatar ({reward.cost} pts)
                          </Button>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow pointer-events-none"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="animate-fade-in">
            <Card className="bg-card-bg border-neon-gold/20">
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personalização da IA</h3>
                  <p className="text-sm text-foreground/70 mb-4">Configure como o agente de IA deve se comportar nas conversas</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Assistente</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Ana, Carlos, Suporte ENVIEII" 
                        className="w-full bg-dark-bg border-neon-gold/30 rounded p-2 text-foreground"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Personalidade</label>
                      <select className="w-full bg-dark-bg border-neon-gold/30 rounded p-2 text-foreground">
                        <option value="friendly">Amigável</option>
                        <option value="professional">Profissional</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Respostas Rápidas</h3>
                  <p className="text-sm text-foreground/70 mb-4">Configure mensagens prontas para uso quando a IA estiver pausada</p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nova resposta rápida..." 
                        className="flex-1 bg-dark-bg border-neon-gold/30 rounded p-2 text-foreground"
                      />
                      <Button className="bg-dark-bg hover:bg-neon-gold/20 text-neon-gold border border-neon-gold/50">
                        Adicionar
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-dark-bg/50 border border-neon-gold/20 rounded p-3">
                        <p className="text-foreground/80">Olá, como posso ajudar?</p>
                        <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-foreground">
                          Remover
                        </Button>
                      </div>
                      <div className="flex justify-between items-center bg-dark-bg/50 border border-neon-gold/20 rounded p-3">
                        <p className="text-foreground/80">Obrigado pelo contato! Em breve retornarei.</p>
                        <Button variant="ghost" size="sm" className="text-foreground/60 hover:text-foreground">
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button className="bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200">
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sup" className="animate-fade-in">
            <Card className="bg-card-bg border-neon-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-neon-gold" />
                  Formulário de Suporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSupportSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/70 block mb-2">Nome</label>
                      <Input
                        type="text"
                        placeholder="Seu nome"
                        className="w-full bg-dark-bg border-neon-gold/30"
                        value={supportForm.name}
                        onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground/70 block mb-2">Email</label>
                      <Input
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        className="w-full bg-dark-bg border-neon-gold/30"
                        value={supportForm.email}
                        onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground/70 block mb-2">WhatsApp</label>
                      <Input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="w-full bg-dark-bg border-neon-gold/30"
                        value={supportForm.whatsapp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setSupportForm({ ...supportForm, whatsapp: value });
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground/70 block mb-2">Mensagem</label>
                      <textarea
                        placeholder="Digite sua mensagem..."
                        className="w-full bg-dark-bg border-neon-gold/30 rounded-md p-3 min-h-[150px] resize-none"
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-600/30 text-indigo-200 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <MessageSquare size={16} />
                      Enviar Mensagem
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {showEdcredChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
          <div className="bg-card-bg/90 border border-neon-gold/30 p-4 rounded-lg w-full max-w-4xl h-[80vh] shadow-lg relative overflow-hidden animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-purple-500/10 to-indigo-500/10 animate-energy-pulse"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edcred2025 - Ambiente de Testes</h2>
                <Button
                  onClick={() => setShowEdcredChat(false)}
                  className="bg-red-900/30 hover:bg-red-800/40 border border-red-600/30 text-red-200"
                >
                  Fechar
                </Button>
              </div>
              <EDCREDChat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
