
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Zap } from 'lucide-react';

interface ContactFormProps {
  isOpen: boolean;
  planTitle: string;
  onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ isOpen, planTitle, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send this data to your server
    console.log('Form submitted:', { name, email, whatsapp, planTitle });
    
    setSubmitted(true);
    
    toast({
      title: 'Pré-venda registrada',
      description: 'Vamos te avisar assim que iniciarmos.',
      className: "bg-indigo-900/80 border-blue-400 text-blue-50",
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setWhatsapp('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-blue-500/30 bg-gradient-to-b from-indigo-900/90 to-blue-900/80 backdrop-blur-md shadow-[0_0_15px_rgba(66,153,225,0.5)] animate-content-fade">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-blue-100 font-bold flex items-center justify-center gap-2">
            {submitted ? 'Pré-venda confirmada!' : 'Pré-venda'} 
            <Zap className="text-blue-400 animate-pulse" size={20} />
          </DialogTitle>
        </DialogHeader>
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-200">Nome</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-indigo-950/50 border-blue-500/30 focus:border-blue-400 focus:ring-blue-400/30 text-blue-100"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 pointer-events-none animate-flow"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-200">E-mail</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-indigo-950/50 border-blue-500/30 focus:border-blue-400 focus:ring-blue-400/30 text-blue-100"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 pointer-events-none animate-flow"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-blue-200">WhatsApp</Label>
              <div className="relative">
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="bg-indigo-950/50 border-blue-500/30 focus:border-blue-400 focus:ring-blue-400/30 text-blue-100"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 pointer-events-none animate-flow"></div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-center">
              <Button 
                type="submit"
                className="w-full bg-indigo-900/50 hover:bg-blue-700/30 text-blue-100 border border-blue-500/50 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Confirmar
                  <Zap size={16} className="text-blue-200" />
                </span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/0 via-blue-400/20 to-indigo-600/0 group-hover:translate-x-full transition-transform duration-700"></span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Zap size={32} className="text-blue-400" />
            </div>
            <p className="text-lg text-blue-100">Perfeito! Vamos te avisar assim que iniciarmos.</p>
            <Button 
              onClick={handleClose}
              className="bg-indigo-900/50 hover:bg-blue-700/30 text-blue-100 border border-blue-500/50 relative overflow-hidden group"
            >
              <span className="relative z-10">Fechar</span>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/0 via-blue-400/20 to-indigo-600/0 group-hover:translate-x-full transition-transform duration-700"></span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;
