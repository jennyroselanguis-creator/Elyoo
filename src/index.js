import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  initSupabaseConnection,
  verifySupabaseConnection,
  setConnectionHealth,
} from "./lib/supabase";
import "./index.css";
import "./styles/forms.css";
import "./styles/inputs.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

async function bootstrap() {
  const status = await initSupabaseConnection();
  let verified = false;
  let verifyError = null;

  if (status.connected) {
    const check = await verifySupabaseConnection();
    verified = check.ok;
    verifyError = check.error;
    setConnectionHealth({
      configured: true,
      verified: check.ok,
      error: check.error,
      source: status.source,
    });
    if (!verified) {
      console.warn('[Supabase] Config found but connection failed:', check.error);
    } else {
      console.info('[Supabase] Connected via', status.source);
    }
  } else {
    setConnectionHealth({
      configured: false,
      verified: false,
      error: 'No Supabase URL/key in .env or supabase.connection.json',
      source: null,
    });
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App supabaseBoot={{ ...status, verified, verifyError }} />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

bootstrap();
