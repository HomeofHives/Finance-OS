// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
   integrations: [
      starlight({
         title: "Finance-OS Docs",
         sidebar: [
            {
               label: "Getting Started",
               items: [{ label: "Overview", slug: "index" }],
            },
         ],
      }),
   ],
});
