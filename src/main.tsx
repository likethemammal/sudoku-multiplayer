import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { insertCoin } from "playroomkit";

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

async function init() {
  await insertCoin({
    discord: true,
    gameId: process.env.VITE_PLAYROOM_GAME_ID,
  });

  renderApp();
}

init();
