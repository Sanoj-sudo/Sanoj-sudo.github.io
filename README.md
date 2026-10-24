# 3D DevOps Portfolio

An interactive, scroll-driven 3D portfolio built with [three.js](https://threejs.org) and [Vite](https://vite.dev).
The camera flies through an "infrastructure world" as you scroll:

| Section    | 3D scene                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| Hero/About | Kubernetes-style cluster — racks with blinking LEDs, packets on cables   |
| AI × DevOps | Neural network firing signals, with Claude / Gemini / Databricks orbiting |
| Skills     | Your toolchain orbiting a glowing core (one ring per category)           |
| Experience | Vertical CI/CD pipeline — builds light up each stage as they pass        |
| Projects   | Globe with cloud regions and traffic arcs                                |
| Contact    | Globe horizon beneath a terminal-style contact card                      |

Hover racks, pipeline stages, skill nodes and regions for tooltips.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the build
```

## Make it yours

- **All content** lives in [`src/data.js`](src/data.js): name, tagline, stats, skills, experience, projects, links.
  The skills orbits are generated from that data automatically.
- **Résumé:** put your PDF at `public/resume.pdf`.
- **Camera angles** per section: `KEYFRAMES` in [`src/main.js`](src/main.js).
- **Pipeline stage tooltips:** `STAGES` in [`src/scene/pipeline.js`](src/scene/pipeline.js).
- **Colors:** CSS variables in [`src/style.css`](src/style.css) and `COLORS` in [`src/scene/utils.js`](src/scene/utils.js).

## Deploy

`npm run build` produces a static `dist/` folder (relative paths, so it works under any sub-path):

- **GitHub Pages / Netlify / Vercel / Cloudflare Pages:** build command `npm run build`, output dir `dist`.
- **S3 + CloudFront:** `aws s3 sync dist/ s3://your-bucket --delete` then invalidate the distribution.

## Structure

```
src/
  data.js            ← your content
  main.js            renderer, scroll→camera, hover tooltips, bloom
  ui.js              renders the HTML overlay from data.js
  style.css
  scene/
    cluster.js       k8s cluster
    ai.js            neural network + AI platforms
    skills.js        orbiting skills
    pipeline.js      CI/CD pipeline
    globe.js         multi-region globe
    utils.js         labels, packet flows, starfield
```

Falls back to a readable plain page if WebGL is unavailable, and slows animations for `prefers-reduced-motion`.
