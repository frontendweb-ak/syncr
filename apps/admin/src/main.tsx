import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Get the root DOM element where the React application will be mounted.
const el = document.getElementById("root") as HTMLElement;

// Create the React root for rendering the application.
const app = createRoot(el);

// Render the application with all global providers and StrictMode enabled.
app.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
