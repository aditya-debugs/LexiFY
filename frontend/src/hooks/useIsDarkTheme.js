import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

/**
 * Hook to detect if the current theme is dark or light
 * Useful for edge cases where you need to adjust colors programmatically
 * 
 * @returns {boolean} true if current theme is dark, false if light
 */
const useIsDarkTheme = () => {
  const { theme } = useThemeStore();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // List of known dark themes in DaisyUI
    const darkThemes = [
      'dark',
      'forest',
      'black',
      'luxury',
      'business',
      'night',
      'coffee',
      'dim',
      'sunset',
      'dracula',
      'synthwave',
      'halloween',
      'aqua'
    ];

    // Check if current theme is in the dark themes list
    const isCurrentThemeDark = darkThemes.includes(theme);
    
    // Alternative: Check computed background color of base-100
    // This works even for custom themes
    const checkBackgroundLuminance = () => {
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--b1')
        .trim();
      
      if (bgColor) {
        // Parse HSL values
        const hslMatch = bgColor.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
        if (hslMatch) {
          const lightness = parseFloat(hslMatch[3]);
          // If lightness < 50%, it's a dark theme
          return lightness < 50;
        }
      }
      return false;
    };

    // Combine both methods for accuracy
    const isDarkTheme = isCurrentThemeDark || checkBackgroundLuminance();
    setIsDark(isDarkTheme);
  }, [theme]);

  return isDark;
};

export default useIsDarkTheme;
