import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
