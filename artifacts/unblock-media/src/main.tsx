import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Dynamically update favicon from API
fetch("/api/settings/favicon", { method: "HEAD" })
  .then((res) => {
    if (res.ok) {
      const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (link) {
        link.href = `/api/settings/favicon?t=${Date.now()}`;
      }
    }
  })
  .catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
