import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getLearningGoalById } from "../lib/api";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Lock,
  Loader2,
  Trophy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

/**
 * GoalDetailPage
 * Shows the progress of a shared learning goal
 * and allows users to take daily quizzes
 */
export default function GoalDetailPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const data = await getLearningGoalById(goalId);
      setGoal(data);
    } catch (error) {
      console.error("Error fetching goal:", error);
      toast.error("Failed to load goal");
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

  if (!goal) {
    return null;
  }

  const isCreator = goal.creator._id === authUser?._id;
  const partner = isCreator ? goal.partner : goal.creator;
  const currentDay =
    Math.floor(
      (Date.now() - new Date(goal.startedAt).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

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
            Back
          </button>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={partner.profilePic || "/default-avatar.png"}
              alt={partner.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">
                Learning with {partner.fullName}
              </h1>
              <p className="text-base-content/70">
                {goal.duration}-day challenge
              </p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-base-200 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-base-content/70 mb-1">You</p>
              <p className="text-2xl font-bold text-primary">
                {
                  goal.progress.filter((p) =>
                    isCreator
                      ? p.creatorCompletion.completed
                      : p.partnerCompletion.completed
                  ).length
                }
              </p>
              <p className="text-sm text-base-content/70">days completed</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-base-content/70 mb-1">
                {partner.fullName}
              </p>
              <p className="text-2xl font-bold text-success">
                {
                  goal.progress.filter((p) =>
                    isCreator
                      ? p.partnerCompletion.completed
                      : p.creatorCompletion.completed
                  ).length
                }
              </p>
              <p className="text-sm text-base-content/70">days completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-base-300 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-success h-3 rounded-full transition-all"
              style={{
                width: `${
                  (goal.progress.filter(
                    (p) =>
                      p.creatorCompletion.completed &&
                      p.partnerCompletion.completed
                  ).length /
                    goal.duration) *
                  100
                }%`,
              }}
            ></div>
          </div>
          <p className="text-center text-sm text-base-content/70 mt-2">
            {
              goal.progress.filter(
                (p) =>
                  p.creatorCompletion.completed && p.partnerCompletion.completed
              ).length
            }{" "}
            / {goal.duration} days completed together
          </p>
        </div>

        {/* Daily Quizzes */}
        <div className="bg-base-200 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Quizzes
          </h2>

          {/* Take Quiz Button */}
          {currentDay <= goal.duration && (
            <div className="mb-6">
              <button
                onClick={() =>
                  navigate(`/learning-goals/${goalId}/quiz?day=${currentDay}`)
                }
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Take Day {currentDay} Quiz
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
            {goal.progress.map((dayProgress) => {
              const myCompletion = isCreator
                ? dayProgress.creatorCompletion
                : dayProgress.partnerCompletion;
              const partnerCompletion = isCreator
                ? dayProgress.partnerCompletion
                : dayProgress.creatorCompletion;
              const isUnlocked = dayProgress.day <= currentDay;
              const bothCompleted =
                myCompletion.completed && partnerCompletion.completed;

              return (
                <button
                  key={dayProgress.day}
                  onClick={() =>
                    isUnlocked &&
                    navigate(
                      `/learning-goals/${goalId}/quiz?day=${dayProgress.day}`
                    )
                  }
                  disabled={!isUnlocked}
                  className={`relative aspect-square rounded-lg p-3 font-semibold transition-all ${
                    bothCompleted
                      ? "badge-success bg-success/20"
                      : myCompletion.completed
                      ? "badge-primary bg-primary/20"
                      : isUnlocked
                      ? "bg-base-300 hover:bg-base-100"
                      : "bg-base-100 text-base-content/40 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm mb-1">Day</div>
                  <div className="text-xl">{dayProgress.day}</div>
                  {bothCompleted && (
                    <CheckCircle className="w-4 h-4 absolute top-1 right-1" />
                  )}
                  {!isUnlocked && (
                    <Lock className="w-4 h-4 absolute top-1 right-1" />
                  )}
                  {myCompletion.completed && !bothCompleted && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                  {partnerCompletion.completed && !myCompletion.completed && (
                    <div className="absolute bottom-1 left-1 w-2 h-2 bg-success rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-base-content/70">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/20 rounded"></div>
              <span>Both completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/20 rounded"></div>
              <span>You completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-base-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-base-100 rounded"></div>
              <span>Locked</span>
            </div>
          </div>
        </div>

        {/* View Summary Button */}
        {goal.status === "completed" && (
          <button
            onClick={() => navigate(`/learning-goals/${goalId}/summary`)}
            className="mt-6 btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            View Goal Summary
          </button>
        )}
      </div>
    </div>
  );
}
