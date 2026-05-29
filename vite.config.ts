import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "module";

// Load lovable-tagger via createRequire so CI builds work whether or not the
// dependency is present, while local Lovable dev keeps the tagger enabled.
const require = createRequire(import.meta.url);
let componentTagger: (() => unknown) | undefined;
try {
  componentTagger = require("lovable-tagger").componentTagger;
} catch {
  componentTagger = undefined;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
