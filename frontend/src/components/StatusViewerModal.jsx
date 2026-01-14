import React, { useState, useEffect } from "react";
import { X, Send, Eye, Trash2, Clock, Languages } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStatusById,
  viewDailyWord,
  replyToDailyWord,
  deleteDailyWord,
  translateMessage,
} from "../lib/api";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import TranslationModal from "./TranslationModal";
import { translationCache } from "../lib/translationCache";

const StatusViewerModal = ({ statusId, isOpen, onClose }) => {
  const [replyMessage, setReplyMessage] = useState("");
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  
  // Translation state
  const [translationModal, setTranslationModal] = useState({
    isOpen: false,
    originalText: "",
    translatedText: null,
    isLoading: false,
    error: null,
  });

  // Fetch status by ID
  const { data: dailyWord, isLoading } = useQuery({
    queryKey: ["status", statusId],
    queryFn: () => getStatusById(statusId),
    enabled: isOpen && !!statusId,
  });

  const isOwner = dailyWord?.userId?._id === authUser?._id;

  // Record view when modal opens
  useEffect(() => {
    if (isOpen && dailyWord && !isOwner) {
      const hasViewed = dailyWord.viewers?.some(
        (v) => v.userId._id === authUser._id
      );
      if (!hasViewed) {
        viewDailyWord(dailyWord._id).catch((err) =>
          console.error("Error recording view:", err)
        );
      }
    }
  }, [isOpen, dailyWord, isOwner, authUser]);

  const { mutate: sendReply, isPending: isSendingReply } = useMutation({
    mutationFn: (data) => replyToDailyWord(data.id, data.message),
    onSuccess: () => {
      toast.success("Reply sent!");
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["status", statusId] });
      queryClient.invalidateQueries({ queryKey: ["dailyWordFeed"] });
      queryClient.invalidateQueries({ queryKey: ["myActiveDailyWord"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send reply");
    },
  });

  const { mutate: deleteStatus, isPending: isDeleting } = useMutation({
    mutationFn: deleteDailyWord,
    onSuccess: () => {
      toast.success("Daily Word deleted");
      queryClient.invalidateQueries({ queryKey: ["dailyWordFeed"] });
      queryClient.invalidateQueries({ queryKey: ["myActiveDailyWord"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete");
    },
  });

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    sendReply({
      id: dailyWord._id,
      message: replyMessage,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this Daily Word?")) {
      deleteStatus(dailyWord._id);
    }
  };

  const handleTranslate = async () => {
    const textToTranslate = `${dailyWord.word}: ${dailyWord.meaning}`;
    const targetLanguage = authUser?.nativeLanguage || "English";

    // Check cache first
    const cachedTranslation = translationCache.get(textToTranslate, targetLanguage);
    
    if (cachedTranslation) {
      setTranslationModal({
        isOpen: true,
        originalText: textToTranslate,
        translatedText: cachedTranslation,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Open modal with loading state
    setTranslationModal({
      isOpen: true,
      originalText: textToTranslate,
      translatedText: null,
      isLoading: true,
      error: null,
    });

    try {
      const response = await translateMessage(textToTranslate, targetLanguage);
      const translatedText = response.translatedText;

      translationCache.set(textToTranslate, targetLanguage, translatedText);

      setTranslationModal({
        isOpen: true,
        originalText: textToTranslate,
        translatedText,
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
        originalText: textToTranslate,
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

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="modal modal-open">
        <div className="modal-box">
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        </div>
        <div className="modal-backdrop bg-black/80" onClick={onClose} />
      </div>
    );
  }

  if (!dailyWord) {
    return (
      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>Daily Word not found or expired</p>
          <button className="btn btn-primary mt-4" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-backdrop bg-black/80" onClick={onClose} />
      </div>
    );
  }

  // Dedupe viewers - keep earliest view per user
  const deduplicatedViewers = [];
  const seenUserIds = new Set();
  
  if (dailyWord.viewers) {
    const sortedViewers = [...dailyWord.viewers].sort(
      (a, b) => new Date(a.viewedAt) - new Date(b.viewedAt)
    );
    
    sortedViewers.forEach((viewer) => {
      const userId = viewer.userId._id;
      if (!seenUserIds.has(userId)) {
        seenUserIds.add(userId);
        deduplicatedViewers.push(viewer);
      }
    });
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img
                  src={dailyWord.userId?.profilePic || "/avatar.png"}
                  alt={dailyWord.userId?.fullName}
                />
              </div>
            </div>
            <div>
              <p className="font-bold">{dailyWord.userId?.fullName}</p>
              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <Clock className="h-3 w-3" />
                <span>{timeAgo(dailyWord.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Word Content */}
        <div className="bg-base-200 rounded-lg p-6 mb-4 relative">
          {/* Translation Button */}
          <button
            onClick={handleTranslate}
            className="absolute top-3 right-3 btn btn-xs btn-circle bg-primary text-primary-content hover:bg-primary-focus shadow-lg border-2 border-primary"
            title="Translate to your native language"
          >
            <Languages className="h-3 w-3" />
          </button>

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-3xl font-bold text-primary">
              {dailyWord.word}
            </h2>
            <span className="badge badge-primary badge-lg">
              {dailyWord.language}
            </span>
          </div>
          <p className="text-base-content/90 leading-relaxed">
            {dailyWord.meaning}
          </p>
        </div>

        {/* Viewers (for owner) */}
        {isOwner && deduplicatedViewers.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Eye className="h-4 w-4" />
              <span>Seen by {deduplicatedViewers.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {deduplicatedViewers.map((viewer) => (
                <div
                  key={viewer.userId._id}
                  className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1"
                >
                  <div className="avatar">
                    <div className="w-6 h-6 rounded-full">
                      <img
                        src={viewer.userId?.profilePic || "/avatar.png"}
                        alt={viewer.userId?.fullName}
                      />
                    </div>
                  </div>
                  <span className="text-xs">{viewer.userId?.fullName}</span>
                  <span className="text-xs text-base-content/60">
                    {timeAgo(viewer.viewedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Replies */}
        {dailyWord.replies?.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Replies</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dailyWord.replies.map((reply, index) => (
                <div key={index} className="bg-base-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="avatar">
                      <div className="w-6 h-6 rounded-full">
                        <img
                          src={reply.fromUserId?.profilePic || "/avatar.png"}
                          alt={reply.fromUserId?.fullName}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold">
                      {reply.fromUserId?.fullName}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm ml-8">{reply.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Input (for viewers) */}
        {!isOwner && (
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              type="text"
              placeholder="Send a reply..."
              className="input input-bordered flex-1"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value.slice(0, 500))}
              maxLength={500}
            />
            <button
              type="submit"
              className="btn btn-primary btn-circle"
              disabled={isSendingReply || !replyMessage.trim()}
            >
              {isSendingReply ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        )}
      </div>
      <div className="modal-backdrop bg-black/80" onClick={onClose} />      
      {/* Translation Modal */}
      <TranslationModal
        isOpen={translationModal.isOpen}
        onClose={closeTranslationModal}
        originalText={translationModal.originalText}
        translatedText={translationModal.translatedText}
        isLoading={translationModal.isLoading}
        error={translationModal.error}
        targetLanguage={authUser?.nativeLanguage || "English"}
      />    </div>
  );
};

export default StatusViewerModal;
