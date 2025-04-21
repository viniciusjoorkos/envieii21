import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "0.0.0.0",
      port: 3000,
      proxy: {
        '/socket.io': {
          target: 'http://localhost:3002',
          ws: true,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
          }
        },
        '/api': {
          target: process.env.BACKEND_URL || 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
        }
      },
    },
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Expose env to the client
      'import.meta.env': {
        ...env,
        VITE_SOCKET_URL: env.VITE_SOCKET_URL,
        VITE_ENABLE_WEBSOCKET: env.VITE_ENABLE_WEBSOCKET === 'true',
        VITE_ENABLE_POLLING: env.VITE_ENABLE_POLLING === 'true',
        VITE_ENABLE_COMPRESSION: env.VITE_ENABLE_COMPRESSION === 'true',
      },
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL)
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
