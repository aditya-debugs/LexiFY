import { useQuery } from "@tanstack/react-query";
import { getFriendRequests, getNotifications } from "../lib/api";
import { useState, useCallback } from "react";
import useAuthUser from "./useAuthUser";

const useNotifications = () => {
  const { authUser } = useAuthUser();
  const [lastSeenNotifications, setLastSeenNotifications] = useState(() => {
    const stored = localStorage.getItem("lastSeenNotifications");
    return stored ? parseInt(stored) : Date.now();
  });

  // Get friend requests
  const { data: friendRequestsData, isLoading: friendRequestsLoading } =
    useQuery({
      queryKey: ["friendRequests"],
      queryFn: getFriendRequests,
      enabled: !!authUser,
      refetchInterval: 30000,
    });

  // Get learning goal notifications
  const { data: goalNotifications, isLoading: notificationsLoading } = useQuery(
    {
      queryKey: ["notifications"],
      queryFn: getNotifications,
      enabled: !!authUser,
      refetchInterval: 30000,
    }
  );

  const incomingRequests = friendRequestsData?.incomingReqs || [];
  const notifications = goalNotifications || [];

  // Calculate unread friend requests
  const unreadFriendRequests = friendRequestsLoading
    ? 0
    : incomingRequests.filter((req) => {
        if (!req.createdAt) return false;
        const requestTime = new Date(req.createdAt).getTime();
        return requestTime > lastSeenNotifications;
      }).length;

  // Calculate unread goal notifications
  const unreadGoalNotifications = notificationsLoading
    ? 0
    : notifications.filter((notif) => {
        return !notif.read;
      }).length;

  // Mark notifications as seen
  const markNotificationsAsSeen = useCallback(() => {
    const now = Date.now();
    setLastSeenNotifications(now);
    localStorage.setItem("lastSeenNotifications", now.toString());
  }, []);

  const totalNotifications = unreadFriendRequests + unreadGoalNotifications;

  return {
    unreadFriendRequests,
    unreadGoalNotifications,
    totalNotifications,
    markNotificationsAsSeen,
    hasNotifications: totalNotifications > 0,
  };
};

export default useNotifications;
