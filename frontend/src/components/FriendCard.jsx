import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover-lift hover-glow group w-full border border-base-300/20 card-consistent">
      <div className="card-body p-4 sm:p-5 space-y-3 flex flex-col">
        {/* USER INFO */}
        <div className="flex items-center gap-3">
          <div className="avatar animate-scale-in flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300">
              <img 
                src={friend.profilePic} 
                alt={friend.fullName}
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
              {friend.fullName}
            </h3>
            {friend.username && (
              <p className="text-xs sm:text-sm text-base-content/60 truncate">
                @{friend.username}
              </p>
            )}
          </div>
        </div>

        {/* Language Badges */}
        <div className="flex flex-wrap gap-2 flex-1">
          <span className="badge badge-secondary badge-sm sm:badge-md gap-1 flex-shrink-0">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="hidden sm:inline">Native:</span>
            <span className="sm:hidden">N:</span>
            <span className="truncate max-w-[70px] sm:max-w-none">{friend.nativeLanguage}</span>
          </span>
          <span className="badge badge-outline badge-sm sm:badge-md gap-1 flex-shrink-0">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="hidden sm:inline">Learning:</span>
            <span className="sm:hidden">L:</span>
            <span className="truncate max-w-[70px] sm:max-w-none">{friend.learningLanguage}</span>
          </span>
        </div>

        {/* Action Button */}
        <Link 
          to={`/chat/${friend._id}`} 
          className="btn btn-primary btn-sm sm:btn-md w-full group-hover:btn-primary-focus mt-auto"
        >
          💬 Chat
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}