import { defineConfig } from 'astro/config';
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
//import netlify from '@astrojs/netlify/functions';
import image from "@astrojs/image";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  //adapter: netlify(),
  site: 'https://www.ludegao.com',
  experimental: {
    assets: true
  },
  integrations: [
    preact({ compat: true }), tailwind(), image(),
    vue({ 
      jsx: {
        // treat any tag that starts with ion- as custom elements
        isCustomElement: tag => tag.startsWith('ion-')
      }})],

  markdown: {
    remarkPlugins: ['remark-math'],
    rehypePlugins: [['rehype-katex', {
      // ... other Katex Options
      macros: {
        '\\E': '\\mathbb{E}',
        '\\C': '\\mathbb{C}',
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Q': '\\mathbb{Q}',
        '\\bigO': '\\mathcal{O}',
        '\\abs': '|#1|',
        '\\set': '\\{ #1 \\}',
        '\\indep': "{\\perp\\mkern-9.5mu\\perp}",
        '\\nindep': "{\\not\\!\\perp\\!\\!\\!\\perp}",
        "\\latex": "\\LaTeX",
        "\\katex": "\\KaTeX"
      }
    }]]
  }
});