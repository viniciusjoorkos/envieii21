import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Particles from '@/components/Particles';
import PlanCard from '@/components/PlanCard';
import ContactForm from '@/components/ContactForm';
import { Hammer, Zap, Shield, CircleDot } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [name, setName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cool lightning effect on load
  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "Bem-vindo à ENVIEII",
        description: "A plataforma de automação WhatsApp mais humanamente fluida em agentes de IA no Brasil.",
        className: "bg-indigo-900/80 border-blue-400 text-blue-50",
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsLoading(true);
      
      // Simulated loading with lightning effect
      toast({
        title: "Acesso concedido!",
        description: "Iniciando seu painel...",
        className: "bg-indigo-900/80 border-blue-400 text-blue-50",
      });
      
      setTimeout(() => {
        // Store the name in localStorage to use it in the dashboard
        localStorage.setItem('userName', name);
        navigate('/dashboard');
      }, 1200);
    }
  };

  const handleMatrixClick = () => {
    navigate('/matrix');
  };

  const handleBuyClick = (planTitle: string) => {
    setSelectedPlan(planTitle);
    setIsContactFormOpen(true);
  };

  const plans = [
    {
      title: "Plano Básico",
      price: 119,
      messages: 10000,
      includesVoice: false,
      features: [
        "Tempo de resposta humanizado",
        "Voz neutra sem efeito",
        "Posicionamento de tom",
        "Agente aprende sua empresa",
        "Agente aprende seus produtos",
        "Agendamentos e alertas",
        "Relatório de mensagens"
      ]
    },
    {
      title: "Plano Avançado",
      price: 219,
      messages: 40000,
      includesVoice: true,
      features: [
        "Tempo de resposta humanizado",
        "Voz neutra sem efeito",
        "Posicionamento de tom",
        "Agente aprende sua empresa",
        "Agente aprende seus produtos",
        "Agendamentos e alertas",
        "Relatório de mensagens",
        "Relatório de ligações"
      ]
    },
    {
      title: "Plano Premium",
      price: 419,
      messages: 100000,
      includesVoice: true,
      features: [
        "Tempo de resposta humanizado",
        "Voz neutra sem efeito",
        "Posicionamento de tom",
        "Agente aprende sua empresa",
        "Agente aprende seus produtos",
        "Agendamentos e alertas",
        "Relatório de mensagens",
        "Relatório de ligações"
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-800 text-gray-100 relative overflow-hidden">
      <Particles type="thor" />
      
      <div className="container max-w-7xl mx-auto px-4 py-16 z-10">
        <div className="max-w-2xl mx-auto text-center mb-12 relative">
          {/* Lightning Icon */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-40">
            <Zap size={100} className="text-blue-400 animate-pulse" />
          </div>
          
          {/* Main Title with Thor-inspired styling */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-300 animate-thunder-flash">
            ENVIEII
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            <span className="relative inline-block">
              Aumente suas vendas com a plataforma de automação WhatsApp
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></span>
            </span>
            <br />
            <span className="font-medium text-blue-200">mais humanamente fluida em agentes de IA no Brasil.</span>
          </p>
          
          <form onSubmit={handleNameSubmit} className="mb-8 flex flex-col sm:flex-row gap-4 justify-center relative">
            <div className="relative w-full max-w-md">
              <Input
                type="text"
                placeholder="Digite seu nome para entrar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-indigo-900/20 border-blue-500/30 focus:border-blue-400 text-lg py-6 pl-4 pr-10 backdrop-blur-sm"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CircleDot size={20} className="text-blue-400" />
              </div>
            </div>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-indigo-900/50 hover:bg-blue-700/30 text-blue-100 border border-blue-500/50 transition-all duration-300 relative overflow-hidden py-6 group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? "Conectando..." : "Entrar"}
                <Zap size={16} className="animate-pulse" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/20 to-indigo-600/0 group-hover:translate-x-full transition-transform duration-1000"></span>
            </Button>
          </form>
        </div>
        
        {/* Thor-inspired plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {plans.map((plan, index) => (
            <PlanCard
              key={index}
              title={plan.title}
              price={plan.price}
              messages={plan.messages}
              includesVoice={plan.includesVoice}
              features={plan.features}
              onBuyClick={() => handleBuyClick(plan.title)}
            />
          ))}
        </div>
        
        {/* Matrix button with Thor theme */}
        <div className="mt-16 text-center">
          <Button 
            onClick={handleMatrixClick} 
            className="relative overflow-hidden bg-black/70 border border-green-500/30 text-green-400 hover:bg-green-900/20 hover:border-green-400/50 group"
          >
            <span className="relative z-10 flex items-center gap-2">
              Matrix
              <Shield size={16} className="text-green-500" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-b from-green-800/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </div>
        
        {/* Footer with Thor-inspired styling */}
        <footer className="mt-16 text-center">
          <div className="inline-block py-2 px-4 rounded-full bg-indigo-900/20 border border-blue-500/10 backdrop-blur-sm">
            <p className="text-blue-400/70">
              Desenvolvido pelo grupo <span className="text-blue-300 font-semibold">Axion</span>
            </p>
            <p className="text-blue-400/70">
              CEO: <span className="text-blue-300 font-semibold">Edcred</span>
            </p>
          </div>
        </footer>
      </div>
      
      {/* Contact form with Thor theme */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        planTitle={selectedPlan || ''} 
        onClose={() => setIsContactFormOpen(false)} 
      />
    </div>
  );
};

export default Index;
