// Importa React
import React from "react";

// Importa ReactDOM para renderizar la app en el navegador
import ReactDOM from "react-dom/client";

// Clase de MSAL para manejar autenticación con Microsoft Entra
import { PublicClientApplication } from "@azure/msal-browser";

// Provider que permite usar MSAL en toda la app React
import { MsalProvider } from "@azure/msal-react";

// Componente principal de la aplicación
import App from "./App";

// Configuración de autenticación MSAL
import { msalConfig } from "./config/authConfig";

// Estilos globales
import "./index.css";

// Inicializa configuración de internacionalización (i18n)
import "./i18n";

// Crea instancia de autenticación MSAL usando la configuración
const msalInstance = new PublicClientApplication(msalConfig);

// Renderiza la aplicación React dentro del elemento HTML con id "root"
ReactDOM.createRoot(document.getElementById("root")!).render(

  <React.StrictMode> {/* Modo estricto de React para detectar problemas */}

    {/* Provee autenticación MSAL a todos los componentes */}
    <MsalProvider instance={msalInstance}>

      {/* Componente principal de la app */}
      <App />

    </MsalProvider>

  </React.StrictMode>
);