
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Particles from '@/components/Particles';
import { toast } from '@/components/ui/use-toast';

const Matrix = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple authentication
    if (username === 'vinicius' && password === 'teste12345') {
      setTimeout(() => {
        setIsLoading(false);
        navigate('/admin');
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Acesso negado",
          description: "Usuário ou senha incorretos",
          variant: "destructive"
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-matrix-green overflow-hidden">
      <Particles type="matrix" />
      
      <div className="z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono font-bold mb-2" style={{ textShadow: '0 0 10px #00FF41' }}>
            Acesso Admin
          </h1>
          <p className="text-matrix-green/80 font-mono">Faça login para acessar o sistema</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-black/70 backdrop-blur-sm border border-matrix-green/20 rounded-lg p-6 shadow-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-matrix-green/80 font-mono">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black border-matrix-green/30 text-matrix-green font-mono"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-matrix-green/80 font-mono">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black border-matrix-green/30 text-matrix-green font-mono"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4 bg-black border border-matrix-green text-matrix-green hover:bg-matrix-green/10"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Acessar"}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-matrix-green/70 hover:text-matrix-green font-mono"
          >
            Voltar para início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Matrix;
