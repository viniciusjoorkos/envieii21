// Environment configuration
const config = {
  // Socket.IO server URL
  socketUrl: import.meta.env.VITE_SOCKET_URL || 
    (import.meta.env.PROD 
      ? 'https://fog-sedate-arthropod.glitch.me/' 
      : 'https://fog-sedate-arthropod.glitch.me/'),
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Feature flags
  features: {
    enableWebSocket: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true',
    enablePolling: import.meta.env.VITE_ENABLE_POLLING === 'true',
    enableCompression: import.meta.env.VITE_ENABLE_COMPRESSION === 'true'
  }
};

export default config; 