import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDailyWordFeed, getMyActiveDailyWord } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import DailyWordComposer from "./DailyWordComposer";
import StatusViewerModal from "./StatusViewerModal";

const DailyWordStatusBar = ({ friends }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch status feed
  const { data: statusFeedData = {} } = useQuery({
    queryKey: ["dailyWordFeed"],
    queryFn: getDailyWordFeed,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const statusFeed = statusFeedData.dailyWords || [];

  // Fetch current user's active status
  const { data: myStatus } = useQuery({
    queryKey: ["myActiveDailyWord"],
    queryFn: getMyActiveDailyWord,
  });

  // Create a map of userId -> status
  const statusMap = new Map();
  statusFeed.forEach((status) => {
    statusMap.set(status.userId._id || status.userId, status);
  });

  // Prepare friends data with status info and merge with current user
  const allUsers = [
    // Current user
    {
      _id: authUser._id,
      username: "You",
      fullName: authUser.fullName,
      profilePic: authUser.profilePic,
      isMe: true,
      hasActive: !!myStatus?.status,
      status: myStatus?.status,
      streakCount: myStatus?.streakCount || 0,
      createdAt: myStatus?.status?.createdAt || null,
    },
    // Friends
    ...friends.map((friend) => {
      const status = statusMap.get(friend._id);
      return {
        _id: friend._id,
        username: friend.username,
        fullName: friend.fullName,
        profilePic: friend.profilePic,
        isMe: false,
        hasActive: !!status,
        status,
        streakCount: 0,
        createdAt: status?.createdAt || null,
      };
    }),
  ];

  // Sort friends: 
  // 1. Current user always first
  // 2. Friends with active status, sorted by createdAt DESC (newest first)
  // 3. Friends without active status, sorted alphabetically by username
  const sortedUsers = allUsers.sort((a, b) => {
    // Current user always first
    if (a.isMe) return -1;
    if (b.isMe) return 1;

    // Both have active status - sort by createdAt DESC (newest first)
    if (a.hasActive && b.hasActive) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    // Only a has active status - a comes first
    if (a.hasActive) return -1;
    if (b.hasActive) return 1;

    // Neither has active status - sort alphabetically by username
    const usernameA = a.username || a.fullName || "";
    const usernameB = b.username || b.fullName || "";
    return usernameA.localeCompare(usernameB);
  });

  const openStatusModal = (userId, statusId) => {
    if (userId === authUser._id && !myStatus?.status) {
      // Current user with no active status - open composer
      setShowComposer(true);
    } else {
      // View existing status
      setSelectedUserId(userId);
      setSelectedStatusId(statusId);
    }
  };

  return (
    <>
      {/* Daily Word story bar (replaces friend-card area) */}
      <div className="flex gap-6 items-start overflow-x-auto py-4 px-2 scrollbar-hide">
        {sortedUsers.map((user) => (
          <div key={user._id} className="flex flex-col items-center min-w-[80px] flex-shrink-0">
            <button
              className={`relative rounded-full p-0.5 transition-all duration-300 ${
                user.hasActive
                  ? "ring-2 ring-primary hover:ring-4 hover:ring-primary/50"
                  : "ring-2 ring-base-300 hover:ring-base-400"
              }`}
              onClick={() => openStatusModal(user._id, user.status?._id)}
              aria-label={`Open ${user.username} status`}
            >
              <img
                src={user.profilePic}
                alt={user.username}
                className="w-14 h-14 rounded-full object-cover"
              />
              {user.isMe && !user.hasActive && (
                <span className="absolute -bottom-1 -right-1 bg-primary text-primary-content w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer shadow-lg">
                  +
                </span>
              )}
              {user.streakCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-error-content px-1.5 py-0.5 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  🔥 {user.streakCount}
                </span>
              )}
            </button>
            <div className="mt-2 text-sm text-base-content text-center truncate w-full font-medium">
              {user.username}
            </div>
            <div className="text-xs text-base-content/60">
              {user.hasActive ? "New word" : "No new word"}
            </div>
          </div>
        ))}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <DailyWordComposer
          onClose={() => setShowComposer(false)}
          existingStatus={myStatus?.status}
          currentStreak={myStatus?.streakCount || 0}
        />
      )}

      {/* Viewer Modal */}
      {selectedStatusId && (
        <StatusViewerModal
          statusId={selectedStatusId}
          isOpen={!!selectedStatusId}
          onClose={() => {
            setSelectedStatusId(null);
            setSelectedUserId(null);
          }}
        />
      )}
    </>
  );
};

export default DailyWordStatusBar;
