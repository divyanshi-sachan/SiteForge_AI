# SiteForge AI

SiteForge AI is an AI-powered website generator: describe the site you want in plain language and it designs, builds,
and runs a real, live-previewable website for you — right in the browser, no local setup required. You can keep
chatting with the AI to refine the design, inspect the generated source in Code mode, and download the project as a
zip.

This app is built on an in-browser development runtime (WebContainers) so the generated project actually installs
dependencies and runs a dev server client-side, with the AI able to create/edit files and run shell commands as part
of fulfilling your request.

## Branding

All product naming lives in one place: [`app/utils/brand.ts`](./app/utils/brand.ts). Update the `BRAND` object there
to relabel the product (name, tagline, example prompts) — the rest of the UI reads from it.

## Tips

- **Be specific**: mention the type of business, pages, and style you want and the AI will scaffold accordingly.
- **Use the enhance prompt icon**: before sending your prompt, click "Enhance prompt" to let the AI refine your
  request before you submit it.
- **Iterate**: once your site is generated, keep describing changes ("make the hero more premium", "add an FAQ
  section") — the AI updates the live preview in place.
