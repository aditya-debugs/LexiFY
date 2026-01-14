import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import DailyWordStatusBar from "../components/DailyWordStatusBar";
import UpdateAnnouncementModal from "../components/UpdateAnnouncementModal";
import useAuthUser from "../hooks/useAuthUser";

const ANNOUNCEMENT_VERSION = "v2.0-dailyword-update"; // Change this when you want to show announcement again

const HomePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  // Check if user has seen the announcement
  useEffect(() => {
    if (!authUser) return;
    
    // Check if user is new (created within last 7 days)
    const accountAge = Date.now() - new Date(authUser.createdAt).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    setIsNewUser(accountAge < sevenDaysInMs);
    
    const hasSeenAnnouncement = localStorage.getItem(`seen-announcement-${ANNOUNCEMENT_VERSION}`);
    if (!hasSeenAnnouncement) {
      // Show announcement after a short delay for better UX
      const timer = setTimeout(() => {
        setShowAnnouncement(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authUser]);

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
    localStorage.setItem(`seen-announcement-${ANNOUNCEMENT_VERSION}`, "true");
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Friends Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-slide-in-left">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-base-content">
              Daily Word
            </h2>
            <p className="text-sm sm:text-base text-base-content/60 mt-1 animate-fade-in">
              Share a word you learned and discover what others are learning
            </p>
          </div>
          <Link to="/notifications" className="btn btn-outline btn-sm sm:btn-md hover-lift animate-slide-in-right gap-2">
            <UsersIcon className="size-4 sm:size-5" />
            <span className="hidden sm:inline">Friend Requests</span>
            <span className="sm:hidden">Requests</span>
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg animate-pulse-gentle" />
          </div>
        ) : friends.length === 0 ? (
          <div className="animate-fade-in">
            <NoFriendsFound />
          </div>
        ) : (
          <DailyWordStatusBar friends={friends} />
        )}

        <section className="animate-fade-in pt-4 sm:pt-6">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="animate-slide-in-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-base-content">
                  Meet New Learners
                </h2>
                <p className="text-sm sm:text-base text-base-content/60 animate-fade-in">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg animate-pulse-gentle" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center animate-scale-in hover-lift">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {recommendedUsers.map((user, index) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover-lift hover-glow group border border-base-300/20 card-animate card-consistent"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="card-body p-4 sm:p-5 space-y-3">
                      {/* User Header */}
                      <div className="flex items-center gap-3">
                        <div className="avatar animate-scale-in flex-shrink-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300">
                            <img 
                              src={user.profilePic} 
                              alt={user.fullName}
                              className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold text-base sm:text-lg text-container group-hover:text-primary transition-colors">
                            {user.fullName}
                          </h3>
                          {user.username && (
                            <p className="text-xs sm:text-sm text-base-content/60 text-container">
                              @{user.username}
                            </p>
                          )}
                          {user.location && (
                            <div className="flex items-center text-xs text-base-content/70">
                              <MapPinIcon className="size-3 mr-1 flex-shrink-0" />
                              <span className="text-container truncate">{user.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-secondary badge-sm sm:badge-md gap-1 flex-shrink-0">
                          {getLanguageFlag(user.nativeLanguage)}
                          <span className="hidden sm:inline">Native:</span>
                          <span className="sm:hidden">N:</span>
                          <span className="truncate max-w-[80px] sm:max-w-none">{capitialize(user.nativeLanguage)}</span>
                        </span>
                        <span className="badge badge-outline badge-sm sm:badge-md gap-1 flex-shrink-0">
                          {getLanguageFlag(user.learningLanguage)}
                          <span className="hidden sm:inline">Learning:</span>
                          <span className="sm:hidden">L:</span>
                          <span className="truncate max-w-[80px] sm:max-w-none">{capitialize(user.learningLanguage)}</span>
                        </span>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <div className="bg-base-300/50 rounded-lg p-3 flex-1">
                          <p className="text-xs sm:text-sm text-base-content/80 line-clamp-3">
                            "{user.bio}"
                          </p>
                        </div>
                      )}

                      {/* Action button */}
                      <button
                        className={`btn btn-sm sm:btn-md w-full ${
                          hasRequestBeenSent 
                            ? "btn-success cursor-not-allowed" 
                            : "btn-primary hover:btn-primary-focus"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 sm:size-5" />
                            <span className="hidden sm:inline">Request Sent</span>
                            <span className="sm:hidden">Sent</span>
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 sm:size-5" />
                            <span className="hidden sm:inline">Send Friend Request</span>
                            <span className="sm:hidden">Add Friend</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Update Announcement Modal */}
      <UpdateAnnouncementModal 
        isOpen={showAnnouncement} 
        onClose={handleCloseAnnouncement}
        userName={authUser?.fullName || authUser?.username || "Friend"}
        isNewUser={isNewUser}
      />
    </div>
  );
};

export default HomePage;