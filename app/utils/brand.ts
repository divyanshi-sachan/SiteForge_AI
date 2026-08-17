/**
 * Central brand configuration.
 *
 * This is the single place that defines the product's name, tagline, and
 * copy used across the UI. To white-label this app for a different client,
 * change the values here — avoid hardcoding brand strings elsewhere.
 */
export const BRAND = {
  name: 'SiteForge AI',
  shortName: 'SiteForge',
  tagline: 'Build websites with AI',
  description: 'Describe your website and AI will design and build it for you.',
} as const;

export const EXAMPLE_PROMPT_CHIPS = [
  {
    label: 'Restaurant Website',
    prompt: 'Create a modern restaurant website with a menu, gallery, reservations and location.',
  },
  {
    label: 'SaaS Landing Page',
    prompt: 'Create a clean SaaS landing page with a hero, features, pricing and a signup CTA.',
  },
  {
    label: 'Dental Clinic',
    prompt:
      'Create a modern landing page for a dental clinic with services, doctors, testimonials and an appointment CTA.',
  },
  { label: 'Portfolio', prompt: 'Create a minimal portfolio website with projects, about section and contact form.' },
  {
    label: 'Ecommerce Landing Page',
    prompt:
      'Create an ecommerce landing page for a fashion brand with featured products, categories and a newsletter signup.',
  },
  {
    label: 'Real Estate Agency',
    prompt:
      'Create a real estate agency website with property listings, search filters, agent profiles and contact CTA.',
  },
] as const;

export const NEW_PROJECT_PLACEHOLDER =
  'Create a modern landing page for a dental clinic with services, doctors, testimonials and an appointment CTA...';

export const REFINE_PLACEHOLDER = 'Ask AI to change anything...';
