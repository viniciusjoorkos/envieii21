import whatsappService from "@/services/whatsappService";

// Pré-carrega o serviço do WhatsApp
export function preloadWhatsApp() {
  // Inicializa o socket imediatamente
  whatsappService.init("preload");
  
  // Retorna uma promessa que resolve imediatamente
  return Promise.resolve();
} 