import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import openaiService from '../services/openaiService.js';
import MessageMiddleware from '../middleware/messageMiddleware.js';

// Configure dotenv
import dotenv from 'dotenv';
dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Environment configuration
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SOCKET_URL = process.env.VITE_SOCKET_URL || 'https://envieii21.onrender.com';

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

// OpenAI API validation endpoint
app.post('/api/openai/validate', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        isValid: false,
        error: 'API key is required'
      });
    }

    // Make a test request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ isValid: true });
  } catch (error) {
    console.error('OpenAI API validation error:', error.response?.data || error.message);
    res.status(401).json({ 
      isValid: false,
      error: 'Invalid API key'
    });
  }
}); 