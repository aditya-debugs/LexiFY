import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getLearningGoals,
  acceptLearningGoal,
  declineLearningGoal,
  deleteLearningGoal,
} from "../lib/api";
import {
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Trophy,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

/**
 * LearningGoalsPage
 * Displays all learning goals for the current user
 * Shows pending invitations, active goals, and completed goals
 */
export default function LearningGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingGoal, setProcessingGoal] = useState(null);
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getLearningGoals();
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load learning goals");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (goalId) => {
    try {
      setProcessingGoal(goalId);
      await acceptLearningGoal(goalId);
      toast.success("Goal accepted! Let's start learning together! 🎉");
      fetchGoals();
    } catch (error) {
      console.error("Error accepting goal:", error);
      toast.error("Failed to accept goal");
    } finally {
      setProcessingGoal(null);
    }
  };

  const handleDecline = async (goalId) => {
    try {
      setProcessingGoal(goalId);
      await declineLearningGoal(goalId);
      toast.success("Goal declined");
      fetchGoals();
    } catch (error) {
      console.error("Error declining goal:", error);
      toast.error("Failed to decline goal");
    } finally {
      setProcessingGoal(null);
    }
  };

  const handleDelete = async (goalId, e) => {
    if (e) e.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to leave this goal? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setProcessingGoal(goalId);
      await deleteLearningGoal(goalId);
      toast.success("Goal deleted successfully");
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    } finally {
      setProcessingGoal(null);
    }
  };

  // Separate goals by status
  const pendingGoals = goals.filter((g) => g.status === "pending");
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shared Learning Goals</h1>
          <p className="text-base-content/70">
            Learn together with your friends, even in different languages
          </p>
        </div>

        {/* Pending Invitations */}
        {pendingGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Invitations
            </h2>
            <div className="space-y-4">
              {pendingGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  authUser={authUser}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  processing={processingGoal === goal._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Active Goals
            </h2>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  authUser={authUser}
                  onClick={() => navigate(`/learning-goals/${goal._id}`)}
                  onDelete={handleDelete}
                  processing={processingGoal === goal._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" />
              Completed Goals
            </h2>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  authUser={authUser}
                  onClick={() =>
                    navigate(`/learning-goals/${goal._id}/summary`)
                  }
                  onDelete={handleDelete}
                  processing={processingGoal === goal._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
            <h3 className="text-xl font-semibold mb-2">
              No Learning Goals Yet
            </h3>
            <p className="text-base-content/70 mb-6">
              Start your first shared learning goal with a friend!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * GoalCard Component
 * Displays a single learning goal with relevant actions
 */
function GoalCard({
  goal,
  authUser,
  onAccept,
  onDecline,
  onDelete,
  processing,
  onClick,
}) {
  const isCreator = authUser && goal.creator._id === authUser._id;
  const partner = isCreator ? goal.partner : goal.creator;
  const isPending = goal.status === "pending";
  const isActive = goal.status === "active";
  const isCompleted = goal.status === "completed";

  // Get the correct languages to display
  const yourLanguage = isCreator
    ? goal.creator.learningLanguage
    : goal.partner.learningLanguage;
  const partnerLanguage = isCreator
    ? goal.partner.learningLanguage
    : goal.creator.learningLanguage;

  // Show accept/decline buttons only if user is the partner (not the creator)
  const showActions = isPending && !isCreator && onAccept && onDecline;

  // Calculate progress if active
  let progressPercentage = 0;
  let daysCompleted = 0;
  if (isActive && goal.progress) {
    daysCompleted = goal.progress.filter(
      (p) => p.creatorCompletion.completed && p.partnerCompletion.completed
    ).length;
    progressPercentage = (daysCompleted / goal.duration) * 100;
  }

  return (
    <div
      className={`bg-base-200 rounded-lg shadow-md p-6 ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={partner.profilePic || "/default-avatar.png"}
            alt={partner.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-lg">{partner.fullName}</h3>
            <p className="text-sm text-base-content/70">@{partner.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-base-content/70">
              <Calendar className="w-4 h-4" />
              {goal.duration} days
            </div>
          </div>
          {onDelete && (
            <button
              onClick={(e) => onDelete(goal._id, e)}
              disabled={processing}
              className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete goal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-4 flex gap-4 text-sm">
        <div>
          <span className="text-base-content/70">Your Language: </span>
          <span className="font-medium">{yourLanguage || "Not set"}</span>
        </div>
        <div>
          <span className="text-base-content/70">Partner's Language: </span>
          <span className="font-medium">{partnerLanguage || "Not set"}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {isPending && (
          <span className="badge badge-warning gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )}
        {isActive && (
          <span className="badge badge-primary gap-1">
            <Users className="w-3 h-3" />
            Active
          </span>
        )}
        {isCompleted && (
          <span className="badge badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      {/* Progress Bar for Active Goals */}
      {isActive && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-base-content/70">Progress</span>
            <span className="font-medium">
              {daysCompleted} / {goal.duration} days
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Actions for Pending Goals */}
      {isPending && isCreator && (
        <div className="mt-4 text-center py-2 px-4 bg-warning/10 rounded-lg">
          <p className="text-sm text-warning">
            Waiting for {partner.fullName} to accept the invitation
          </p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept(goal._id);
            }}
            disabled={processing}
            className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Accepting..." : "Accept"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDecline(goal._id);
            }}
            disabled={processing}
            className="flex-1 btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Declining..." : "Decline"}
          </button>
        </div>
      )}
    </div>
  );
}
