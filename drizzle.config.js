import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.js",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/76e30c2d-19d8-441b-9814-9e96b9f99a45.sqlite",
  },
});
