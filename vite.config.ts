import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const gameID = JSON.stringify(process.env.VITE_PLAYROOM_GAME_ID);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.VITE_PLAYROOM_GAME_ID": gameID,
  },
});
