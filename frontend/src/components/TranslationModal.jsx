import React from "react";
import { X, Languages, Loader2 } from "lucide-react";

/**
 * TranslationModal Component
 * 
 * Displays a modal with original message and its translation
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} originalText - The original message text
 * @param {string} translatedText - The translated text (null if loading)
 * @param {boolean} isLoading - Whether translation is in progress
 * @param {string|null} error - Error message if translation failed
 * @param {string} targetLanguage - The language code being translated to
 */
const TranslationModal = ({
  isOpen,
  onClose,
  originalText,
  translatedText,
  isLoading,
  error,
  targetLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in border border-base-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-base-300 bg-base-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Languages className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-base-content">
                  Translation
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60">
                  Translated to {targetLanguage}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
              aria-label="Close translation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-120px)]">
            {/* Original Message */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-base-content/70 uppercase tracking-wide">
                Original Message
              </label>
              <div className="bg-base-200 rounded-xl p-3 sm:p-4 border border-base-300/50">
                <p className="text-sm sm:text-base text-base-content leading-relaxed">
                  {originalText}
                </p>
              </div>
            </div>

            {/* Translated Message */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Translation
              </label>
              <div className="bg-primary/5 rounded-xl p-3 sm:p-4 border-2 border-primary/20 min-h-[80px] flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-base-content/60">
                      Translating message...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-error font-medium mb-2">
                      Translation Failed
                    </p>
                    <p className="text-xs text-base-content/60">{error}</p>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-base-content leading-relaxed">
                    {translatedText}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-base-300 bg-base-200/50 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary btn-sm sm:btn-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TranslationModal;
