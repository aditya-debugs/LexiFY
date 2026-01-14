import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { getUserFriends, createLearningGoal } from "../lib/api";
import { Users, Calendar, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

/**
 * CreateLearningGoalPage
 * Allows users to create a new shared learning goal
 * by selecting a friend and duration
 */
export default function CreateLearningGoalPage() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [duration, setDuration] = useState(7);
  const [customDuration, setCustomDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthUser();

  // Get pre-selected friend from navigation state
  const preSelectedFriendId = location.state?.friendId;

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const data = await getUserFriends();
      setFriends(data);

      // Auto-select friend if provided via navigation state
      if (preSelectedFriendId) {
        const preSelected = data.find((f) => f._id === preSelectedFriendId);
        if (preSelected) {
          setSelectedFriend(preSelected);
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedFriend) {
      toast.error("Please select a friend");
      return;
    }

    try {
      setCreating(true);
      await createLearningGoal(selectedFriend._id, duration);
      toast.success(
        "Learning goal created! Waiting for your friend to accept 🎯"
      );
      navigate("/learning-goals");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error(error.response?.data?.message || "Failed to create goal");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (preSelectedFriendId) {
                navigate(`/chat/${preSelectedFriendId}`);
              } else {
                navigate("/learning-goals");
              }
            }}
            className="flex items-center gap-2 text-base-content/70 hover:text-base-content mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold mb-2">Create Learning Goal</h1>
          <p className="text-base-content/70">
            Start a shared learning journey with a friend
          </p>
        </div>

        {/* Step 1: Select Friend */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Step 1: Learning Buddy
          </h2>

          {friends.length === 0 ? (
            <div className="bg-base-200 rounded-lg p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-base-content/70 mb-4">
                You don't have any friends yet
              </p>
              <button
                onClick={() => navigate("/friends")}
                className="btn btn-primary"
              >
                Find Friends
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {(preSelectedFriendId
                ? friends.filter((f) => f._id === preSelectedFriendId)
                : friends
              ).map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => setSelectedFriend(friend)}
                  className={`bg-base-200 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedFriend?._id === friend._id
                      ? "ring-2 ring-primary"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.profilePic || "/default-avatar.png"}
                      alt={friend.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{friend.fullName}</h3>
                      <p className="text-sm text-base-content/70">
                        @{friend.username}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-base-content/70">Learning</p>
                      <p className="font-medium text-primary">
                        {friend.learningLanguage || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select Duration */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Step 2: Select Duration
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div
              onClick={() => {
                setDuration(7);
                setCustomDuration("");
              }}
              className={`bg-base-200 rounded-lg p-6 cursor-pointer transition-all text-center ${
                duration === 7 && !customDuration
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <div className="text-3xl font-bold text-primary mb-2">7</div>
              <div className="text-base-content/70">Days</div>
              <div className="text-sm text-base-content/50 mt-2">
                Short & Focused
              </div>
            </div>

            <div
              onClick={() => {
                setDuration(14);
                setCustomDuration("");
              }}
              className={`bg-base-200 rounded-lg p-6 cursor-pointer transition-all text-center ${
                duration === 14 && !customDuration
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <div className="text-3xl font-bold text-primary mb-2">14</div>
              <div className="text-base-content/70">Days</div>
              <div className="text-sm text-base-content/50 mt-2">Balanced</div>
            </div>

            <div
              className={`bg-base-200 rounded-lg p-6 transition-all text-center ${
                customDuration
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <div className="text-lg font-bold text-primary mb-2">Custom</div>
              <input
                type="number"
                min="3"
                max="30"
                value={customDuration}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomDuration(value);
                  if (value && parseInt(value) >= 3 && parseInt(value) <= 30) {
                    setDuration(parseInt(value));
                  }
                }}
                placeholder="Days"
                className="input input-bordered w-full text-center"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-sm text-base-content/50 mt-2">3-30 days</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedFriend && (
          <div className="mb-8 bg-primary/10 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Goal Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/70">Partner:</span>
                <span className="font-medium">{selectedFriend.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Duration:</span>
                <span className="font-medium">{duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Your Language:</span>
                <span className="font-medium">
                  {authUser?.learningLanguage || "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">
                  Partner's Language:
                </span>
                <span className="font-medium">
                  {selectedFriend.learningLanguage}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={!selectedFriend || creating}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Create Learning Goal
            </>
          )}
        </button>

        {/* Info Box */}
        <div className="mt-6 bg-base-300 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-sm">How it works:</h4>
          <ul className="text-sm text-base-content/70 space-y-1">
            <li>• Your friend will receive an invitation</li>
            <li>• The goal starts only after they accept</li>
            <li>• Both of you will get daily quizzes</li>
            <li>• Same structure, but in your respective languages</li>
            <li>• Track progress together and celebrate completion!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
