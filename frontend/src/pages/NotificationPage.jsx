import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import useNotifications from "../hooks/useNotifications";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { markNotificationsAsSeen } = useNotifications();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  // Mark notifications as seen when user visits this page
  useEffect(() => {
    markNotificationsAsSeen();
  }, [markNotificationsAsSeen]);

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-4 sm:mb-6 text-primary animate-slide-in-left">
          Notifications
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <span className="loading loading-spinner loading-md sm:loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-3 sm:space-y-4 animate-fade-in">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap animate-slide-in-left">
                  <UserCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span>Friend Requests</span>
                  <span className="badge badge-primary text-xs sm:text-sm">
                    {incomingRequests.length}
                  </span>
                </h2>

                <div className="space-y-2 sm:space-y-3">
                  {incomingRequests.map((request, index) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 hover-lift hover-glow border border-base-300/20 card-animate"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="card-body p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-base-300">
                                <img 
                                  src={request.sender.profilePic} 
                                  alt={request.sender.fullName}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base truncate">
                                {request.sender.fullName}
                              </h3>
                              <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-xs sm:badge-sm">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-xs sm:badge-sm">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm w-full sm:w-auto"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            {isPending ? 'Accepting...' : 'Accept'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQS NOTIFICATIONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-3 sm:space-y-4 animate-fade-in">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 animate-slide-in-left">
                  <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-2 sm:space-y-3">
                  {acceptedRequests.map((notification, index) => (
                    <div 
                      key={notification._id} 
                      className="card bg-base-200 hover-lift border border-base-300/20 card-animate"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="card-body p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar flex-shrink-0 mt-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                              <img
                                src={notification.recipient.profilePic}
                                alt={notification.recipient.fullName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">
                              {notification.recipient.fullName}
                            </h3>
                            <p className="text-xs sm:text-sm my-1 text-base-content/80">
                              {notification.recipient.fullName} accepted your friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success badge-sm flex-shrink-0">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">New Friend</span>
                            <span className="sm:hidden">New</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;