import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { UsersIcon } from "lucide-react";

import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const { data: allFriends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <div className="p-3 sm:p-4 lg:p-6 xl:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto space-y-6 sm:space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-in-left">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3 text-base-content">
              <UsersIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              Your Friends
            </h2>
            <p className="text-sm sm:text-base text-base-content/60 mt-1 animate-fade-in">Connect and chat with your language learning partners</p>
          </div>
          <div className="stats shadow-lg hover-lift animate-scale-in">
            <div className="stat py-3 px-4 sm:py-4 sm:px-6">
              <div className="stat-title text-xs sm:text-sm">Total Friends</div>
              <div className="stat-value text-primary text-xl sm:text-2xl lg:text-3xl">{allFriends.length}</div>
            </div>
          </div>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg animate-pulse-gentle" />
          </div>
        ) : allFriends.length === 0 ? (
          <div className="animate-fade-in">
            <NoFriendsFound />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {allFriends.map((friend, index) => (
              <div key={friend._id} className="card-animate" style={{ animationDelay: `${index * 0.1}s` }}>
                <FriendCard friend={friend} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;