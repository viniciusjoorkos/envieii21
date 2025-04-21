import express from "express";
import { createServer } from "http";
import cors from "cors";
import MessageMiddleware from "./middleware/messageMiddleware";
import openaiService from "./services/openaiService";

const app = express();
const httpServer = createServer(app);

// Configuração do CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// Inicializa serviços
openaiService.initialize();

// Inicializa middleware de mensagens
const messageMiddleware = new MessageMiddleware();

// Rota de health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    serverTime: new Date().toISOString()
  });
});

// Rota para status da OpenAI
app.get("/api/openai/status", (req, res) => {
  res.json(openaiService.getStatus());
});

// Rota para validar chave da OpenAI
app.post("/api/openai/validate", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "API key é obrigatória" });
    }

    const isValid = await openaiService.validateApiKey(apiKey);
    res.json({ isValid });
  } catch (error) {
    console.error("Erro ao validar chave da OpenAI:", error);
    res.status(500).json({ error: "Erro ao validar chave da API" });
  }
});

// Inicia servidor
const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Limpa sessões inativas a cada hora
setInterval(() => {
  messageMiddleware.emit("cleanup");
}, 3600000); 