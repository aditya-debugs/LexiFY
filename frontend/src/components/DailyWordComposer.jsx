import React, { useState, useEffect } from "react";
import { Flame, X, BookOpen, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { createDailyWord, getMyActiveDailyWord } from "../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const DailyWordComposer = ({ onClose, existingStatus, currentStreak }) => {
  const queryClient = useQueryClient();
  const [word, setWord] = useState(existingStatus?.word || "");
  const [meaning, setMeaning] = useState(existingStatus?.meaning || "");
  const [language, setLanguage] = useState(existingStatus?.language || "");
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const hasActiveStatus = !!existingStatus;
  const streakCount = currentStreak || 0;

  const { mutate: createStatus, isPending } = useMutation({
    mutationFn: createDailyWord,
    onSuccess: (data) => {
      toast.success(`Daily Word posted! Streak: ${data.streakCount} 🔥`);
      queryClient.invalidateQueries({ queryKey: ["myActiveDailyWord"] });
      queryClient.invalidateQueries({ queryKey: ["dailyWordFeed"] });
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to post Daily Word");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!word.trim() || !meaning.trim() || !language.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (hasActiveStatus && !showReplaceConfirm) {
      setShowReplaceConfirm(true);
      return;
    }

    // Always set visibility to "friends"
    createStatus({ word, meaning, language, visibility: "friends" });
  };

  // If using as modal, wrap in modal UI
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-base-100 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden animate-scale-in border border-primary/20">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-base-300 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <BookOpen className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
                    {hasActiveStatus ? "Replace Daily Word" : "Create Daily Word"}
                  </h2>
                  <p className="text-sm text-base-content/60 mt-0.5">Share your learning journey</p>
                </div>
              </div>
              {streakCount > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600 px-4 py-2 rounded-full border border-orange-500/30 shadow-lg">
                  <Flame className="size-5" />
                  <span className="font-bold text-lg">{streakCount}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle hover:bg-base-300"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form content with scroll */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
            {renderForm()}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise render as card
  return (
    <div className="card bg-base-200 shadow-xl animate-fade-in">
      <div className="card-body">
        {renderForm()}
      </div>
    </div>
  );

  function renderForm() {
    return (
      <>
        {/* Warning if replacing */}
        {hasActiveStatus && !showReplaceConfirm && (
          <div className="alert alert-warning mb-6 shadow-lg">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm">
              You already have an active Daily Word. Posting a new one will replace it.
            </span>
          </div>
        )}

        {/* Confirm Replace */}
        {showReplaceConfirm && (
          <div className="alert alert-error mb-6 shadow-lg">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                <span className="font-bold">Are you sure?</span>
              </div>
              <span className="text-sm">Your current Daily Word will be replaced and can't be recovered.</span>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-error"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? <span className="loading loading-spinner loading-xs" /> : "Yes, Replace"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowReplaceConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Word Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Word
              </span>
              <span className="label-text-alt text-base-content/60 font-medium">
                {word.length}/50
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter a word..."
              className="input input-bordered input-lg w-full text-lg focus:input-primary transition-all"
              value={word}
              onChange={(e) => setWord(e.target.value.slice(0, 50))}
              maxLength={50}
              required
            />
          </div>

          {/* Meaning Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Meaning
              </span>
              <span className="label-text-alt text-base-content/60 font-medium">
                {meaning.length}/500
              </span>
            </label>
            <textarea
              placeholder="Explain the meaning and how you learned it..."
              className="textarea textarea-bordered textarea-lg h-32 resize-none text-base focus:textarea-primary transition-all leading-relaxed"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value.slice(0, 500))}
              maxLength={500}
              required
            />
          </div>

          {/* Language Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">Language</span>
            </label>
            <select
              className="select select-bordered select-lg w-full text-base focus:select-primary transition-all"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              <option value="">Select language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Arabic">Arabic</option>
              <option value="Russian">Russian</option>
              <option value="Hindi">Hindi</option>
              <option value="Dutch">Dutch</option>
              <option value="Polish">Polish</option>
              <option value="Turkish">Turkish</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Info Badge */}
          <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-xl border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="text-sm text-base-content/80">
              <span className="font-semibold text-base-content">Visible to friends only.</span>
              <span className="block mt-0.5">Your Daily Word will be shared with your friends for 24 hours.</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full text-base shadow-lg hover:shadow-xl transition-all"
            disabled={isPending || (hasActiveStatus && showReplaceConfirm)}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-md" />
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                {hasActiveStatus && !showReplaceConfirm ? "Replace Daily Word" : "Post Daily Word"}
              </>
            )}
          </button>
        </form>
      </>
    );
  }
};

export default DailyWordComposer;
