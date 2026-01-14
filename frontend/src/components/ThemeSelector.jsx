import { PaletteIcon, X } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";

const ThemeSelector = ({ onThemeChange }) => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeSelect = (themeName) => {
    setTheme(themeName);
    if (onThemeChange) {
      setTimeout(() => onThemeChange(), 200);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <PaletteIcon className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">Select Theme</h3>
      </div>

      {/* Theme Options */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {THEMES.map((themeOption) => (
          <button
            key={themeOption.name}
            className={`
              w-full p-4 rounded-xl flex items-center gap-4 transition-all
              ${
                theme === themeOption.name
                  ? "bg-primary/10 text-primary border-2 border-primary/30 shadow-md"
                  : "bg-base-200 hover:bg-base-300 border-2 border-transparent"
              }
            `}
            onClick={() => handleThemeSelect(themeOption.name)}
          >
            <div className="flex-1 text-left">
              <span className="font-medium text-base">{themeOption.label}</span>
            </div>
            {/* THEME PREVIEW COLORS */}
            <div className="flex gap-2">
              {themeOption.colors.map((color, i) => (
                <span
                  key={i}
                  className="size-4 rounded-full border-2 border-base-content/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {theme === themeOption.name && (
              <div className="size-3 bg-primary rounded-full flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
export default ThemeSelector;