/**
 * Font configuration with build-time fallback support
 * 
 * This module safely loads Google Fonts and falls back to system fonts
 * if the fonts cannot be loaded (e.g., in CI environments without internet).
 */

// Check if we should skip Google Fonts loading
const shouldSkipFonts = process.env.BUILD_FOR_STATIC === 'true';

// Type for font configuration
interface FontConfig {
  variable: string;
  className?: string;
}

let inter: FontConfig;
let spaceMono: FontConfig;

if (shouldSkipFonts) {
  // Use fallback configuration without Google Fonts
  inter = {
    variable: '--font-inter',
    className: '',
  };
  spaceMono = {
    variable: '--font-space-mono',
    className: '',
  };
} else {
  // Load Google Fonts normally for Vercel deployment
  try {
    const { Inter, Space_Mono } = require('next/font/google');

    inter = Inter({
      subsets: ['latin'],
      variable: '--font-inter',
      display: 'swap',
      fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    });

    spaceMono = Space_Mono({
      weight: ['400', '700'],
      subsets: ['latin'],
      variable: '--font-space-mono',
      display: 'swap',
      fallback: ['Courier New', 'Courier', 'monospace'],
    });
  } catch (error) {
    // Fallback if font loading fails
    console.warn('Failed to load Google Fonts, using system fonts');
    inter = {
      variable: '--font-inter',
      className: '',
    };
    spaceMono = {
      variable: '--font-space-mono',
      className: '',
    };
  }
}

export { inter, spaceMono };
