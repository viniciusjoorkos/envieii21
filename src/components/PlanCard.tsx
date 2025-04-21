
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Check } from 'lucide-react';

interface PlanProps {
  title: string;
  price: number;
  messages: number;
  includesVoice: boolean;
  features?: string[];
  onBuyClick: () => void;
}

const PlanCard: React.FC<PlanProps> = ({
  title,
  price,
  messages,
  includesVoice,
  features = [],
  onBuyClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-indigo-900/40 to-blue-900/20 backdrop-blur-sm border border-blue-500/20 p-6 transition-transform duration-500 hover:scale-105 hover:-translate-y-2">
      {/* Energy core effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-blue-400/60 to-indigo-600/0 blur-xl"></div>
      
      {/* Circuit lines effects */}
      <div className="absolute -right-12 top-1/4 w-24 h-0.5 bg-blue-500/20"></div>
      <div className="absolute -left-12 bottom-1/4 w-24 h-0.5 bg-blue-500/20"></div>
      
      {/* Energy field effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-indigo-900/5 animate-pulse-slow pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-blue-100">{title}</h3>
          {includesVoice && (
            <div className="bg-indigo-600/40 px-2 py-1 rounded text-xs text-blue-200 border border-blue-500/30">
              Chamadas de voz
            </div>
          )}
        </div>
        
        <div className="text-3xl font-bold mb-6 flex items-baseline text-blue-200">
          R${price}
          <span className="text-sm font-normal text-blue-400 ml-1">/mês</span>
        </div>
        
        <div className="border-t border-blue-500/20 pt-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-blue-400 flex-shrink-0" />
            <p className="text-blue-100">{messages.toLocaleString()} mensagens/mês</p>
          </div>
        </div>
        
        <div className="space-y-3 my-4">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="mt-1 text-blue-400">•</div>
              <p className="text-blue-300/90 text-sm">{feature}</p>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={onBuyClick}
          className="w-full mt-4 bg-indigo-900/50 hover:bg-blue-700/30 text-blue-100 border border-blue-500/50 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            Comprar
            <Zap size={16} className="text-blue-200 group-hover:animate-pulse" />
          </span>
          <span className="absolute inset-0 w-full bg-gradient-to-r from-blue-600/0 via-blue-400/20 to-indigo-600/0 group-hover:translate-x-full transition-transform duration-1000"></span>
        </Button>
      </div>
    </div>
  );
};

export default PlanCard;
