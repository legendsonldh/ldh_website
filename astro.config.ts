import { defineConfig, squooshImageService  } from 'astro/config';
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
//import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
  //adapter: netlify(),
  image: {
    service: squooshImageService(),
  },
  site: 'https://www.ludegao.com',
  integrations: [
    preact({ compat: true }), tailwind()],

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