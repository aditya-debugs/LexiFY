import { useState, useRef, useEffect } from 'react';
import { Search, X, User, MessageCircle, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { searchUsers, sendFriendRequest } from '../lib/api';
import toast from 'react-hot-toast';
import Portal from './Portal';

const SearchUsers = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Focus input when modal opens and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setDebouncedQuery('');
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users query
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['searchUsers', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  // Send friend request mutation
  const { mutate: sendFriendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries(['searchUsers']);
      queryClient.invalidateQueries(['outgoingFriendRequests']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    },
  });

  const handleSendFriendRequest = (userId) => {
    sendFriendRequestMutation(userId);
  };

  const handleStartChat = (user) => {
    navigate(`/chat/${user._id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 z-[9998] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Search Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pointer-events-none animate-fade-in">
        <div className="bg-base-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in border-2 border-base-300/50 overflow-hidden pointer-events-auto">
          {/* Search Header */}
          <div className="p-5 sm:p-6 border-b-2 border-primary/20 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl sm:rounded-2xl flex-shrink-0 shadow-lg">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Search Users
              </h2>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle ml-auto hover:bg-error/10 hover:text-error hover:rotate-90 transition-all shadow-sm"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/60 z-10" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or username..."
                className="input input-bordered w-full pl-12 pr-4 h-12 text-sm sm:text-base focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none bg-base-100 transition-all rounded-xl shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
            {searchQuery.length < 2 ? (
              <div className="p-8 sm:p-12 text-center text-base-content/60">
                <div className="p-4 bg-primary/5 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 text-primary/40" />
                </div>
                <p className="text-sm sm:text-base font-medium text-base-content/70">Type at least 2 characters to search</p>
                <p className="text-xs sm:text-sm text-base-content/50 mt-2">Search for friends by name or username</p>
              </div>
            ) : isLoading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="loading loading-spinner loading-lg mx-auto mb-4 text-primary"></div>
                <p className="text-sm sm:text-base text-base-content/60">Searching...</p>
              </div>
            ) : error ? (
              <div className="p-8 sm:p-12 text-center text-error">
                <p className="text-sm sm:text-base font-medium">Failed to search users</p>
                <p className="text-xs sm:text-sm mt-2">Please try again</p>
              </div>
            ) : searchResults?.users?.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-base-content/60">
                <div className="p-4 bg-base-300/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-base-content/30" />
                </div>
                <p className="text-sm sm:text-base font-medium text-base-content/70">No users found</p>
                <p className="text-xs sm:text-sm text-base-content/50 mt-2">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-3">
                {searchResults?.users?.map((user, index) => (
                  <div
                    key={user._id}
                    className="p-4 sm:p-5 rounded-2xl bg-base-100 hover:bg-base-300/50 transition-all duration-300 border-2 border-primary/10 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="avatar flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-primary/50 ring-offset-2 ring-offset-base-100 hover:ring-4 hover:ring-primary transition-all shadow-lg">
                          <img 
                            src={user.profilePic} 
                            alt={user.fullName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm sm:text-base truncate text-base-content">
                            {user.fullName}
                          </h4>
                          {user.isFriend && (
                            <span className="badge badge-primary badge-xs sm:badge-sm">Friend</span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-base-content/60 truncate mb-2">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 mb-2">
                            {user.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          {user.nativeLanguage && (
                            <span className="badge badge-sm bg-gradient-to-r from-success/20 to-success/10 text-success border border-success/40 gap-1 font-medium px-2 py-2">
                              <span className="text-xs">🗣️</span>
                              <span className="text-[10px] sm:text-xs">N: {user.nativeLanguage}</span>
                            </span>
                          )}
                          {user.learningLanguage && (
                            <span className="badge badge-sm bg-gradient-to-r from-info/20 to-info/10 text-info border border-info/40 gap-1 font-medium px-2 py-2">
                              <span className="text-xs">📚</span>
                              <span className="text-[10px] sm:text-xs">L: {user.learningLanguage}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {user.isFriend ? (
                          <button
                            onClick={() => handleStartChat(user)}
                            className="btn btn-success btn-xs sm:btn-sm gap-1.5 sm:gap-2 min-w-[70px] sm:min-w-[90px] shadow-lg hover:shadow-success/50 hover:scale-105 transition-all"
                            title="Start chat"
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Chat</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendFriendRequest(user._id)}
                            className="btn btn-primary btn-xs sm:btn-sm gap-1.5 sm:gap-2 min-w-[70px] sm:min-w-[90px] shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all"
                            title="Send friend request"
                          >
                            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {searchResults?.users?.length > 0 && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-base-200/30 to-base-300/20 text-center border-t-2 border-base-300/50 flex-shrink-0">
              <p className="text-xs sm:text-sm text-base-content/70 font-medium">
                Found {searchResults.totalResults} user{searchResults.totalResults !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default SearchUsers;