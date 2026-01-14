import SharedLearningGoal from "../models/SharedLearningGoal.js";
import User from "../models/User.js";
import { createNotification } from "./notification.controller.js";
import { generateQuizWithGemini, generateFallbackQuiz } from "../lib/gemini.js";

/**
 * Generate a daily quiz using Gemini API
 * Returns separate quizzes for creator and partner in their respective languages
 */
async function generateDailyQuizForBothUsers(
  dayNumber,
  duration,
  creatorData,
  partnerData
) {
  try {
    // Use Gemini to generate quiz
    const { creatorQuiz, partnerQuiz } = await generateQuizWithGemini(
      dayNumber,
      duration,
      creatorData,
      partnerData
    );

    return { creatorQuiz, partnerQuiz };
  } catch (error) {
    console.error("Gemini quiz generation failed, using fallback:", error);
    // Fallback to basic questions if Gemini fails
    const creatorQuiz = generateFallbackQuiz(
      dayNumber,
      creatorData.learningLanguage,
      creatorData.nativeLanguage
    );
    const partnerQuiz = generateFallbackQuiz(
      dayNumber,
      partnerData.learningLanguage,
      partnerData.nativeLanguage
    );
    return { creatorQuiz, partnerQuiz };
  }
}

/**
 * Create a new shared learning goal
 * POST /api/learning-goals/create
 */
export async function createLearningGoal(req, res) {
  try {
    const { partnerId, duration } = req.body;
    const creatorId = req.user.id;

    // Validation
    if (!partnerId || !duration) {
      return res
        .status(400)
        .json({ message: "Partner and duration are required" });
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum < 3 || durationNum > 30) {
      return res
        .status(400)
        .json({ message: "Duration must be between 3 and 30 days" });
    }

    if (partnerId === creatorId) {
      return res
        .status(400)
        .json({ message: "Cannot create a goal with yourself" });
    }

    // Check if users exist and are friends
    const [creator, partner] = await Promise.all([
      User.findById(creatorId),
      User.findById(partnerId),
    ]);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Check if they have active goals together
    const existingGoal = await SharedLearningGoal.findOne({
      $or: [
        { creator: creatorId, partner: partnerId },
        { creator: partnerId, partner: creatorId },
      ],
      status: { $in: ["pending", "active"] },
    });

    if (existingGoal) {
      return res.status(400).json({
        message: "You already have an active or pending goal with this user",
      });
    }

    // Create the goal with empty progress array (will be populated when accepted)
    const learningGoal = new SharedLearningGoal({
      creator: creatorId,
      partner: partnerId,
      creatorNativeLanguage: creator.nativeLanguage || "English",
      partnerNativeLanguage: partner.nativeLanguage || "English",
      duration: Number(duration),
      creatorLanguage: creator.learningLanguage || "English",
      partnerLanguage: partner.learningLanguage || "English",
      status: "pending",
    });

    await learningGoal.save();

    // Create notification for the partner (goal invite)
    await createNotification({
      recipient: partnerId,
      sender: creatorId,
      type: "goal_invite",
      title: "New Learning Goal Invitation",
      message: `${creator.fullName} invited you to a ${duration}-day learning goal!`,
      learningGoal: learningGoal._id,
    });

    // Populate user details for response
    await learningGoal.populate([
      {
        path: "creator",
        select: "fullName username profilePic learningLanguage",
      },
      {
        path: "partner",
        select: "fullName username profilePic learningLanguage",
      },
    ]);

    res.status(201).json(learningGoal);
  } catch (error) {
    console.log("Error in createLearningGoal:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Accept a learning goal invitation
 * POST /api/learning-goals/:goalId/accept
 */
export async function acceptLearningGoal(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    const goal = await SharedLearningGoal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Only the partner can accept
    if (goal.partner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the invited partner can accept" });
    }

    if (goal.status !== "pending") {
      return res.status(400).json({ message: "Goal is not pending" });
    }

    // Get user languages for quiz generation
    const [creator, partner] = await Promise.all([
      User.findById(goal.creator),
      User.findById(goal.partner),
    ]);

    const creatorData = {
      learningLanguage: creator.learningLanguage || "English",
      nativeLanguage: creator.nativeLanguage || "English",
    };

    const partnerData = {
      learningLanguage: partner.learningLanguage || "English",
      nativeLanguage: partner.nativeLanguage || "English",
    };

    // Generate quizzes for all days using Gemini
    const progress = [];
    for (let day = 1; day <= goal.duration; day++) {
      const { creatorQuiz, partnerQuiz } = await generateDailyQuizForBothUsers(
        day,
        goal.duration,
        creatorData,
        partnerData
      );

      progress.push({
        day,
        creatorQuiz,
        partnerQuiz,
        creatorCompletion: {
          completed: false,
          answers: [],
        },
        partnerCompletion: {
          completed: false,
          answers: [],
        },
      });
    }

    // Activate the goal
    goal.status = "active";
    goal.startedAt = new Date();
    goal.endDate = new Date(Date.now() + goal.duration * 24 * 60 * 60 * 1000);
    goal.progress = progress;

    // Store current languages for future reference
    goal.creatorNativeLanguage = creatorData.nativeLanguage;
    goal.partnerNativeLanguage = partnerData.nativeLanguage;

    await goal.save();

    await goal.populate([
      {
        path: "creator",
        select: "fullName username profilePic learningLanguage",
      },
      {
        path: "partner",
        select: "fullName username profilePic learningLanguage",
      },
    ]);

    // Create notification for the creator (goal accepted)
    await createNotification({
      recipient: goal.creator._id,
      sender: userId,
      type: "goal_accepted",
      title: "Goal Invitation Accepted",
      message: `${goal.partner.fullName} accepted your learning goal invitation!`,
      learningGoal: goal._id,
    });

    res.status(200).json(goal);
  } catch (error) {
    console.log("Error in acceptLearningGoal:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Decline a learning goal invitation
 * POST /api/learning-goals/:goalId/decline
 */
export async function declineLearningGoal(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    const goal = await SharedLearningGoal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.partner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the invited partner can decline" });
    }

    if (goal.status !== "pending") {
      return res.status(400).json({ message: "Goal is not pending" });
    }

    goal.status = "cancelled";
    await goal.save();

    res.status(200).json({ message: "Goal declined" });
  } catch (error) {
    console.log("Error in declineLearningGoal:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get all learning goals for the current user
 * GET /api/learning-goals
 */
export async function getLearningGoals(req, res) {
  try {
    const userId = req.user.id;

    const goals = await SharedLearningGoal.find({
      $or: [{ creator: userId }, { partner: userId }],
    })
      .populate("creator", "fullName username profilePic learningLanguage")
      .populate("partner", "fullName username profilePic learningLanguage")
      .sort({ createdAt: -1 });

    res.status(200).json(goals);
  } catch (error) {
    console.log("Error in getLearningGoals:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get a specific learning goal by ID
 * GET /api/learning-goals/:goalId
 */
export async function getLearningGoalById(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    const goal = await SharedLearningGoal.findById(goalId)
      .populate("creator", "fullName username profilePic learningLanguage")
      .populate("partner", "fullName username profilePic learningLanguage");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check if user is part of this goal
    if (
      goal.creator._id.toString() !== userId &&
      goal.partner._id.toString() !== userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.log("Error in getLearningGoalById:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get quiz for a specific day
 * GET /api/learning-goals/:goalId/quiz/:day
 */
export async function getDailyQuiz(req, res) {
  try {
    const { goalId, day } = req.params;
    const userId = req.user.id;

    const goal = await SharedLearningGoal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check access
    const isCreator = goal.creator.toString() === userId;
    const isPartner = goal.partner.toString() === userId;

    if (!isCreator && !isPartner) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (goal.status !== "active") {
      return res.status(400).json({ message: "Goal is not active" });
    }

    const dayNumber = Number(day);

    // Check if day is unlocked
    if (!goal.isDayUnlocked(dayNumber)) {
      return res.status(400).json({ message: "This day is not yet unlocked" });
    }

    // Find the progress for this day
    let dayProgress = goal.progress.find((p) => p.day === dayNumber);

    if (!dayProgress) {
      return res.status(404).json({ message: "Quiz not found for this day" });
    }

    // Fetch current user data to check for language changes
    const [creatorUser, partnerUser] = await Promise.all([
      User.findById(goal.creator),
      User.findById(goal.partner),
    ]);

    const currentCreatorLearning = creatorUser.learningLanguage;
    const currentCreatorNative = creatorUser.nativeLanguage || "English";
    const currentPartnerLearning = partnerUser.learningLanguage;
    const currentPartnerNative = partnerUser.nativeLanguage || "English";

    // Check if languages have changed for either user
    const creatorLanguageChanged =
      goal.creatorLanguage !== currentCreatorLearning ||
      (goal.creatorNativeLanguage || "English") !== currentCreatorNative;
    const partnerLanguageChanged =
      goal.partnerLanguage !== currentPartnerLearning ||
      (goal.partnerNativeLanguage || "English") !== currentPartnerNative;

    // If languages changed, regenerate the quiz
    if (creatorLanguageChanged || partnerLanguageChanged) {
      console.log(
        `🔄 Language change detected, regenerating quiz for Day ${dayNumber}`
      );
      console.log(
        `Creator: ${goal.creatorLanguage}/${goal.creatorNativeLanguage} → ${currentCreatorLearning}/${currentCreatorNative}`
      );
      console.log(
        `Partner: ${goal.partnerLanguage}/${goal.partnerNativeLanguage} → ${currentPartnerLearning}/${currentPartnerNative}`
      );

      // Update goal languages
      goal.creatorLanguage = currentCreatorLearning;
      goal.creatorNativeLanguage = currentCreatorNative;
      goal.partnerLanguage = currentPartnerLearning;
      goal.partnerNativeLanguage = currentPartnerNative;

      // Regenerate quiz for this day
      const { creatorQuiz, partnerQuiz } = await generateDailyQuizForBothUsers(
        dayNumber,
        goal.duration,
        {
          learningLanguage: currentCreatorLearning,
          nativeLanguage: currentCreatorNative,
        },
        {
          learningLanguage: currentPartnerLearning,
          nativeLanguage: currentPartnerNative,
        }
      );

      // Update the quiz in progress
      dayProgress.creatorQuiz = creatorQuiz;
      dayProgress.partnerQuiz = partnerQuiz;

      // Save the updated goal
      await goal.save();

      console.log(`✅ Quiz regenerated successfully for Day ${dayNumber}`);
    }

    // Check if already completed
    const completion = isCreator
      ? dayProgress.creatorCompletion
      : dayProgress.partnerCompletion;

    // Get the appropriate quiz based on user role
    const userQuiz = isCreator
      ? dayProgress.creatorQuiz
      : dayProgress.partnerQuiz;

    console.log(
      `📋 Quiz request: Day ${dayNumber}, User: ${
        isCreator ? "creator" : "partner"
      }, Questions: ${userQuiz?.length || 0}`
    );

    // Return quiz questions (without correct answers for security)
    const quizForUser = userQuiz.map((q) => ({
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      concept: q.concept,
    }));

    res.status(200).json({
      day: dayNumber,
      quiz: quizForUser,
      completed: completion.completed,
      score: completion.score,
    });
  } catch (error) {
    console.log("Error in getDailyQuiz:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Submit quiz answers for a specific day
 * POST /api/learning-goals/:goalId/quiz/:day/submit
 */
export async function submitQuiz(req, res) {
  try {
    const { goalId, day } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers must be an array" });
    }

    const goal = await SharedLearningGoal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const isCreator = goal.creator.toString() === userId;
    const isPartner = goal.partner.toString() === userId;

    if (!isCreator && !isPartner) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (goal.status !== "active") {
      return res.status(400).json({ message: "Goal is not active" });
    }

    const dayNumber = Number(day);

    if (!goal.isDayUnlocked(dayNumber)) {
      return res.status(400).json({ message: "This day is not yet unlocked" });
    }

    const dayProgress = goal.progress.find((p) => p.day === dayNumber);

    if (!dayProgress) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const completion = isCreator
      ? dayProgress.creatorCompletion
      : dayProgress.partnerCompletion;

    if (completion.completed) {
      return res
        .status(400)
        .json({ message: "Quiz already completed for this day" });
    }

    // Get the appropriate quiz for scoring
    const userQuiz = isCreator
      ? dayProgress.creatorQuiz
      : dayProgress.partnerQuiz;

    // Calculate score
    let score = 0;
    userQuiz.forEach((question, index) => {
      if (answers[index] !== -1 && answers[index] === question.correctAnswer) {
        score++;
      }
    });

    // Update completion
    completion.completed = true;
    completion.completedAt = new Date();
    completion.score = score;
    completion.answers = answers;

    // Check if goal is now complete
    const allDaysCompleted = goal.progress.every(
      (p) => p.creatorCompletion.completed && p.partnerCompletion.completed
    );

    if (allDaysCompleted) {
      goal.status = "completed";

      // Create completion notifications for both users
      await goal.populate([
        { path: "creator", select: "fullName" },
        { path: "partner", select: "fullName" },
      ]);

      await createNotification({
        recipient: goal.creator._id,
        sender: goal.partner._id,
        type: "goal_completed",
        title: "Learning Goal Completed!",
        message: `You and ${goal.partner.fullName} completed your ${goal.duration}-day learning goal!`,
        learningGoal: goal._id,
      });

      await createNotification({
        recipient: goal.partner._id,
        sender: goal.creator._id,
        type: "goal_completed",
        title: "Learning Goal Completed!",
        message: `You and ${goal.creator.fullName} completed your ${goal.duration}-day learning goal!`,
        learningGoal: goal._id,
      });
    } else {
      // Notify partner that this user completed today's quiz
      await goal.populate([
        { path: "creator", select: "fullName" },
        { path: "partner", select: "fullName" },
      ]);

      const partnerId = isCreator ? goal.partner._id : goal.creator._id;
      const partnerName = isCreator
        ? goal.partner.fullName
        : goal.creator.fullName;
      const currentUserName = isCreator
        ? goal.creator.fullName
        : goal.partner.fullName;

      await createNotification({
        recipient: partnerId,
        sender: userId,
        type: "quiz_completed",
        title: "Partner Completed Quiz",
        message: `${currentUserName} completed today's quiz!`,
        learningGoal: goal._id,
      });
    }

    await goal.save();

    // Return results with correctness for each question
    const results = userQuiz.map((question, index) => ({
      questionIndex: index,
      userAnswer: answers[index],
      correctAnswer: question.correctAnswer,
      isCorrect:
        answers[index] !== -1 && answers[index] === question.correctAnswer,
      wasAnswered: answers[index] !== -1,
    }));

    res.status(200).json({
      score,
      totalQuestions: userQuiz.length,
      completed: true,
      goalCompleted: goal.status === "completed",
      results,
    });
  } catch (error) {
    console.log("Error in submitQuiz:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get goal summary (for completed goals)
 * GET /api/learning-goals/:goalId/summary
 */
export async function getGoalSummary(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    const goal = await SharedLearningGoal.findById(goalId)
      .populate("creator", "fullName username profilePic")
      .populate("partner", "fullName username profilePic");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const isCreator = goal.creator._id.toString() === userId;
    const isPartner = goal.partner._id.toString() === userId;

    if (!isCreator && !isPartner) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Calculate statistics
    let creatorTotalScore = 0;
    let partnerTotalScore = 0;
    let creatorDaysCompleted = 0;
    let partnerDaysCompleted = 0;

    goal.progress.forEach((dayProgress) => {
      if (dayProgress.creatorCompletion.completed) {
        creatorTotalScore += dayProgress.creatorCompletion.score || 0;
        creatorDaysCompleted++;
      }
      if (dayProgress.partnerCompletion.completed) {
        partnerTotalScore += dayProgress.partnerCompletion.score || 0;
        partnerDaysCompleted++;
      }
    });

    const totalPossibleScore = goal.progress.length * 5; // 5 questions per day

    res.status(200).json({
      goal: {
        duration: goal.duration,
        status: goal.status,
        startedAt: goal.startedAt,
        endDate: goal.endDate,
        creatorLanguage: goal.creatorLanguage,
        partnerLanguage: goal.partnerLanguage,
      },
      creator: {
        user: goal.creator,
        totalScore: creatorTotalScore,
        daysCompleted: creatorDaysCompleted,
        averageScore:
          creatorDaysCompleted > 0
            ? (creatorTotalScore / creatorDaysCompleted).toFixed(1)
            : 0,
      },
      partner: {
        user: goal.partner,
        totalScore: partnerTotalScore,
        daysCompleted: partnerDaysCompleted,
        averageScore:
          partnerDaysCompleted > 0
            ? (partnerTotalScore / partnerDaysCompleted).toFixed(1)
            : 0,
      },
      totalPossibleScore,
    });
  } catch (error) {
    console.log("Error in getGoalSummary:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Delete/Leave a learning goal
 * DELETE /api/learning-goals/:goalId
 */
export async function deleteLeaveGoal(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    const goal = await SharedLearningGoal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check if user is part of this goal
    const isCreator = goal.creator.toString() === userId;
    const isPartner = goal.partner.toString() === userId;

    if (!isCreator && !isPartner) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete the goal
    await SharedLearningGoal.findByIdAndDelete(goalId);

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.log("Error in deleteLeaveGoal:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
