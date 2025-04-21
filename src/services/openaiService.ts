import { toast } from "@/hooks/use-toast";

interface OpenAIStatus {
  isConnected: boolean;
  apiKey: string | null;
}

class OpenAIService {
  private apiKey: string | null = null;
  private isConnected: boolean = false;
  
  public async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/openai/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key })
      });

      const data = await response.json();
      
      if (data.isValid) {
        this.apiKey = key;
        this.isConnected = true;
        localStorage.setItem('openai_api_key', key);
        
        toast({
          title: "API OpenAI conectada",
          description: "Sua chave da OpenAI foi validada com sucesso.",
          className: "bg-green-900/80 border-green-400 text-green-50 relative overflow-hidden"
        });
      } else {
        toast({
          title: "Chave da API inválida",
          description: "Por favor, verifique sua chave da OpenAI e tente novamente.",
          variant: "destructive"
        });
      }
      
      return data.isValid;
    } catch (error) {
      console.error('Error validating OpenAI API key:', error);
      this.isConnected = false;
      
      toast({
        title: "Erro na API",
        description: "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        variant: "destructive"
      });
      
      return false;
    }
  }
  
  public getStatus(): OpenAIStatus {
    return {
      isConnected: this.isConnected,
      apiKey: this.apiKey,
    };
  }
  
  public getApiKey(): string | null {
    return this.apiKey;
  }
  
  public initialize() {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      this.apiKey = savedKey;
      this.isConnected = true;
    }
  }
  
  public disconnect() {
    this.apiKey = null;
    this.isConnected = false;
    localStorage.removeItem('openai_api_key');
  }
}

// Singleton instance
const openaiService = new OpenAIService();
export default openaiService;
