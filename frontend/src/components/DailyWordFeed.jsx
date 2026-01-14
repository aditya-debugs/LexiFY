import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDailyWordFeed, translateMessage } from "../lib/api";
import { Clock, Eye, MessageCircle, Languages } from "lucide-react";
import StatusViewerModal from "./StatusViewerModal";
import TranslationModal from "./TranslationModal";
import { translationCache } from "../lib/translationCache";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const DailyWordCard = ({ dailyWord, onClick, onTranslate }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const hasViewed = dailyWord.hasViewed;

  const handleTranslate = (e) => {
    e.stopPropagation();
    const textToTranslate = `${dailyWord.word}: ${dailyWord.meaning}`;
    onTranslate(textToTranslate);
  };

  return (
    <div
      onClick={onClick}
      className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all hover:shadow-lg animate-scale-in relative group"
    >
      {/* Translation Button */}
      <button
        onClick={handleTranslate}
        className="absolute top-2 right-2 btn btn-xs btn-circle bg-primary text-primary-content hover:bg-primary-focus shadow-lg border-2 border-primary z-10 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-200"
        style={{ opacity: window.innerWidth < 768 ? '1' : undefined }}
        title="Translate to your native language"
      >
        <Languages className="h-3 w-3" />
      </button>

      <div className="card-body p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar">
            <div
              className={`w-12 h-12 rounded-full ring-2 ${
                hasViewed ? "ring-base-300" : "ring-primary"
              }`}
            >
              <img
                src={dailyWord.userId?.profilePic || "/avatar.png"}
                alt={dailyWord.userId?.fullName}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {dailyWord.userId?.fullName}
            </p>
            <div className="flex items-center gap-2 text-xs text-base-content/60">
              <Clock className="h-3 w-3" />
              <span>{timeAgo(dailyWord.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Word Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">
              {dailyWord.word}
            </h3>
            <span className="badge badge-sm badge-outline">
              {dailyWord.language}
            </span>
          </div>
          <p className="text-sm text-base-content/80 line-clamp-2">
            {dailyWord.meaning}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-base-content/60">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{dailyWord.viewerCount || 0}</span>
          </div>
          {dailyWord.replies?.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{dailyWord.replies.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DailyWordFeed = () => {
  const { authUser } = useAuthUser();
  const [selectedStatus, setSelectedStatus] = useState(null);
  
  // Translation state
  const [translationModal, setTranslationModal] = useState({
    isOpen: false,
    originalText: "",
    translatedText: null,
    isLoading: false,
    error: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["dailyWordFeed"],
    queryFn: getDailyWordFeed,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const dailyWords = data?.dailyWords || [];

  const handleTranslate = async (text) => {
    const targetLanguage = authUser?.nativeLanguage || "English";

    // Check cache first
    const cachedTranslation = translationCache.get(text, targetLanguage);
    
    if (cachedTranslation) {
      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText: cachedTranslation,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Open modal with loading state
    setTranslationModal({
      isOpen: true,
      originalText: text,
      translatedText: null,
      isLoading: true,
      error: null,
    });

    try {
      const response = await translateMessage(text, targetLanguage);
      const translatedText = response.translatedText;

      // Cache the translation
      translationCache.set(text, targetLanguage, translatedText);

      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText: translatedText,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Translation error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to translate. Please try again.";

      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText: null,
        isLoading: false,
        error: errorMessage,
      });

      toast.error(errorMessage);
    }
  };

  const closeTranslationModal = () => {
    setTranslationModal({
      isOpen: false,
      originalText: "",
      translatedText: null,
      isLoading: false,
      error: null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (dailyWords.length === 0) {
    return (
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body items-center text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold">No Daily Words Yet</h3>
          <p className="text-base-content/60">
            Be the first to share a word today!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Daily Words</h2>
          <span className="badge badge-primary">
            {dailyWords.length} active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailyWords.map((dailyWord) => (
            <DailyWordCard
              key={dailyWord._id}
              dailyWord={dailyWord}
              onClick={() => setSelectedStatus(dailyWord)}
              onTranslate={handleTranslate}
            />
          ))}
        </div>
      </div>

      {selectedStatus && (
        <StatusViewerModal
          dailyWord={selectedStatus}
          isOpen={!!selectedStatus}
          onClose={() => setSelectedStatus(null)}
        />
      )}

      {/* Translation Modal */}
      <TranslationModal
        isOpen={translationModal.isOpen}
        onClose={closeTranslationModal}
        originalText={translationModal.originalText}
        translatedText={translationModal.translatedText}
        isLoading={translationModal.isLoading}
        error={translationModal.error}
        targetLanguage={authUser?.nativeLanguage || "English"}
      />
    </>
  );
};

export default DailyWordFeed;
