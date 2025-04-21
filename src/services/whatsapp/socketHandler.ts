import { io, Socket } from 'socket.io-client';
import { toast } from "@/hooks/use-toast";

// Definindo a interface para o erro de conexão
interface SocketError extends Error {
  description?: string;
  context?: any;
}

let socket: Socket | null = null;
let isInitialized = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeSocket = () => {
  if (isInitialized) {
    console.log('Socket already initialized');
    return;
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://envieii21.onrender.com';
  console.log('Initializing socket connection to:', SOCKET_URL);

  try {
    // Obter o token do localStorage
    const token = localStorage.getItem('envieiiToken') || 'envieii_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('envieiiToken', token);

    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 60000,
      autoConnect: true,
      forceNew: true,
      path: '/socket.io/',
      withCredentials: true,
      auth: {
        token: token
      },
      query: {
        timestamp: Date.now(),
        clientType: 'web'
      },
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully:', {
        id: socket?.id,
        transport: socket?.io.engine.transport.name,
        timestamp: new Date().toISOString()
      });
      reconnectAttempts = 0;
    });

    socket.on('connect_error', (error: SocketError) => {
      console.error('Socket connection error:', {
        error: error.message,
        description: error.description,
        context: error.context,
        transport: socket?.io.engine.transport.name,
        timestamp: new Date().toISOString()
      });

      reconnectAttempts++;

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível estabelecer conexão com o servidor após várias tentativas",
          variant: "destructive"
        });
        return;
      }

      setTimeout(() => {
        if (!socket?.connected) {
          console.log('Attempting to reconnect...');
          socket?.connect();
        }
      }, 1000 * reconnectAttempts);
    });

    socket.on('disconnect', (reason: string) => {
      console.warn('Desconectado por:', reason);
      if (reason === 'io server disconnect') {
        console.log('Server initiated disconnect, attempting to reconnect...');
        socket?.connect();
      }
    });

    socket.on('error', (error: unknown) => {
      if (error instanceof Error) {
        console.error('Erro no socket:', error.message);
      } else {
        console.error('Erro desconhecido no socket:', error);
      }
    });

    socket.on('qr', (qrCode: string) => {
      console.log('QR Code recebido:', qrCode);
      // Assuming this.qrCode is a property of the class
      // this.qrCode = qrCode;
    });

    setupSocketListeners();
    setupHeartbeat();
    isInitialized = true;
    socket.connect();

  } catch (error) {
    console.error('Failed to initialize socket:', error);
    handleInitializationError(error);
  }
};

const setupSocketListeners = () => {
  if (!socket) return;

  socket.on('connect', () => {
    console.log('Socket connected successfully:', {
      id: socket?.id,
      transport: socket?.io.engine.transport.name,
      timestamp: new Date().toISOString()
    });
    reconnectAttempts = 0;
  });

  socket.on('connect_error', (error: SocketError) => {
    console.error('Socket connection error:', {
      error: error.message,
      transport: socket?.io.engine.transport.name,
      timestamp: new Date().toISOString()
    });

    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível estabelecer conexão com o servidor após várias tentativas",
        variant: "destructive"
      });
      return;
    }

    setTimeout(() => {
      if (!socket?.connected) {
        console.log('Attempting to reconnect...');
        socket?.connect();
      }
    }, 1000 * reconnectAttempts);
  });

  socket.on('disconnect', (reason: string) => {
    console.warn('Desconectado por:', reason);
    if (reason === 'io server disconnect') {
      console.log('Server initiated disconnect, attempting to reconnect...');
      socket?.connect();
    }
  });

  socket.on('error', (error: unknown) => {
    if (error instanceof Error) {
      console.error('Erro no socket:', error.message);
    } else {
      console.error('Erro desconhecido no socket:', error);
    }
  });
};

const setupHeartbeat = () => {
  if (!socket) return;

  // Envia heartbeat a cada 20 segundos
  const heartbeatInterval = setInterval(() => {
    if (socket?.connected) {
      socket.emit('heartbeat', { timestamp: Date.now() });
    }
  }, 20000);

  // Limpa o intervalo quando o socket desconecta
  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
  });
};

const handleInitializationError = (error: any) => {
  console.error('Socket initialization error:', error);
  
  // Notifica o usuário
  toast({
    title: "Erro de Inicialização",
    description: "Não foi possível inicializar a conexão com o servidor. Tentando novamente...",
    variant: "destructive"
  });

  // Tenta reinicializar após um delay
  setTimeout(() => {
    if (!socket?.connected) {
      initializeSocket();
    }
  }, 5000);
};

export const registerSocketEventHandlers = (
  onQRCodeReceived: (qrCode: string) => void,
  onStatusChange: (status: string) => void,
  onMessageReceived: (message: { from: string; body: string }) => void
) => {
  if (!socket) {
    initializeSocket();
  }

  socket?.on('qr', (qrCode: string) => {
    console.log('QR Code received');
    onQRCodeReceived(qrCode);
  });

  socket?.on('status', (status: string) => {
    console.log('Status changed:', status);
    onStatusChange(status);
  });

  socket?.on('message', (message: { from: string; body: string }) => {
    console.log('Message received:', message);
    onMessageReceived(message);
  });
};

export const socketConnect = async (token: string) => {
  if (!socket) {
    initializeSocket();
  }

  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'));
      return;
    }

    socket.emit('register_token', { token }, (response: any) => {
      if (response?.success) {
        resolve(response);
      } else {
        reject(new Error('Failed to register token'));
      }
    });
  });
};

export const socketDisconnect = async () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitialized = false;
  }
};

export const socketGenerateQrCode = async (token: string) => {
  if (!socket) {
    initializeSocket();
  }

  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'));
      return;
    }

    socket.emit('whatsapp:init', { envieiiToken: token }, (response: any) => {
      if (response?.success) {
        resolve(response);
      } else {
        reject(new Error('Failed to generate QR code'));
      }
    });
  });
};

export const socketSendMessage = async (message: string) => {
  if (!socket) {
    initializeSocket();
  }

  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'));
      return;
    }

    socket.emit('send-message', { message }, (response: any) => {
      if (response?.success) {
        resolve(response);
      } else {
        reject(new Error('Failed to send message'));
      }
    });
  });
};

export const registerOpenAIKey = async (envieiiToken: string, openaiKey: string) => {
  if (!socket) {
    initializeSocket();
  }

  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'));
      return;
    }

    socket.emit('register-openai-key', { envieiiToken, openaiKey }, (response: any) => {
      if (response?.success) {
        resolve(response);
      } else {
        reject(new Error('Failed to register OpenAI key'));
      }
    });
  });
};
