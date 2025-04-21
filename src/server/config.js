module.exports = {
  port: 3002,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  socket: {
    transports: ['polling', 'websocket'],
    allowEIO3: true
  },
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=800,600',
      '--disable-extensions',
      '--disable-software-rasterizer',
      '--disable-features=site-per-process',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ],
    timeout: 60000
  }
}; 