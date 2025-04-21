import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { preloadWhatsApp } from "./scripts/preloadWhatsApp";

// Pré-carrega o WhatsApp antes de renderizar a aplicação
preloadWhatsApp()
  .catch(error => {
    console.error("Error preloading WhatsApp:", error);
  })
  .finally(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
