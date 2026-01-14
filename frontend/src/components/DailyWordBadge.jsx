import React from "react";
import { BookOpen, Flame } from "lucide-react";

/**
 * Badge component to show user's Daily Word and streak
 * Can be used in friend cards, profiles, etc.
 */
const DailyWordBadge = ({ user, onClick }) => {
  const hasActiveWord = user?.hasActiveDailyWord;
  const streakCount = user?.streakCount || 0;

  if (!hasActiveWord && streakCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      {hasActiveWord && (
        <button
          onClick={onClick}
          className="badge badge-primary gap-1 cursor-pointer hover:badge-primary-focus transition-all"
        >
          <BookOpen className="h-3 w-3" />
          <span className="text-xs">Daily Word</span>
        </button>
      )}
      {streakCount > 0 && (
        <div className="badge badge-warning gap-1">
          <Flame className="h-3 w-3" />
          <span className="text-xs font-bold">{streakCount}</span>
        </div>
      )}
    </div>
  );
};

export default DailyWordBadge;
