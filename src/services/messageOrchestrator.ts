import { io, Socket } from "socket.io-client";
import openaiService from "./openaiService";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  status: "pending" | "processing" | "completed" | "failed";
  source: "whatsapp" | "openai" | "system";
}

interface Session {
  userId: string;
  whatsappSessionId: string;
  lastActivity: number;
  messageQueue: Message[];
  isProcessing: boolean;
  whatsappInitialized: boolean;
}

class MessageOrchestrator extends EventTarget {
  private socket: Socket | null = null;
  private sessions: Map<string, Session> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000;
  private processingTimeout: number = 30000;
  private whatsappInitQueue: string[] = [];

  constructor() {
    super();
    this.initializeSocket();
  }

  private initializeSocket() {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3002";
    
    this.socket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectTimeout,
      timeout: this.processingTimeout,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket conectado ao servidor");
      this.reconnectAttempts = 0;
      this.dispatchEvent(new CustomEvent("socket:connected"));
      
      // Processa fila de inicialização do WhatsApp
      this.processWhatsAppInitQueue();
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("Socket desconectado:", reason);
      this.dispatchEvent(new CustomEvent("socket:disconnected", { detail: reason }));
      this.handleReconnection();
    });

    this.socket.on("whatsapp:message", this.handleWhatsAppMessage.bind(this));
    this.socket.on("whatsapp:status", this.handleWhatsAppStatus.bind(this));
    this.socket.on("whatsapp:qr", this.handleWhatsAppQR.bind(this));
    this.socket.on("whatsapp:ready", this.handleWhatsAppReady.bind(this));
    this.socket.on("error", this.handleError.bind(this));
  }

  private processWhatsAppInitQueue() {
    while (this.whatsappInitQueue.length > 0) {
      const userId = this.whatsappInitQueue.shift()!;
      this.initializeWhatsApp(userId);
    }
  }

  private initializeWhatsApp(userId: string) {
    if (!this.socket) {
      this.whatsappInitQueue.push(userId);
      return;
    }

    const session = this.getOrCreateSession(userId);
    if (session.whatsappInitialized) return;

    this.socket.emit("whatsapp:init", userId);
    session.whatsappInitialized = true;
  }

  private handleWhatsAppQR(qr: string) {
    this.dispatchEvent(new CustomEvent("whatsapp:qr", { detail: qr }));
  }

  private handleWhatsAppReady() {
    this.dispatchEvent(new CustomEvent("whatsapp:ready"));
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.initializeSocket(), this.reconnectTimeout);
    } else {
      console.error("Máximo de tentativas de reconexão atingido");
      this.dispatchEvent(new CustomEvent("socket:reconnection_failed"));
    }
  }

  private async handleWhatsAppMessage(message: Message) {
    try {
      const session = this.getOrCreateSession(message.userId);
      session.messageQueue.push(message);
      session.lastActivity = Date.now();

      if (!session.isProcessing) {
        await this.processMessageQueue(session);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem do WhatsApp:", error);
      this.dispatchEvent(new CustomEvent("error", { 
        detail: { type: "message_processing", error } 
      }));
    }
  }

  private handleWhatsAppStatus(status: any) {
    console.log("Status do WhatsApp:", status);
    this.dispatchEvent(new CustomEvent("whatsapp:status_update", { detail: status }));
  }

  private handleError(error: any) {
    console.error("Erro no socket:", error);
    this.dispatchEvent(new CustomEvent("error", { 
      detail: { type: "socket", error } 
    }));
  }

  private getOrCreateSession(userId: string): Session {
    let session = this.sessions.get(userId);
    if (!session) {
      session = {
        userId,
        whatsappSessionId: "",
        lastActivity: Date.now(),
        messageQueue: [],
        isProcessing: false,
        whatsappInitialized: false,
      };
      this.sessions.set(userId, session);
    }
    return session;
  }

  private async processMessageQueue(session: Session) {
    if (session.isProcessing || session.messageQueue.length === 0) return;

    session.isProcessing = true;

    try {
      while (session.messageQueue.length > 0) {
        const message = session.messageQueue.shift()!;
        await this.processMessage(message);
      }
    } finally {
      session.isProcessing = false;
    }
  }

  private async processMessage(message: Message) {
    try {
      this.dispatchEvent(new CustomEvent("message:status", { 
        detail: { ...message, status: "processing" } 
      }));

      if (!openaiService.getStatus().isConnected) {
        throw new Error("API da OpenAI não está conectada");
      }

      const response = await this.getOpenAIResponse(message.content);
      await this.sendWhatsAppResponse(message.userId, response);

      this.dispatchEvent(new CustomEvent("message:status", { 
        detail: { ...message, status: "completed" } 
      }));
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      this.dispatchEvent(new CustomEvent("message:status", { 
        detail: { ...message, status: "failed" } 
      }));
      throw error;
    }
  }

  private async getOpenAIResponse(content: string): Promise<string> {
    return `Resposta da OpenAI para: ${content}`;
  }

  private async sendWhatsAppResponse(userId: string, content: string) {
    if (!this.socket) throw new Error("Socket não está conectado");

    this.socket.emit("whatsapp:send", {
      userId,
      content,
      timestamp: Date.now(),
    });
  }

  public sendMessage(userId: string, content: string) {
    if (content === "init") {
      this.initializeWhatsApp(userId);
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      userId,
      content,
      timestamp: Date.now(),
      status: "pending",
      source: "system",
    };

    this.handleWhatsAppMessage(message);
  }

  public getSessionStatus(userId: string) {
    return this.sessions.get(userId);
  }

  public cleanupInactiveSessions(timeout: number = 3600000) {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > timeout) {
        this.sessions.delete(userId);
        this.dispatchEvent(new CustomEvent("session:cleaned", { detail: userId }));
      }
    }
  }

  public on(event: string, callback: (event: CustomEvent) => void) {
    this.addEventListener(event, callback as EventListener);
  }

  public off(event: string, callback: (event: CustomEvent) => void) {
    this.removeEventListener(event, callback as EventListener);
  }
}

const messageOrchestrator = new MessageOrchestrator();
export default messageOrchestrator; 