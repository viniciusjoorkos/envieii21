// Note: In a production application, this would be implemented as a separate backend service
// For simplicity, this is a simplified version to show the flow of operations

require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const httpServer = createServer(app);

// Environment configuration
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SOCKET_URL = process.env.VITE_SOCKET_URL || 'https://envieii21.onrender.com';

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  SOCKET_URL,
  "https://*.vercel.app",
  "https://*.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowedOrigin => 
      allowedOrigin.includes('*') ? 
      origin.match(new RegExp('^' + allowedOrigin.replace('*', '.*') + '$')) :
      origin === allowedOrigin
    )) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400
}));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`, {
    headers: req.headers,
    ip: req.ip,
    query: req.query
  });
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connections: io ? io.engine.clientsCount : 0,
    serverTime: new Date().toISOString()
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    serverTime: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: NODE_ENV,
    message: 'Socket.IO server is running',
    timestamp: new Date().toISOString(),
    connections: io ? io.engine.clientsCount : 0,
    serverTime: new Date().toISOString(),
    endpoints: {
      health: '/health',
      test: '/test',
      socket: '/socket.io'
    }
  });
});

// OpenAI Service initialization
const openaiService = require('../services/openaiService');
openaiService.initialize();

// Message Middleware initialization
const MessageMiddleware = require('../middleware/messageMiddleware');
const messageMiddleware = new MessageMiddleware();

// OpenAI status route
app.get('/api/openai/status', (req, res) => {
  res.json(openaiService.getStatus());
});

// OpenAI validation route
app.post('/api/openai/validate', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key é obrigatória' });
    }

    const isValid = await openaiService.validateApiKey(apiKey);
    res.json({ isValid });
  } catch (error) {
    console.error('Erro ao validar chave da OpenAI:', error);
    res.status(500).json({ error: 'Erro ao validar chave da API' });
  }
});

// EDCRED Chat API route
app.post('/api/edcred-chat', async (req, res) => {
  console.log('EDCRED Chat Request received:', {
    headers: req.headers,
    body: {
      ...req.body,
      messages: req.body.messages?.length || 0,
      assistant_id: req.body.assistant_id
    }
  });

  try {
    const { messages, model, stream, tools, tool_choice, temperature, max_tokens, top_p, frequency_penalty, presence_penalty, logit_bias, user, assistant_id } = req.body;
    
    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid messages format:', messages);
      return res.status(400).json({ error: 'Messages array is required and must not be empty' });
    }

    if (!assistant_id) {
      console.error('Missing assistant_id');
      return res.status(400).json({ error: 'assistant_id is required' });
    }

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('Creating thread with OpenAI...');
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.json();
      console.error('OpenAI Thread Creation Error:', errorData);
      return res.status(threadResponse.status).json({ error: 'Failed to create thread', details: errorData });
    }

    const thread = await threadResponse.json();
    console.log('Thread created:', thread.id);

    // Add messages to thread
    console.log('Adding messages to thread...');
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content: messages[messages.length - 1].content
      })
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error('OpenAI Message Creation Error:', errorData);
      return res.status(messageResponse.status).json({ error: 'Failed to add message', details: errorData });
    }

    console.log('Message added successfully');

    // Run assistant
    console.log('Running assistant...');
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: assistant_id
      })
    });

    if (!runResponse.ok) {
      const errorData = await runResponse.json();
      console.error('OpenAI Run Creation Error:', errorData);
      return res.status(runResponse.status).json({ error: 'Failed to run assistant', details: errorData });
    }

    const run = await runResponse.json();
    console.log('Run created:', run.id);

    // Poll for completion
    let runStatus = run.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      console.log('Checking run status:', runStatus);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        console.error('OpenAI Run Status Error:', errorData);
        return res.status(statusResponse.status).json({ error: 'Failed to check run status', details: errorData });
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      console.log('Current run status:', runStatus);
    }

    if (runStatus !== 'completed') {
      console.error('Run failed with status:', runStatus);
      return res.status(500).json({ error: 'Assistant run failed', status: runStatus });
    }

    // Get messages
    console.log('Retrieving messages...');
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      console.error('OpenAI Messages Retrieval Error:', errorData);
      return res.status(messagesResponse.status).json({ error: 'Failed to retrieve messages', details: errorData });
    }

    const messagesData = await messagesResponse.json();
    console.log('Messages retrieved successfully');

    // Return the last assistant message
    const assistantMessage = messagesData.data.find(m => m.role === 'assistant');
    if (!assistantMessage) {
      console.error('No assistant message found');
      return res.status(500).json({ error: 'No assistant response found' });
    }

    res.json({
      choices: [{
        message: {
          content: assistantMessage.content[0].text.value
        }
      }]
    });

  } catch (error) {
    console.error('Unhandled error in EDCRED chat:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: error.stack
    });
  }
});

// Catch-all route for client-side routing
app.get(/^(?!\/socket\.io\/).*$/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Server error:`, err);
  res.status(500).json({ 
    error: 'Internal server error',
    environment: NODE_ENV,
    timestamp,
    message: err.message || err
  });
});

// Socket.IO configuration
const io = new Server(httpServer, {
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(allowedOrigin => 
        allowedOrigin.includes('*') ? 
        origin.match(new RegExp('^' + allowedOrigin.replace('*', '.*') + '$')) :
        origin === allowedOrigin
      )) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io/',
  allowUpgrades: true,
  perMessageDeflate: true,
  maxHttpBufferSize: 1e8,
  connectTimeout: 45000,
  cookie: {
    name: 'io',
    path: '/',
    httpOnly: true,
    sameSite: 'lax'
  }
});

// Adicionando tratamento de erros de conexão
io.engine.on("connection_error", (err) => {
  console.error("Connection error:", {
    req: err.req,
    code: err.code,
    message: err.message,
    context: err.context
  });
});

// Authentication middleware
io.use((socket, next) => {
  const handshake = socket.handshake;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] Connection attempt:`, {
    id: socket.id,
    transport: socket.conn.transport.name,
    query: handshake.query,
    headers: handshake.headers,
    address: handshake.address,
    secure: handshake.secure,
    url: handshake.url
  });

  // Validate authentication
  const auth = handshake.auth;
  if (!auth || !auth.token) {
    console.error(`[${timestamp}] Authentication failed: No token provided`);
    return next(new Error('Authentication failed: No token provided'));
  }

  try {
    // Validate token (implement your token validation logic here)
    const token = auth.token;
    // Add your token validation logic
    // For example: jwt.verify(token, process.env.JWT_SECRET)
    
    // If token is valid, attach user data to socket
    socket.user = {
      id: token, // or decoded token data
      authenticated: true
    };
    
    next();
  } catch (error) {
    console.error(`[${timestamp}] Authentication failed:`, error);
    return next(new Error('Authentication failed: Invalid token'));
  }
});

// Enhanced connection handling
io.on('connection', (socket) => {
  const timestamp = new Date().toISOString();
  const handshake = socket.handshake;
  
  console.log(`[${timestamp}] Client connected successfully:`, {
    id: socket.id,
    transport: socket.conn.transport.name,
    remoteAddress: handshake.address,
    headers: handshake.headers,
    query: handshake.query,
    url: handshake.url,
    secure: handshake.secure
  });

  // Monitor transport events
  socket.conn.on('packet', (packet) => {
    console.log(`[${timestamp}] Packet received:`, {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      packetType: packet.type,
      packetData: packet.data
    });
  });

  socket.conn.on('packetCreate', (packet) => {
    console.log(`[${timestamp}] Packet created:`, {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      packetType: packet.type,
      packetData: packet.data
    });
  });

  // Handle transport upgrade
  socket.conn.on('upgrade', (transport) => {
    console.log(`[${timestamp}] Transport upgrade attempt:`, {
      socketId: socket.id,
      from: socket.conn.transport.name,
      to: transport.name
    });
  });

  socket.conn.on('upgradeError', (error) => {
    console.error(`[${timestamp}] Transport upgrade error:`, {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      error: error.message || error,
      stack: error.stack
    });
  });

  // Handle transport error
  socket.conn.on('error', (error) => {
    console.error(`[${timestamp}] Transport error:`, {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      error: error.message || error,
      stack: error.stack
    });
  });

  // Handle transport close
  socket.conn.on('close', (reason) => {
    console.log(`[${timestamp}] Transport closed:`, {
      socketId: socket.id,
      transport: socket.conn.transport.name,
      reason
    });
  });

  // Send initial connection status
  socket.emit('connection_status', {
    status: 'connected',
    socketId: socket.id,
    transport: socket.conn.transport.name,
    timestamp
  });

  // Token registration
  socket.on('register_token', (data) => {
    console.log(`[${timestamp}] Token registration attempt:`, {
      socketId: socket.id,
      token: data.token,
      transport: socket.conn.transport.name,
      transportState: socket.conn.transport.state
    });
    
    if (!data.token) {
      console.error(`[${timestamp}] Invalid token registration: no token provided`);
      socket.emit('register_token', { 
        success: false,
        error: 'No token provided',
        timestamp
      });
      return;
    }
    
    socket.token = data.token;
    socket.emit('register_token', { 
      success: true,
      timestamp,
      transport: socket.conn.transport.name
    });
  });

  // WhatsApp initialization
  socket.on('whatsapp:init', (data) => {
    console.log(`[${timestamp}] WhatsApp initialization:`, {
      socketId: socket.id,
      token: data.envieiiToken,
      transport: socket.conn.transport.name
    });
    
    // Mock QR code generation for testing
    setTimeout(() => {
      socket.emit('qr', 'mock_qr_code_data');
    }, 1000);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`[${timestamp}] Socket error:`, {
      error: error.message || error,
      socketId: socket.id,
      transport: socket.conn.transport.name
    });
    
    socket.emit('error_status', {
      error: error.message || error,
      timestamp,
      transport: socket.conn.transport.name
    });
  });

  // Disconnection handling
  socket.on('disconnect', (reason) => {
    console.log(`[${timestamp}] Client disconnected:`, {
      reason,
      socketId: socket.id,
      transport: socket.conn.transport.name
    });
  });
});

// Start server
httpServer.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`[${timestamp}] Health check available at http://localhost:${PORT}/health`);
  console.log(`[${timestamp}] Socket.IO URL: ${SOCKET_URL}`);
});

// Clean up inactive sessions every hour
setInterval(() => {
  messageMiddleware.emit('cleanup');
}, 3600000);

// Global error handling
process.on('uncaughtException', (err) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Uncaught Exception:`, err);
});

process.on('unhandledRejection', (reason, promise) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Unhandled Rejection:`, { reason, promise });
});
