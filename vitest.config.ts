import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Repos memakai `import "server-only"` — di lingkungan tes kita stub kosong.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    env: { TIFKREATIF_TEST: "1" },
    include: ["tests/**/*.test.ts"],
  },
});
