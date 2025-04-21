import { toast } from "@/hooks/use-toast";
import openaiService from '@/services/openaiService';
import { awardPoints } from '@/utils/gamification';
import { 
  socketConnect, 
  socketDisconnect, 
  socketGenerateQrCode, 
  socketSendMessage,
  registerSocketEventHandlers,
  registerOpenAIKey
} from '@/services/whatsapp/socketHandler';
import { io, Socket } from "socket.io-client";
import config from '@/config/env';

// Define types for our events
type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'timeout' | 'failed';

interface WhatsAppEvents {
  onStatusChange: (status: WhatsAppStatus) => void;
  onQRCodeReceived: (qrCode: string) => void;
  onMessageReceived: (message: { from: string; body: string }) => void;
}

class WhatsAppService extends EventTarget {
  [x: string]: any;
  private static instance: WhatsAppService;
  private socket: Socket | null = null;
  private isInitialized = false;
  private initQueue: string[] = [];
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 2000;
  private status: WhatsAppStatus = 'disconnected';
  private events: WhatsAppEvents = {
    onStatusChange: () => {},
    onQRCodeReceived: () => {},
    onMessageReceived: () => {},
  };
  private qrCode: string | null = null;
  private qrTimeout: NodeJS.Timeout | null = null;
  private envieiiToken: string | null = null;
  private loading: boolean = false;
  private isConnected = false;
  private connectionAttempts = 0;

  private constructor() {
    super();
    // Inicializa o token antes de inicializar o socket
    this.envieiiToken = localStorage.getItem('envieiiToken');
    if (!this.envieiiToken) {
      this.envieiiToken = 'envieii_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('envieiiToken', this.envieiiToken);
    }
    this.initializeSocket();
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private initializeSocket(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Close existing socket if any
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    console.log('Initializing socket connection to:', config.socketUrl);

    try {
      const token = this.getAuthToken();

      this.socket = io(config.socketUrl, {
        // Transport configuration
        transports: ['websocket', 'polling'],
        
        // Timeout settings
        timeout: 30000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        
        // Authentication
        auth: {
          token: token
        },
        
        // Connection options
        autoConnect: true,
        forceNew: true,
        
        // Query parameters
        query: {
          clientType: 'web',
          timestamp: Date.now().toString()
        },
        
        // Path configuration
        path: '/socket.io/',
        
        // Security settings
        withCredentials: true,
        
        // Debug settings
        debug: process.env.NODE_ENV === 'development'
      });

      this.setupSocketListeners();
      
    } catch (error) {
      console.error('Error initializing socket:', error);
      this.handleConnectionError(error);
    }
  }

  private getAuthToken(): string {
    // Alterando para usar o envieiiToken ao invés do auth_token
    const token = this.envieiiToken || localStorage.getItem('envieiiToken');
    if (!token) {
      // Se não houver token, vamos criar um novo
      const newToken = 'envieii_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('envieiiToken', newToken);
      this.envieiiToken = newToken;
      return newToken;
    }
    return token;
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully', {
        transport: this.socket?.io.engine.transport.name,
        id: this.socket?.id,
        timestamp: new Date().toISOString()
      });
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      this.status = 'connected';

      toast({
        title: "Conectado",
        description: "Conexão estabelecida com o servidor",
        className: "bg-green-900/80 border-green-400 text-green-50",
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', {
        message: error.message,
        transport: this.socket?.io.engine.transport.name,
        timestamp: new Date().toISOString()
      });
      
      this.handleConnectionError(error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        reason,
        transport: this.socket?.io.engine.transport.name,
        timestamp: new Date().toISOString()
      });
      
      this.isConnected = false;
      this.status = 'disconnected';
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.handleReconnection();
      }
    });

    this.socket.on('qr', (qrCode) => {
      console.log('QR Code received');
      this.qrCode = qrCode;
    });
  }

  private handleConnectionError(error: any): void {
    console.error('Connection error:', error);
    
    this.updateStatus('failed');
    this.events.onStatusChange('failed');
    
    // Attempt to reconnect if we haven't exceeded max attempts
    if (this.connectionAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.connectionAttempts++;
      console.log(`Attempting to reconnect (${this.connectionAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
      
      setTimeout(() => {
        this.initializeSocket();
      }, this.RECONNECT_DELAY);
    } else {
      console.error('Max reconnection attempts reached');
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive",
      });
    }
  }

  private processInitQueue() {
    while (this.initQueue.length > 0) {
      const userId = this.initQueue.shift()!;
      this.initializeWhatsApp(userId);
    }
  }

  private initializeWhatsApp(userId: string) {
    if (!this.socket || !this.isInitialized) {
      this.initQueue.push(userId);
      return;
    }

    this.socket.emit("whatsapp:init", userId);
  }

  public init(userId: string) {
    this.initializeWhatsApp(userId);
  }

  public on(event: string, callback: (event: CustomEvent) => void) {
    this.addEventListener(event, callback as EventListener);
  }

  public off(event: string, callback: (event: CustomEvent) => void) {
    this.removeEventListener(event, callback as EventListener);
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Create or get ENVIEII token
      this.envieiiToken = localStorage.getItem('envieiiToken');
      if (!this.envieiiToken) {
        this.envieiiToken = 'envieii_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('envieiiToken', this.envieiiToken);
      }
      
      // Check if WhatsApp was previously connected
      const savedStatus = localStorage.getItem('whatsappStatus');
      if (savedStatus === 'authenticated' && this.envieiiToken) {
        try {
          await socketConnect(this.envieiiToken);
        } catch (error) {
          console.error('Error reconnecting to saved session:', error);
          // Clear saved status if reconnection fails
          localStorage.removeItem('whatsappStatus');
        }
      }
      
      // Setup socket event handlers
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          await this.setupSocketHandlers();
          this.isInitialized = true;
          return;
        } catch (error) {
          console.error(`Error setting up socket handlers (attempt ${retries + 1}/${maxRetries}):`, error);
          retries++;
          if (retries < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      throw new Error(`Failed to initialize after ${maxRetries} attempts`);
    } catch (error) {
      console.error('Error initializing WhatsApp service:', error);
      this.updateStatus('failed');
      toast({
        title: "Erro de Inicialização",
        description: "Não foi possível inicializar o serviço do WhatsApp. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }
  
  private async setupSocketHandlers() {
    try {
      await registerSocketEventHandlers(
        (qrCode: string) => {
          this.qrCode = qrCode;
          this.updateStatus('connecting');
          this.events.onQRCodeReceived(qrCode);
          
          if (this.qrTimeout) clearTimeout(this.qrTimeout);
          this.qrTimeout = setTimeout(() => {
            if (this.status === 'connecting') {
              this.updateStatus('timeout');
              this.qrCode = null;
              
              toast({
                title: "Tempo limite excedido",
                description: "O QR Code expirou. Por favor, tente novamente.",
                variant: "destructive",
              });
            }
          }, 60000);
        },
        
        (status: string) => {
          if (status === 'authenticated') {
            if (this.qrTimeout) clearTimeout(this.qrTimeout);
            this.updateStatus('authenticated');
            this.qrCode = null;
            
            awardPoints(200, "Conexão WhatsApp");
            
            const connectSound = new Audio('/connect.mp3');
            connectSound.volume = 0.3;
            connectSound.play().catch(error => console.error('Error playing sound:', error));
            
            toast({
              title: "WhatsApp Conectado!",
              description: "Seu WhatsApp foi conectado com sucesso!",
              className: "bg-green-900/80 border-green-400 text-green-50 relative overflow-hidden",
            });
            
            const openaiKey = openaiService.getApiKey();
            if (openaiKey && this.envieiiToken) {
              registerOpenAIKey(this.envieiiToken, openaiKey).catch(error => {
                console.error('Error registering OpenAI key:', error);
              });
            }
          }
        },
        
        (message: { from: string; body: string }) => {
          this.events.onMessageReceived(message);
        }
      );
    } catch (error) {
      console.error('Error setting up socket handlers:', error);
      throw error; // Re-throw to allow retry logic in initialize()
    }
  }
  
  public async setEnvieiiToken(token: string) {
    this.envieiiToken = token;
    localStorage.setItem('envieiiToken', token);
    
    await this.initialize();
    await socketConnect(token);
  }
  
  public getEnvieiiToken(): string | null {
    return this.envieiiToken;
  }
  
  public registerEventHandlers(handlers: Partial<WhatsAppEvents>) {
    this.events = { ...this.events, ...handlers };
  }
  
  public async generateQrCode() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    this.updateStatus('connecting');
    this.setLoading(true);
    
    if (!this.envieiiToken) {
      console.error('No EnvieiiToken found. Cannot generate QR code.');
      this.setLoading(false);
      return;
    }
    
    try {
      await socketGenerateQrCode(this.envieiiToken);
      console.log('Requesting QR code generation');
      
      toast({
        title: "Gerando QR Code",
        description: "Por favor, aguarde enquanto preparamos o QR Code para conexão.",
        className: "bg-blue-900/80 border-blue-400 text-blue-50 relative overflow-hidden",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.updateStatus('failed');
      this.setLoading(false);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar o QR Code. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }
  
  public getStatus(): WhatsAppStatus {
    return this.status;
  }
  
  public getQrCode(): string | null {
    return this.qrCode;
  }
  
  private updateStatus(newStatus: WhatsAppStatus) {
    this.status = newStatus;
    this.events.onStatusChange(newStatus);
    
    if (newStatus === 'authenticated') {
      localStorage.setItem('whatsappStatus', newStatus);
    } else if (newStatus === 'disconnected') {
      localStorage.removeItem('whatsappStatus');
    }
    
    if (newStatus === 'authenticated') {
      const openaiStatus = openaiService.getStatus();
      if (openaiStatus.isConnected) {
        const openaiKey = openaiService.getApiKey();
        if (openaiKey && this.envieiiToken) {
          registerOpenAIKey(this.envieiiToken, openaiKey);
          
          toast({
            title: "Assistente ativado",
            description: "WhatsApp e OpenAI estão conectados. O assistente virtual está ativo!",
            className: "bg-green-900/80 border-green-400 text-green-50 relative overflow-hidden"
          });
          
          awardPoints(300, "Integração completa");
        }
      }
    }
  }
  
  public async disconnect() {
    await socketDisconnect();
    this.updateStatus('disconnected');
    localStorage.removeItem('whatsappStatus');
  }
  
  public checkFullIntegration(): boolean {
    const whatsappConnected = this.status === 'authenticated';
    const openaiConnected = openaiService.getStatus().isConnected;
    
    return whatsappConnected && openaiConnected;
  }

  public setLoading(value: boolean) {
    this.loading = value;
  }

  public isLoading(): boolean {
    return this.loading;
  }
}

// Exporta a instância singleton
const whatsappService = WhatsAppService.getInstance();
export default whatsappService;
