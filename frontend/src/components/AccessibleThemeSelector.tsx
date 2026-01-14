/**
 * AccessibleThemeSelector Component
 * 
 * A theme selector that ensures WCAG AA contrast compliance (4.5:1 for normal text).
 * Automatically adjusts text/background colors to meet accessibility standards.
 * 
 * USAGE:
 * ```tsx
 * import AccessibleThemeSelector from './components/AccessibleThemeSelector';
 * 
 * const themes = [
 *   { id: 'light', name: 'Light', primaryColor: '#3b82f6', backgroundColor: '#ffffff', accentColor: '#10b981', textColor: '#000000' },
 *   { id: 'dark', name: 'Dark', primaryColor: '#60a5fa', backgroundColor: '#1f2937', accentColor: '#34d399', textColor: '#ffffff' },
 * ];
 * 
 * function App() {
 *   const handleApplyTheme = (theme) => {
 *     // Apply theme to your global state/context
 *     document.documentElement.style.setProperty('--primary', theme.primaryColor);
 *     document.documentElement.style.setProperty('--bg', theme.backgroundColor);
 *     // ... etc
 *   };
 * 
 *   return <AccessibleThemeSelector themes={themes} onApply={handleApplyTheme} />;
 * }
 * ```
 * 
 * INTEGRATION:
 * - Store themes in your state management (Redux/Context)
 * - Apply returned theme colors to CSS variables or DaisyUI theme
 * - Component persists selection to localStorage as 'lexify_theme'
 * - On app load, retrieve from localStorage and reapply
 */

import React, { useState, useEffect, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;    // hex color #RRGGBB
  backgroundColor: string;  // hex color #RRGGBB
  accentColor: string;      // hex color #RRGGBB
  textColor: string;        // hex color #RRGGBB
}

export interface AccessibilityReport {
  isAccessible: boolean;
  originalContrastRatio: number;
  adjustedContrastRatio?: number;
  adjustedTextColor?: string;
  adjustedBackgroundColor?: string;
  adjustmentsMade: string[];
  warnings: string[];
}

export interface ThemeWithAccessibility extends ThemeConfig {
  accessibilityReport: AccessibilityReport;
}

interface AccessibleThemeSelectorProps {
  themes: ThemeConfig[];
  onApply: (theme: ThemeWithAccessibility) => void;
  defaultThemeId?: string;
}

// ============================================================================
// HELPER FUNCTIONS - Color Conversion & Contrast Calculation
// ============================================================================

/**
 * Convert hex color to RGB object
 * @param hex - 6-digit hex color string (with or without #)
 * @returns RGB object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  
  if (cleanHex.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}. Expected 6-digit hex.`);
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Convert RGB to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns 6-digit hex color string with #
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculate relative luminance according to WCAG
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @param hex - 6-digit hex color
 * @returns Relative luminance value (0-1)
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  
  // Convert to 0-1 range
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const linearize = (val: number) => {
    return val <= 0.03928 
      ? val / 12.92 
      : Math.pow((val + 0.055) / 1.055, 2.4);
  };

  const rLinear = linearize(rsRGB);
  const gLinear = linearize(gsRGB);
  const bLinear = linearize(bsRGB);

  // Calculate luminance with WCAG coefficients
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors according to WCAG
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * @param hex1 - First color (hex)
 * @param hex2 - Second color (hex)
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjust a color towards a target color by a percentage
 * @param hex - Source color
 * @param target - Target color (usually #000000 or #ffffff)
 * @param amountPercent - Amount to adjust (0-100)
 * @returns Adjusted hex color
 */
export function adjustColorTowards(
  hex: string, 
  target: string, 
  amountPercent: number
): string {
  const source = hexToRgb(hex);
  const targetRgb = hexToRgb(target);
  const amount = amountPercent / 100;

  const r = source.r + (targetRgb.r - source.r) * amount;
  const g = source.g + (targetRgb.g - source.g) * amount;
  const b = source.b + (targetRgb.b - source.b) * amount;

  return rgbToHex(r, g, b);
}

/**
 * Find an accessible text color for a given background
 * Attempts to adjust the original text color to meet WCAG AA (4.5:1)
 * @param bgHex - Background color
 * @param textHex - Original text color
 * @param targetRatio - Target contrast ratio (default 4.5 for WCAG AA)
 * @returns Object with accessible color and whether adjustment was needed
 */
export function findAccessibleTextColor(
  bgHex: string,
  textHex: string,
  targetRatio: number = 4.5
): { color: string; adjusted: boolean; ratio: number } {
  const originalRatio = contrastRatio(bgHex, textHex);

  // Already accessible
  if (originalRatio >= targetRatio) {
    return { color: textHex, adjusted: false, ratio: originalRatio };
  }

  // Determine if we should go darker or lighter
  const bgLuminance = getRelativeLuminance(bgHex);
  const targetColor = bgLuminance > 0.5 ? '#000000' : '#ffffff';

  // Try adjusting in steps of 5% up to 30%
  for (let step = 5; step <= 30; step += 5) {
    const adjustedColor = adjustColorTowards(textHex, targetColor, step);
    const newRatio = contrastRatio(bgHex, adjustedColor);

    if (newRatio >= targetRatio) {
      return { color: adjustedColor, adjusted: true, ratio: newRatio };
    }
  }

  // If still not accessible, go all the way to pure black or white
  const finalColor = targetColor;
  const finalRatio = contrastRatio(bgHex, finalColor);

  return { color: finalColor, adjusted: true, ratio: finalRatio };
}

/**
 * Find an accessible background color for a given text color
 * @param textHex - Text color
 * @param bgHex - Original background color
 * @param targetRatio - Target contrast ratio
 * @returns Object with accessible background and whether adjustment was needed
 */
export function findAccessibleBackgroundColor(
  textHex: string,
  bgHex: string,
  targetRatio: number = 4.5
): { color: string; adjusted: boolean; ratio: number } {
  const originalRatio = contrastRatio(textHex, bgHex);

  if (originalRatio >= targetRatio) {
    return { color: bgHex, adjusted: false, ratio: originalRatio };
  }

  const textLuminance = getRelativeLuminance(textHex);
  const targetColor = textLuminance > 0.5 ? '#000000' : '#ffffff';

  for (let step = 5; step <= 30; step += 5) {
    const adjustedColor = adjustColorTowards(bgHex, targetColor, step);
    const newRatio = contrastRatio(textHex, adjustedColor);

    if (newRatio >= targetRatio) {
      return { color: adjustedColor, adjusted: true, ratio: newRatio };
    }
  }

  const finalColor = targetColor;
  const finalRatio = contrastRatio(textHex, finalColor);

  return { color: finalColor, adjusted: true, ratio: finalRatio };
}

/**
 * Analyze theme accessibility and generate report with adjustments
 * @param theme - Theme configuration to analyze
 * @returns Theme with accessibility report
 */
export function analyzeThemeAccessibility(
  theme: ThemeConfig
): ThemeWithAccessibility {
  const originalRatio = contrastRatio(theme.backgroundColor, theme.textColor);
  const targetRatio = 4.5; // WCAG AA for normal text

  const adjustmentsMade: string[] = [];
  const warnings: string[] = [];

  let finalTextColor = theme.textColor;
  let finalBackgroundColor = theme.backgroundColor;
  let adjustedRatio = originalRatio;

  // If not accessible, try to fix
  if (originalRatio < targetRatio) {
    // First try adjusting text color
    const textResult = findAccessibleTextColor(
      theme.backgroundColor,
      theme.textColor,
      targetRatio
    );

    if (textResult.ratio >= targetRatio) {
      finalTextColor = textResult.color;
      adjustedRatio = textResult.ratio;
      
      if (textResult.adjusted) {
        adjustmentsMade.push(
          `Text color adjusted from ${theme.textColor} to ${finalTextColor}`
        );
      }
    } else {
      // If text adjustment failed, try background
      const bgResult = findAccessibleBackgroundColor(
        theme.textColor,
        theme.backgroundColor,
        targetRatio
      );

      if (bgResult.ratio >= targetRatio) {
        finalBackgroundColor = bgResult.color;
        adjustedRatio = bgResult.ratio;
        
        if (bgResult.adjusted) {
          adjustmentsMade.push(
            `Background color adjusted from ${theme.backgroundColor} to ${finalBackgroundColor}`
          );
        }
      } else {
        // Both failed, adjust both
        const textFinal = findAccessibleTextColor(
          bgResult.color,
          theme.textColor,
          targetRatio
        );
        
        finalTextColor = textFinal.color;
        finalBackgroundColor = bgResult.color;
        adjustedRatio = textFinal.ratio;
        
        adjustmentsMade.push(
          `Text color adjusted to ${finalTextColor}`,
          `Background color adjusted to ${finalBackgroundColor}`
        );
        
        if (adjustedRatio < targetRatio) {
          warnings.push(
            `Unable to achieve WCAG AA contrast (4.5:1). Current: ${adjustedRatio.toFixed(2)}:1`
          );
        }
      }
    }
  }

  const isAccessible = adjustedRatio >= targetRatio;

  return {
    ...theme,
    textColor: finalTextColor,
    backgroundColor: finalBackgroundColor,
    accessibilityReport: {
      isAccessible,
      originalContrastRatio: originalRatio,
      adjustedContrastRatio: adjustedRatio !== originalRatio ? adjustedRatio : undefined,
      adjustedTextColor: finalTextColor !== theme.textColor ? finalTextColor : undefined,
      adjustedBackgroundColor: finalBackgroundColor !== theme.backgroundColor 
        ? finalBackgroundColor 
        : undefined,
      adjustmentsMade,
      warnings,
    },
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

const AccessibleThemeSelector: React.FC<AccessibleThemeSelectorProps> = ({
  themes,
  onApply,
  defaultThemeId,
}) => {
  const [accessibilityMode, setAccessibilityMode] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);

  // Analyze all themes for accessibility
  const analyzedThemes = useMemo(() => {
    return themes.map(analyzeThemeAccessibility);
  }, [themes]);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('lexify_theme');
    
    if (savedThemeId && themes.find(t => t.id === savedThemeId)) {
      setSelectedThemeId(savedThemeId);
    } else if (defaultThemeId) {
      setSelectedThemeId(defaultThemeId);
    }
  }, [defaultThemeId, themes]);

  const handleApplyTheme = (theme: ThemeWithAccessibility, forceApply = false) => {
    const { accessibilityReport } = theme;

    // If accessibility mode is on and theme is not accessible, prevent apply
    if (accessibilityMode && !accessibilityReport.isAccessible && !forceApply) {
      alert(
        `This theme does not meet WCAG AA contrast requirements.\n` +
        `Current contrast: ${accessibilityReport.adjustedContrastRatio?.toFixed(2) || accessibilityReport.originalContrastRatio.toFixed(2)}:1\n` +
        `Required: 4.5:1\n\n` +
        `Please toggle off "Accessibility Mode" to apply anyway, or choose a different theme.`
      );
      return;
    }

    // Save to localStorage
    localStorage.setItem('lexify_theme', theme.id);
    setSelectedThemeId(theme.id);

    // Call parent callback with adjusted theme
    onApply(theme);
  };

  const getContrastBadgeColor = (ratio: number): string => {
    if (ratio >= 7) return 'bg-green-500';
    if (ratio >= 4.5) return 'bg-blue-500';
    if (ratio >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getContrastLabel = (ratio: number): string => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'Fail';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Theme Selector</h2>
        <p className="text-sm sm:text-base opacity-70">
          Choose a theme that meets WCAG AA accessibility standards
        </p>
      </div>

      {/* Accessibility Toggle */}
      <div className="mb-6 flex items-center gap-3 p-4 bg-base-200 rounded-lg">
        <input
          type="checkbox"
          id="accessibility-mode"
          className="toggle toggle-primary"
          checked={accessibilityMode}
          onChange={(e) => setAccessibilityMode(e.target.checked)}
        />
        <label htmlFor="accessibility-mode" className="cursor-pointer flex-1">
          <div className="font-semibold">Accessibility Mode</div>
          <div className="text-xs sm:text-sm opacity-70">
            {accessibilityMode
              ? 'Only accessible themes can be applied'
              : 'All themes can be applied (may show warnings)'}
          </div>
        </label>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {analyzedThemes.map((theme) => {
          const { accessibilityReport } = theme;
          const isSelected = selectedThemeId === theme.id;
          const isHovered = hoveredThemeId === theme.id;
          const currentRatio = accessibilityReport.adjustedContrastRatio || accessibilityReport.originalContrastRatio;
          const hasAdjustments = accessibilityReport.adjustmentsMade.length > 0;

          return (
            <div
              key={theme.id}
              className={`
                relative border-2 rounded-lg overflow-hidden transition-all duration-200
                ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-base-100' : 'border-base-300'}
                ${isHovered ? 'shadow-lg scale-[1.02]' : 'shadow'}
              `}
              onMouseEnter={() => setHoveredThemeId(theme.id)}
              onMouseLeave={() => setHoveredThemeId(null)}
            >
              {/* Preview Area */}
              <div
                className="p-6 min-h-[200px] flex flex-col justify-between"
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                }}
              >
                {/* Theme Name */}
                <div>
                  <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
                  <p className="text-sm opacity-90">
                    The quick brown fox jumps over the lazy dog. This is sample text to preview readability.
                  </p>
                </div>

                {/* Color Swatches */}
                <div className="flex gap-2 mt-4">
                  <div
                    className="w-8 h-8 rounded border-2 border-current"
                    style={{ backgroundColor: theme.primaryColor }}
                    title={`Primary: ${theme.primaryColor}`}
                  />
                  <div
                    className="w-8 h-8 rounded border-2 border-current"
                    style={{ backgroundColor: theme.accentColor }}
                    title={`Accent: ${theme.accentColor}`}
                  />
                </div>
              </div>

              {/* Info Bar */}
              <div className="bg-base-200 p-3">
                {/* Contrast Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        px-2 py-1 rounded text-xs font-bold text-white
                        ${getContrastBadgeColor(currentRatio)}
                      `}
                    >
                      {getContrastLabel(currentRatio)}
                    </span>
                    <span className="text-xs opacity-70">
                      {currentRatio.toFixed(2)}:1
                    </span>
                  </div>
                  
                  {isSelected && (
                    <span className="badge badge-primary badge-sm">Active</span>
                  )}
                </div>

                {/* Adjustments Warning */}
                {hasAdjustments && (
                  <div className="mb-2 p-2 bg-warning bg-opacity-20 rounded text-xs">
                    <div className="font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Auto-adjusted for accessibility
                    </div>
                    <ul className="mt-1 ml-5 list-disc opacity-80">
                      {accessibilityReport.adjustmentsMade.map((adjustment, idx) => (
                        <li key={idx}>{adjustment}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {accessibilityReport.warnings.length > 0 && (
                  <div className="mb-2 p-2 bg-error bg-opacity-20 rounded text-xs">
                    {accessibilityReport.warnings.map((warning, idx) => (
                      <div key={idx} className="text-error font-semibold">{warning}</div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={() => handleApplyTheme(theme)}
                    disabled={accessibilityMode && !accessibilityReport.isAccessible}
                  >
                    {isSelected ? 'Applied' : 'Apply'}
                  </button>
                  
                  {accessibilityMode && !accessibilityReport.isAccessible && (
                    <button
                      className="btn btn-outline btn-warning btn-sm"
                      onClick={() => handleApplyTheme(theme, true)}
                      title="Apply theme despite accessibility issues"
                    >
                      Force
                    </button>
                  )}
                </div>
              </div>

              {/* Hover Tooltip */}
              {isHovered && (
                <div className="absolute top-2 right-2 bg-base-100 shadow-lg rounded p-2 text-xs max-w-[200px] z-10">
                  <div className="font-semibold mb-1">Contrast Details:</div>
                  <div>Original: {accessibilityReport.originalContrastRatio.toFixed(2)}:1</div>
                  {accessibilityReport.adjustedContrastRatio && (
                    <div>Adjusted: {accessibilityReport.adjustedContrastRatio.toFixed(2)}:1</div>
                  )}
                  <div className="mt-1 opacity-70">
                    WCAG AA requires 4.5:1 for normal text
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-base-200 rounded-lg text-sm">
        <div className="font-semibold mb-2">Accessibility Standards:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-bold text-white bg-green-500">AAA</span>
            <span className="opacity-70">7:1 or higher (Enhanced)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-bold text-white bg-blue-500">AA</span>
            <span className="opacity-70">4.5:1 or higher (Required)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-bold text-white bg-red-500">Fail</span>
            <span className="opacity-70">Below 4.5:1 (Not accessible)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibleThemeSelector;

// ============================================================================
// EXAMPLE USAGE & SAMPLE THEMES
// ============================================================================

/**
 * Example theme configurations for demonstration
 */
export const SAMPLE_THEMES: ThemeConfig[] = [
  {
    id: 'light',
    name: 'Light',
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    accentColor: '#10b981',
    textColor: '#1f2937',
  },
  {
    id: 'dark',
    name: 'Dark',
    primaryColor: '#60a5fa',
    backgroundColor: '#1f2937',
    accentColor: '#34d399',
    textColor: '#f9fafb',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primaryColor: '#0ea5e9',
    backgroundColor: '#0c4a6e',
    accentColor: '#22d3ee',
    textColor: '#e0f2fe',
  },
  {
    id: 'forest',
    name: 'Forest',
    primaryColor: '#22c55e',
    backgroundColor: '#14532d',
    accentColor: '#84cc16',
    textColor: '#f0fdf4',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primaryColor: '#f59e0b',
    backgroundColor: '#7c2d12',
    accentColor: '#fb923c',
    textColor: '#fff7ed',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primaryColor: '#a855f7',
    backgroundColor: '#faf5ff',
    accentColor: '#c084fc',
    textColor: '#581c87',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    primaryColor: '#ef4444',
    backgroundColor: '#7f1d1d',
    accentColor: '#f87171',
    textColor: '#fef2f2',
  },
  {
    id: 'mint',
    name: 'Mint',
    primaryColor: '#10b981',
    backgroundColor: '#f0fdfa',
    accentColor: '#34d399',
    textColor: '#064e3b',
  },
  {
    id: 'slate',
    name: 'Slate',
    primaryColor: '#64748b',
    backgroundColor: '#0f172a',
    accentColor: '#94a3b8',
    textColor: '#f1f5f9',
  },
  {
    id: 'bad-contrast',
    name: 'Bad Contrast (Demo)',
    primaryColor: '#ffff00',
    backgroundColor: '#ffffff',
    accentColor: '#00ffff',
    textColor: '#cccccc', // Poor contrast - will be auto-adjusted
  },
];

/**
 * Example integration with app
 */
export const ExampleUsage = () => {
  const handleApplyTheme = (theme: ThemeWithAccessibility) => {
    console.log('Applying theme:', theme);
    
    // Apply to CSS variables
    document.documentElement.style.setProperty('--primary', theme.primaryColor);
    document.documentElement.style.setProperty('--bg', theme.backgroundColor);
    document.documentElement.style.setProperty('--accent', theme.accentColor);
    document.documentElement.style.setProperty('--text', theme.textColor);
    
    // Or update your global state/context
    // setGlobalTheme(theme);
  };

  return (
    <AccessibleThemeSelector
      themes={SAMPLE_THEMES}
      onApply={handleApplyTheme}
      defaultThemeId="light"
    />
  );
};
