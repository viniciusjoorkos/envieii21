import { Server, Socket } from "socket.io";
import { Client } from "whatsapp-web.js";
import openaiService from "../services/openaiService";
import { EventEmitter } from "events";

interface WhatsAppClient {
  client: Client;
  qrCode: string | null;
  isReady: boolean;
}

class MessageMiddleware extends EventEmitter {
  private io: Server;
  private whatsappClients: Map<string, WhatsAppClient> = new Map();
  private messageQueue: Map<string, any[]> = new Map();
  private processingMessages: Set<string> = new Set();

  constructor(io: Server) {
    super();
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Cliente conectado:", socket.id);

      socket.on("whatsapp:init", this.handleWhatsAppInit.bind(this, socket));
      socket.on("whatsapp:send", this.handleWhatsAppSend.bind(this, socket));
      socket.on("whatsapp:status", this.handleWhatsAppStatus.bind(this, socket));
      socket.on("disconnect", this.handleDisconnect.bind(this, socket));
    });
  }

  private async handleWhatsAppInit(socket: Socket, userId: string) {
    try {
      const client = new Client({
        puppeteer: {
          args: ["--no-sandbox"],
        },
      });

      const whatsappClient: WhatsAppClient = {
        client,
        qrCode: null,
        isReady: false,
      };

      this.whatsappClients.set(userId, whatsappClient);

      client.on("qr", (qr) => {
        whatsappClient.qrCode = qr;
        socket.emit("whatsapp:qr", qr);
      });

      client.on("ready", () => {
        whatsappClient.isReady = true;
        socket.emit("whatsapp:ready");
      });

      client.on("message", async (message) => {
        this.handleIncomingMessage(userId, message);
      });

      await client.initialize();
    } catch (error) {
      console.error("Erro ao inicializar cliente WhatsApp:", error);
      socket.emit("error", { type: "whatsapp_init", error });
    }
  }

  private async handleWhatsAppSend(socket: Socket, data: { userId: string; content: string }) {
    try {
      const { userId, content } = data;
      const whatsappClient = this.whatsappClients.get(userId);

      if (!whatsappClient || !whatsappClient.isReady) {
        throw new Error("Cliente WhatsApp não está pronto");
      }

      // Adiciona mensagem à fila
      if (!this.messageQueue.has(userId)) {
        this.messageQueue.set(userId, []);
      }
      this.messageQueue.get(userId)!.push({ content, timestamp: Date.now() });

      // Processa a fila se não estiver processando
      if (!this.processingMessages.has(userId)) {
        await this.processMessageQueue(userId);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem pelo WhatsApp:", error);
      socket.emit("error", { type: "whatsapp_send", error });
    }
  }

  private async processMessageQueue(userId: string) {
    const queue = this.messageQueue.get(userId);
    if (!queue || queue.length === 0) return;

    this.processingMessages.add(userId);

    try {
      while (queue.length > 0) {
        const message = queue.shift()!;
        await this.processMessage(userId, message);
      }
    } finally {
      this.processingMessages.delete(userId);
    }
  }

  private async processMessage(userId: string, message: any) {
    try {
      // Verifica se a API da OpenAI está conectada
      if (!openaiService.getStatus().isConnected) {
        throw new Error("API da OpenAI não está conectada");
      }

      // Obtém resposta da OpenAI
      const openaiResponse = await this.getOpenAIResponse(message.content);

      // Envia resposta pelo WhatsApp
      const whatsappClient = this.whatsappClients.get(userId);
      if (whatsappClient && whatsappClient.isReady) {
        await whatsappClient.client.sendMessage(message.to, openaiResponse);
      }

      // Emite evento de sucesso
      this.io.emit("message:processed", {
        userId,
        messageId: message.id,
        status: "completed",
      });
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      this.io.emit("message:processed", {
        userId,
        messageId: message.id,
        status: "failed",
        error,
      });
    }
  }

  private async getOpenAIResponse(content: string): Promise<string> {
    // Aqui você implementaria a lógica de chamada para a API da OpenAI
    // Por enquanto, retornamos uma resposta simulada
    return `Resposta da OpenAI para: ${content}`;
  }

  private handleIncomingMessage(userId: string, message: any) {
    this.io.emit("whatsapp:message", {
      userId,
      message: {
        id: message.id.id,
        content: message.body,
        timestamp: message.timestamp,
        from: message.from,
      },
    });
  }

  private handleWhatsAppStatus(socket: Socket, status: any) {
    console.log("Status do WhatsApp:", status);
    socket.emit("whatsapp:status_update", status);
  }

  private handleDisconnect(socket: Socket) {
    console.log("Cliente desconectado:", socket.id);
    // Limpa recursos associados ao socket
  }
}

export default MessageMiddleware; 