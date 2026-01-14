import DailyWord from "../models/DailyWord.js";
import User from "../models/User.js";

/**
 * Check if two dates are consecutive calendar days in UTC
 */
const areConsecutiveDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Normalize to UTC midnight
  d1.setUTCHours(0, 0, 0, 0);
  d2.setUTCHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
};

/**
 * Check if two dates are the same calendar day in UTC
 */
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
};

/**
 * Update user's streak count based on posting pattern
 */
export const updateStreakForUser = async (userId, now = new Date()) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);

  if (!user.lastStreakDate) {
    // First time posting
    user.streakCount = 1;
    user.lastStreakDate = today;
  } else if (isSameDay(user.lastStreakDate, today)) {
    // Already posted today, keep streak unchanged
    // User is replacing their status
  } else if (areConsecutiveDays(user.lastStreakDate, today)) {
    // Posted yesterday, increment streak
    user.streakCount += 1;
    user.lastStreakDate = today;
  } else {
    // Gap in posting, reset streak
    user.streakCount = 1;
    user.lastStreakDate = today;
  }

  await user.save();
  return {
    streakCount: user.streakCount,
    lastStreakDate: user.lastStreakDate,
  };
};

/**
 * Create or replace active Daily Word
 */
export const createDailyWord = async (req, res) => {
  try {
    const { word, meaning, language, visibility = "friends" } = req.body;
    const userId = req.user._id;

    // Validation
    if (!word || !meaning || !language) {
      return res.status(400).json({ message: "Word, meaning, and language are required" });
    }

    if (word.length > 50) {
      return res.status(400).json({ message: "Word must be 50 characters or less" });
    }

    if (meaning.length > 500) {
      return res.status(400).json({ message: "Meaning must be 500 characters or less" });
    }

    if (!["friends", "public", "close"].includes(visibility)) {
      return res.status(400).json({ message: "Invalid visibility option" });
    }

    // Delete any existing active status for this user
    await DailyWord.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Update streak
    const streakInfo = await updateStreakForUser(userId);

    // Create new status
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const dailyWord = await DailyWord.create({
      userId,
      word: word.trim(),
      meaning: meaning.trim(),
      language: language.trim(),
      visibility,
      createdAt: now,
      expiresAt,
      isActive: true,
    });

    const populatedWord = await DailyWord.findById(dailyWord._id)
      .populate("userId", "username fullName profilePic");

    // Emit socket event (implement in your socket handler)
    if (req.io) {
      req.io.emit("status:created", {
        dailyWord: populatedWord,
        userId,
      });
    }

    res.status(201).json({
      dailyWord: populatedWord,
      streak: streakInfo,
    });
  } catch (error) {
    console.error("Error creating daily word:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get feed of visible active statuses
 */
export const getDailyWordFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    // Build query based on visibility rules
    const now = new Date();
    const query = {
      isActive: true,
      expiresAt: { $gt: now },
      $or: [
        { visibility: "public" },
        {
          visibility: "friends",
          userId: { $in: currentUser.friends },
        },
        {
          visibility: "close",
          userId: { $in: currentUser.friends },
          // Additional check: user must be in poster's closeFriends
        },
        // Include user's own status
        { userId: currentUserId },
      ],
    };

    let dailyWords = await DailyWord.find(query)
      .populate("userId", "username fullName profilePic streakCount")
      .populate("viewers.userId", "username fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    // Filter close visibility manually (complex query)
    dailyWords = await Promise.all(
      dailyWords.map(async (dw) => {
        if (dw.visibility === "close" && dw.userId._id.toString() !== currentUserId.toString()) {
          const poster = await User.findById(dw.userId._id);
          if (!poster.closeFriends.some((id) => id.toString() === currentUserId.toString())) {
            return null;
          }
        }
        return dw;
      })
    );

    dailyWords = dailyWords.filter(Boolean);

    // Add "hasViewed" flag for current user
    const feedWithViewStatus = dailyWords.map((dw) => {
      const hasViewed = dw.viewers.some(
        (v) => v.userId._id.toString() === currentUserId.toString()
      );
      return {
        ...dw.toObject(),
        hasViewed,
        viewerCount: dw.viewers.length,
      };
    });

    res.json({ dailyWords: feedWithViewStatus });
  } catch (error) {
    console.error("Error fetching daily word feed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Record a view on a Daily Word
 */
export const viewDailyWord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const dailyWord = await DailyWord.findById(id);
    if (!dailyWord || !dailyWord.isActive) {
      return res.status(404).json({ message: "Daily Word not found" });
    }

    // Check if already viewed
    const alreadyViewed = dailyWord.viewers.some(
      (v) => v.userId.toString() === userId.toString()
    );

    if (!alreadyViewed) {
      dailyWord.viewers.push({
        userId,
        viewedAt: new Date(),
      });
      await dailyWord.save();

      // Emit view event to poster
      if (req.io) {
        req.io.to(dailyWord.userId.toString()).emit("status:view", {
          statusId: id,
          viewerId: userId,
          viewedAt: new Date(),
        });
      }
    }

    res.json({ message: "View recorded", viewerCount: dailyWord.viewers.length });
  } catch (error) {
    console.error("Error recording view:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Reply to a Daily Word (adds reply + sends private message)
 */
export const replyToDailyWord = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (message.length > 500) {
      return res.status(400).json({ message: "Message must be 500 characters or less" });
    }

    const dailyWord = await DailyWord.findById(id);
    if (!dailyWord || !dailyWord.isActive) {
      return res.status(404).json({ message: "Daily Word not found" });
    }

    // Add reply to status
    const reply = {
      fromUserId: userId,
      message: message.trim(),
      createdAt: new Date(),
    };

    dailyWord.replies.push(reply);
    await dailyWord.save();

    // Emit reply event to poster
    if (req.io) {
      req.io.to(dailyWord.userId.toString()).emit("status:reply", {
        statusId: id,
        reply: {
          ...reply,
          fromUser: req.user,
        },
      });
    }

    // Optional: Create a private chat message to poster
    // (You can integrate with your existing chat system here)

    res.json({ message: "Reply sent", reply });
  } catch (error) {
    console.error("Error replying to daily word:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete user's active Daily Word
 */
export const deleteDailyWord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const dailyWord = await DailyWord.findById(id);
    if (!dailyWord) {
      return res.status(404).json({ message: "Daily Word not found" });
    }

    // Only poster can delete
    if (dailyWord.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    dailyWord.isActive = false;
    await dailyWord.save();

    res.json({ message: "Daily Word deleted" });
  } catch (error) {
    console.error("Error deleting daily word:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get current user's active Daily Word
 */
export const getMyActiveDailyWord = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const activeDailyWord = await DailyWord.findOne({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("viewers.userId", "username fullName profilePic")
      .populate("replies.fromUserId", "username fullName profilePic");

    res.json({
      status: activeDailyWord,
      streakCount: user.streakCount || 0,
      lastStreakDate: user.lastStreakDate,
    });
  } catch (error) {
    console.error("Error fetching my daily word:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get a specific Daily Word by ID with full details
 */
export const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const dailyWord = await DailyWord.findOne({
      _id: id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("userId", "username fullName profilePic")
      .populate("viewers.userId", "username fullName profilePic")
      .populate("replies.fromUserId", "username fullName profilePic");

    if (!dailyWord) {
      return res.status(404).json({ message: "Daily Word not found or expired" });
    }

    // Check visibility permissions
    const isOwner = dailyWord.userId._id.toString() === userId.toString();
    
    if (!isOwner) {
      const user = await User.findById(userId);
      const poster = await User.findById(dailyWord.userId._id);

      if (dailyWord.visibility === "friends") {
        const areFriends = user.friends.some(
          (friendId) => friendId.toString() === dailyWord.userId._id.toString()
        );
        if (!areFriends) {
          return res.status(403).json({ message: "Not authorized to view this Daily Word" });
        }
      } else if (dailyWord.visibility === "close") {
        const isCloseFriend = poster.closeFriends?.some(
          (friendId) => friendId.toString() === userId.toString()
        );
        if (!isCloseFriend) {
          return res.status(403).json({ message: "Not authorized to view this Daily Word" });
        }
      }
    }

    res.json(dailyWord);
  } catch (error) {
    console.error("Error fetching daily word:", error);
    res.status(500).json({ message: "Server error" });
  }
};
