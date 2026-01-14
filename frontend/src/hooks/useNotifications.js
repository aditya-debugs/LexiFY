import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";
import { useState, useCallback } from "react";
import useAuthUser from "./useAuthUser";

const useNotifications = () => {
  const { authUser } = useAuthUser();
  const [lastSeenNotifications, setLastSeenNotifications] = useState(() => {
    const stored = localStorage.getItem('lastSeenNotifications');
    return stored ? parseInt(stored) : Date.now(); // Default to now if no stored value
  });

  // Get friend requests
  const { data: friendRequestsData, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const incomingRequests = friendRequestsData?.incomingReqs || [];
  
  // Calculate unread friend requests (new requests since last seen)
  const unreadFriendRequests = isLoading ? 0 : incomingRequests.filter(req => {
    if (!req.createdAt) return false;
    const requestTime = new Date(req.createdAt).getTime();
    return requestTime > lastSeenNotifications;
  }).length;

  // Mark notifications as seen
  const markNotificationsAsSeen = useCallback(() => {
    const now = Date.now();
    setLastSeenNotifications(now);
    localStorage.setItem('lastSeenNotifications', now.toString());
  }, []);

  // Only friend requests count as notifications
  const totalNotifications = unreadFriendRequests;

  return {
    unreadFriendRequests,
    totalNotifications,
    markNotificationsAsSeen,
    hasNotifications: totalNotifications > 0,
  };
};

export default useNotifications;