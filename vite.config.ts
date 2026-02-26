import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-checkbox',
            'lucide-react',
            'clsx',
            'tailwind-merge'
          ],
          'vendor-motion': ['framer-motion'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers/zod', 'zod'],
          'vendor-xlsx': ['xlsx'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
        },
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    reportCompressedSize: false,
  },
}));
