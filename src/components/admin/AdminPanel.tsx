import React, { useState } from 'react';
import { Label, Input, Button } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AdminPanel = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveOpenaiKey = async () => {
    setIsSaving(true);
    try {
      // Aqui você pode implementar a lógica para salvar a chave no backend
      localStorage.setItem('openai_key', openaiKey);
      toast({
        title: "Chave salva com sucesso",
        description: "A chave da OpenAI foi atualizada.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a chave da OpenAI.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configurações da OpenAI</h2>
        <p className="text-muted-foreground">
          Configure a chave da API da OpenAI para o ambiente EDCRED
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Chave da API OpenAI</Label>
          <Input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <Button
          onClick={handleSaveOpenaiKey}
          disabled={isSaving || !openaiKey}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Chave'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel; 