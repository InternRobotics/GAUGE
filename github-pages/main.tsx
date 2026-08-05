import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GaugeDemo } from "../app/GaugeDemo";
import "katex/dist/katex.min.css";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GaugeDemo />
  </StrictMode>,
);
