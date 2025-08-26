import App from "./src/App";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router";

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}