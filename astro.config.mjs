import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  site: "https://hup-web.vercel.app/",
  output: "server",
  adapter: vercel(),
  trailingSlash: "ignore",
});
