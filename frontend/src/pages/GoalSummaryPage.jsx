import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getGoalSummary } from "../lib/api";
import {
  ArrowLeft,
  Trophy,
  Award,
  Calendar,
  Target,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

/**
 * GoalSummaryPage
 * Displays the final summary and statistics of a completed learning goal
 */
export default function GoalSummaryPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [goalId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await getGoalSummary(goalId);
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      toast.error("Failed to load goal summary");
      navigate("/learning-goals");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const isCreator = summary.creator.user._id === authUser?._id;
  const myStats = isCreator ? summary.creator : summary.partner;
  const partnerStats = isCreator ? summary.partner : summary.creator;

  const myCompletionRate =
    (myStats.daysCompleted / summary.goal.duration) * 100;
  const partnerCompletionRate =
    (partnerStats.daysCompleted / summary.goal.duration) * 100;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/learning-goals")}
            className="flex items-center gap-2 text-base-content/70 hover:text-base-content mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Goals
          </button>
        </div>

        {/* Celebration Banner */}
        <div className="bg-gradient-to-r from-primary to-success rounded-lg shadow-xl p-8 text-white text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Goal Completed! 🎉</h1>
          <p className="text-lg opacity-90">
            You and {partnerStats.user.fullName} completed this{" "}
            {summary.goal.duration}-day challenge together!
          </p>
        </div>

        {/* Goal Info */}
        <div className="bg-base-200 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-base-content/70">Duration</p>
              <p className="text-lg font-semibold">
                {summary.goal.duration} Days
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Status</p>
              <p className="text-lg font-semibold text-success">
                {summary.goal.status === "completed"
                  ? "Completed"
                  : "In Progress"}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Started</p>
              <p className="text-lg font-semibold">
                {new Date(summary.goal.startedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Languages</p>
              <p className="text-sm font-medium">
                {summary.goal.creatorLanguage} & {summary.goal.partnerLanguage}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* My Stats */}
          <div className="bg-base-200 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={myStats.user.profilePic || "/default-avatar.png"}
                alt={myStats.user.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{myStats.user.fullName}</h3>
                <p className="text-sm text-base-content/70">You</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Total Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-base-content/70">
                    Total Score
                  </span>
                  <span className="font-semibold">
                    {myStats.totalScore} / {summary.totalPossibleScore}
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (myStats.totalScore / summary.totalPossibleScore) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Days Completed */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-base-content/70">
                    Days Completed
                  </span>
                  <span className="font-semibold">
                    {myStats.daysCompleted} / {summary.goal.duration}
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${myCompletionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Average Score */}
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm text-base-content/70 mb-1">
                  Average Score per Day
                </p>
                <p className="text-2xl font-bold text-primary">
                  {myStats.averageScore} / 5.0
                </p>
              </div>
            </div>
          </div>

          {/* Partner Stats */}
          <div className="bg-base-200 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={partnerStats.user.profilePic || "/default-avatar.png"}
                alt={partnerStats.user.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{partnerStats.user.fullName}</h3>
                <p className="text-sm text-base-content/70">Learning Partner</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Total Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-base-content/70">
                    Total Score
                  </span>
                  <span className="font-semibold">
                    {partnerStats.totalScore} / {summary.totalPossibleScore}
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (partnerStats.totalScore / summary.totalPossibleScore) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Days Completed */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-base-content/70">
                    Days Completed
                  </span>
                  <span className="font-semibold">
                    {partnerStats.daysCompleted} / {summary.goal.duration}
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${partnerCompletionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Average Score */}
              <div className="bg-success/10 rounded-lg p-4">
                <p className="text-sm text-base-content/70 mb-1">
                  Average Score per Day
                </p>
                <p className="text-2xl font-bold text-success">
                  {partnerStats.averageScore} / 5.0
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-base-200 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {myStats.daysCompleted === summary.goal.duration && (
              <div className="flex items-center gap-3 bg-warning/10 rounded-lg p-4">
                <Trophy className="w-8 h-8 text-warning" />
                <div>
                  <p className="font-semibold">Perfect Attendance</p>
                  <p className="text-sm text-base-content/70">
                    Completed all days
                  </p>
                </div>
              </div>
            )}
            {myStats.averageScore >= 4.5 && (
              <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-4">
                <Award className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">High Achiever</p>
                  <p className="text-sm text-base-content/70">
                    Average score above 4.5
                  </p>
                </div>
              </div>
            )}
            {partnerStats.daysCompleted === summary.goal.duration && (
              <div className="flex items-center gap-3 bg-success/10 rounded-lg p-4">
                <Trophy className="w-8 h-8 text-success" />
                <div>
                  <p className="font-semibold">Team Player</p>
                  <p className="text-sm text-base-content/70">
                    Partner completed all days
                  </p>
                </div>
              </div>
            )}
            {myStats.daysCompleted === summary.goal.duration &&
              partnerStats.daysCompleted === summary.goal.duration && (
                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <Award className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="font-semibold">Perfect Sync</p>
                    <p className="text-sm text-base-content/70">
                      Both completed all days
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/learning-goals/${goalId}`)}
            className="btn btn-ghost flex-1"
          >
            View Details
          </button>
          <button
            onClick={() => navigate("/learning-goals/create")}
            className="btn btn-primary flex-1"
          >
            Start New Goal
          </button>
        </div>
      </div>
    </div>
  );
}
