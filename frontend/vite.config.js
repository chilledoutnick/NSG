import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load environment variables from frontend directory and parent directory if needed
  const env = loadEnv(mode, process.cwd(), "");

  // Expose process.env.REACT_APP_* to ensure zero frontend code changes
  const processEnv = {};
  for (const key of Object.keys(env)) {
    if (key.startsWith("REACT_APP_") || key === "NODE_ENV" || key === "PORT") {
      processEnv[`process.env.${key}`] = JSON.stringify(env[key]);
    }
  }
  processEnv["process.env.NODE_ENV"] = JSON.stringify(mode);

  return {
    plugins: [react()],
    define: processEnv,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    server: {
      port: 3000,
      open: false,
      host: true,
    },
    build: {
      outDir: "build",
      emptyOutDir: true,
      chunkSizeWarningLimit: 1600,
    },
  };
});

