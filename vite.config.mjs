import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = process.env.PROJECT_ROOT || __dirname;

// Dynamically import GitHub Spark plugins (ESM-only)
const sparkPlugin = (await import("@github/spark/spark-vite-plugin")).default;
const createIconImportProxy = (await import("@github/spark/vitePhosphorIconProxyPlugin")).default;

// https://vite.dev/config/
export default defineConfig({
  base: './',
  publicDir: 'public',
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy(),
    sparkPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
