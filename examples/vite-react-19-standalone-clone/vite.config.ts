import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["6459-2a01-14-8063-d2d0-2105-23bf-3646-9cb9.ngrok-free.app"],
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "localhost+1-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "localhost+1.pem")),
    },
    host: "0.0.0.0",
  },
  plugins: [react()],
});
