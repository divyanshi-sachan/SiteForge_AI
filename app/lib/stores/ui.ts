import { atom } from 'nanostores';

/**
 * Lightweight UI-only state shared between the header and the project
 * sidebar (kept separate from workbenchStore since it's not related to the
 * generated project itself).
 */
export const projectSidebarOpen = atom(false);

export type MobileTab = 'ai' | 'preview' | 'code';
export const mobileActiveTab = atom<MobileTab>('ai');
