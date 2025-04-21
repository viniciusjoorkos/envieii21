
import React, { useState, useEffect } from 'react';
import { Tag, AlertCircle, ShoppingCart, HelpCircle, Star, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

export type TagType = 'interessado' | 'reclamação' | 'suporte' | 'venda potencial' | null;

interface SmartTagsProps {
  tags: TagType[];
  onAddTag?: (tag: TagType) => void;
  onRemoveTag?: (tag: TagType) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showAddButton?: boolean;
  editable?: boolean;
  messageContent?: string; // Adicionado para detecção automática
}

const SmartTags: React.FC<SmartTagsProps> = ({ 
  tags, 
  onAddTag, 
  onRemoveTag,
  className = '', 
  size = 'md',
  showAddButton = false,
  editable = false,
  messageContent = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Análise automática de conteúdo da mensagem
  useEffect(() => {
    if (messageContent && onAddTag) {
      detectIntentFromMessage(messageContent);
    }
  }, [messageContent, onAddTag]);
  
  const detectIntentFromMessage = (content: string) => {
    const lowerContent = content.toLowerCase();
    
    // Padrões para detecção de intenção
    const patterns = {
      'interessado': [
        'interessado', 'quero saber mais', 'preço', 'quanto custa', 'novidades', 
        'informações', 'como funciona', 'detalhes'
      ],
      'reclamação': [
        'problema', 'não funciona', 'erro', 'insatisfeito', 'decepcionado', 
        'ruim', 'péssimo', 'reclamação', 'cancelar', 'reembolso', 'bug'
      ],
      'suporte': [
        'ajuda', 'suporte', 'como faço', 'não consigo', 'dificuldade', 'dúvida', 'tutorial', 
        'como usar', 'instruções', 'manual'
      ],
      'venda potencial': [
        'comprar', 'adquirir', 'assinar', 'plano', 'pacote', 'contrato', 'serviço', 
        'pagamento', 'cartão', 'pagar', 'quero contratar'
      ]
    };
    
    // Verifica cada padrão
    for (const [tag, keywords] of Object.entries(patterns)) {
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword) && !tags.includes(tag as TagType)) {
          onAddTag(tag as TagType);
          return; // Adiciona apenas a tag mais relevante por mensagem
        }
      }
    }
  };

  const getTagIcon = (tag: TagType) => {
    switch(tag) {
      case 'interessado':
        return <Star size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-yellow-400" />;
      case 'reclamação':
        return <AlertCircle size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-red-400" />;
      case 'suporte':
        return <HelpCircle size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-blue-400" />;
      case 'venda potencial':
        return <ShoppingCart size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-green-400" />;
      default:
        return null;
    }
  };

  const getTagColor = (tag: TagType) => {
    switch(tag) {
      case 'interessado':
        return 'bg-yellow-900/30 border-yellow-600/30 text-yellow-200';
      case 'reclamação':
        return 'bg-red-900/30 border-red-600/30 text-red-200';
      case 'suporte':
        return 'bg-blue-900/30 border-blue-600/30 text-blue-200';
      case 'venda potencial':
        return 'bg-green-900/30 border-green-600/30 text-green-200';
      default:
        return 'bg-gray-800/30 border-gray-600/30 text-gray-200';
    }
  };

  const getTagText = (tag: TagType) => {
    switch(tag) {
      case 'interessado':
        return 'Interessado';
      case 'reclamação':
        return 'Reclamação';
      case 'suporte':
        return 'Suporte';
      case 'venda potencial':
        return 'Venda Potencial';
      default:
        return '';
    }
  };

  const handleAddTag = (tag: TagType) => {
    if (onAddTag) {
      onAddTag(tag);
      toast({
        title: "Etiqueta adicionada",
        description: `A etiqueta "${getTagText(tag)}" foi adicionada com sucesso.`,
        className: "bg-blue-900/80 border-blue-400 text-blue-50",
      });
    }
    setIsOpen(false);
  };

  const handleRemoveTag = (tag: TagType) => {
    if (onRemoveTag && tag) {
      onRemoveTag(tag);
      toast({
        title: "Etiqueta removida",
        description: `A etiqueta "${getTagText(tag)}" foi removida.`,
        className: "bg-amber-900/80 border-amber-400 text-amber-50",
      });
    }
  };

  const availableTags: TagType[] = ['interessado', 'reclamação', 'suporte', 'venda potencial'];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        tag && (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getTagColor(tag)} text-xs font-medium animate-fade-in group`}>
                  {getTagIcon(tag)}
                  {size !== 'sm' && <span>{getTagText(tag)}</span>}
                  {editable && (
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="sr-only">Remover</span>
                      <span className="text-xs">&times;</span>
                    </button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getTagText(tag)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      ))}
      
      {(showAddButton || editable) && onAddTag && (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-1 px-2 py-1 rounded-full border bg-blue-900/20 border-blue-600/30 text-blue-200 text-xs font-medium hover:bg-blue-900/40 transition-colors relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-1">
                      <Plus size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
                      {size !== 'sm' && <span>Adicionar</span>}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-flow"></span>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar etiqueta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end" className="bg-dark-bg border-neon-gold/20 text-foreground">
            {availableTags
              .filter(tag => !tags.includes(tag))
              .map((tag) => (
                <DropdownMenuItem 
                  key={tag} 
                  onClick={() => handleAddTag(tag)}
                  className="flex items-center gap-2 hover:bg-blue-900/20 cursor-pointer"
                >
                  {getTagIcon(tag)}
                  <span>{getTagText(tag)}</span>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default SmartTags;
