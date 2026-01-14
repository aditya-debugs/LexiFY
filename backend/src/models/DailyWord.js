import mongoose from "mongoose";

const dailyWordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["friends", "public", "close"],
      default: "friends",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    viewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replies: [
      {
        fromUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index for auto-deletion after expiration
dailyWordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient queries
dailyWordSchema.index({ visibility: 1, createdAt: -1 });
dailyWordSchema.index({ userId: 1, isActive: 1 });

const DailyWord = mongoose.model("DailyWord", dailyWordSchema);

export default DailyWord;
