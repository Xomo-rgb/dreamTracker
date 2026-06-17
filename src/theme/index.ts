// Main theme export - uses professional theme as default
export { gamifiedTheme } from './gamified';
export { professionalTheme, professionalTheme as theme } from './professional';

// Re-export type
export type Theme = typeof professionalTheme;

import { professionalTheme } from './professional';
export default professionalTheme;