import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { getLearningGoalById, getDailyQuiz, submitQuiz } from "../lib/api";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Trophy,
  XCircle,
  Check,
  X,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

/**
 * QuizPage
 * Dedicated page for taking daily quizzes
 */
export default function QuizPage() {
  const { goalId } = useParams();
  const [searchParams] = useSearchParams();
  const day = parseInt(searchParams.get("day"));
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const [goal, setGoal] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // New state for one-question-at-a-time flow
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!day || isNaN(day)) {
      toast.error("Invalid day");
      navigate(`/learning-goals/${goalId}`);
      return;
    }
    fetchGoalAndQuiz();
  }, [goalId, day]);

  // Timer effect
  useEffect(() => {
    if (quiz && !result && !quiz.completed && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNext(); // Auto-advance when timer expires
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [quiz, result, currentQuestionIndex, timeLeft]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(30);
  }, [currentQuestionIndex]);

  const fetchGoalAndQuiz = async () => {
    try {
      setLoading(true);
      const [goalData, quizData] = await Promise.all([
        getLearningGoalById(goalId),
        getDailyQuiz(goalId, day),
      ]);
      setGoal(goalData);
      setQuiz(quizData);
      setAnswers(new Array(quizData.quiz.length).fill(null));
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
      navigate(`/learning-goals/${goalId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Fill in null for any unanswered questions
    const finalAnswers = answers.map((a) =>
      a === null || a === undefined ? -1 : a
    );

    try {
      setSubmitting(true);
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const data = await submitQuiz(goalId, day, finalAnswers);
      setResult(data);
      toast.success(
        `Quiz completed! Score: ${data.score}/${data.totalQuestions}`
      );
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, submit the quiz
      handleSubmit();
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!goal || !quiz) {
    return null;
  }

  const isCreator = goal.creator._id === authUser?._id;
  const userLanguage = isCreator ? goal.creatorLanguage : goal.partnerLanguage;
  const partner = isCreator ? goal.partner : goal.creator;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/learning-goals/${goalId}`)}
            className="flex items-center gap-2 text-base-content/70 hover:text-base-content mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Goal
          </button>
          <div className="bg-base-200 rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-2">Day {day} Quiz</h1>
            <p className="text-base-content/70">
              Learning with {partner.fullName} • Answer in {userLanguage}
            </p>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="bg-base-200 rounded-lg shadow-md p-6">
          {quiz.completed && !result ? (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-semibold mb-3">Already Completed</h3>
              <p className="text-base-content/70 mb-4">
                You already completed this quiz!
              </p>
              <div className="bg-primary/10 rounded-lg p-4 inline-block">
                <p className="text-3xl font-bold text-primary">
                  {quiz.score} / {quiz.quiz.length}
                </p>
                <p className="text-sm text-base-content/70 mt-1">Your Score</p>
              </div>
              <button
                onClick={() => navigate(`/learning-goals/${goalId}`)}
                className="btn btn-primary mt-6"
              >
                Back to Goal
              </button>
            </div>
          ) : result ? (
            <div>
              {/* Results Summary */}
              <div className="text-center py-8 mb-8">
                <Trophy className="w-20 h-20 mx-auto mb-4 text-warning" />
                <h3 className="text-2xl font-semibold mb-3">Quiz Completed!</h3>
                <div className="bg-gradient-to-r from-primary/10 to-success/10 rounded-lg p-6 inline-block mb-4">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                    {result.score} / {result.totalQuestions}
                  </p>
                  <p className="text-sm text-base-content/70 mt-2">
                    {result.score === result.totalQuestions
                      ? "Perfect score! 🎉"
                      : result.score >= result.totalQuestions * 0.8
                      ? "Great job! 👏"
                      : result.score >= result.totalQuestions * 0.6
                      ? "Good effort! 💪"
                      : "Keep practicing! 📚"}
                  </p>
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">
                        {result.score} Correct
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-red-500" />
                      <span className="font-semibold">
                        {result.totalQuestions - result.score} Wrong
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Results */}
              {result.results && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold mb-4">Your Answers:</h4>
                  <div className="space-y-4">
                    {result.results.map((r, index) => {
                      const question = quiz.quiz[r.questionIndex];
                      return (
                        <div
                          key={index}
                          className={`rounded-lg p-4 border-2 ${
                            !r.wasAnswered
                              ? "bg-base-300 border-base-content/20"
                              : r.isCorrect
                              ? "bg-success/10 border-success"
                              : "bg-error/10 border-error"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {!r.wasAnswered ? (
                              <Clock className="w-6 h-6 text-base-content/50 flex-shrink-0 mt-1" />
                            ) : r.isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                            ) : (
                              <XCircle className="w-6 h-6 text-error flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold mb-2">
                                Question {index + 1}: {question.question}
                              </p>
                              {!r.wasAnswered ? (
                                <p className="text-sm text-base-content/70">
                                  <span className="font-medium">
                                    Not answered
                                  </span>{" "}
                                  (Time expired)
                                </p>
                              ) : (
                                <>
                                  <p className="text-sm mb-1">
                                    <span className="font-medium">
                                      Your answer:
                                    </span>{" "}
                                    <span
                                      className={
                                        r.isCorrect
                                          ? "text-success"
                                          : "text-error"
                                      }
                                    >
                                      {question.options[r.userAnswer]}
                                    </span>
                                  </p>
                                  {!r.isCorrect && (
                                    <p className="text-sm">
                                      <span className="font-medium">
                                        Correct answer:
                                      </span>{" "}
                                      <span className="text-green-700 dark:text-green-400">
                                        {question.options[r.correctAnswer]}
                                      </span>
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/learning-goals/${goalId}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Back to Goal
              </button>
            </div>
          ) : (
            <div>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-base-content/70">
                    Question {currentQuestionIndex + 1} of {quiz.quiz.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`w-4 h-4 ${
                        timeLeft <= 10 ? "text-red-500" : "text-blue-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-bold ${
                        timeLeft <= 10 ? "text-red-500" : "text-blue-500"
                      }`}
                    >
                      {timeLeft}s
                    </span>
                  </div>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (answers.filter((a) => a !== null && a !== undefined)
                          .length /
                          quiz.quiz.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              {quiz.quiz[currentQuestionIndex] && (
                <div className="bg-base-300 rounded-lg p-8 border-2 border-base-content/10 mb-6">
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-semibold flex-shrink-0">
                        {currentQuestionIndex + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-xl mb-3">
                          {quiz.quiz[currentQuestionIndex].question}
                        </p>
                        <span className="text-xs bg-base-300 px-3 py-1 rounded-full">
                          {quiz.quiz[currentQuestionIndex].difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {quiz.quiz[currentQuestionIndex].options.map(
                      (option, oIndex) => (
                        <label
                          key={oIndex}
                          className={`flex items-center gap-4 p-5 rounded-lg cursor-pointer transition-all ${
                            answers[currentQuestionIndex] === oIndex
                              ? "bg-primary text-white border-2 border-primary shadow-lg scale-105"
                              : "bg-base-200 border-2 border-base-content/20 hover:border-primary hover:shadow-md hover:scale-102"
                          }`}
                          onClick={() => handleAnswerSelect(oIndex)}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            checked={answers[currentQuestionIndex] === oIndex}
                            onChange={() => handleAnswerSelect(oIndex)}
                            className="w-5 h-5"
                          />
                          <span className="font-medium text-lg">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Button */}
              <button
                onClick={handleNext}
                disabled={
                  answers[currentQuestionIndex] === null ||
                  answers[currentQuestionIndex] === undefined
                }
                className="btn btn-primary w-full flex items-center justify-center gap-2 text-lg"
              >
                {currentQuestionIndex === quiz.quiz.length - 1 ? (
                  <>
                    Submit Quiz
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => navigate(`/learning-goals/${goalId}`)}
                className="btn btn-ghost w-full mt-3"
              >
                Cancel Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
