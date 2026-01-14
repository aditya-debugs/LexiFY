import express from "express";
import { protectRoutes } from "../middleware/auth.middleware.js";
import {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendReqs,
  updateProfile,
  searchUsers,
  generateAvatarsForExistingUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoutes); //apply auth middleware to all Rotes

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.get("/search", searchUsers);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

router.put("/profile", updateProfile);
router.post("/generate-avatars", generateAvatarsForExistingUsers);

export default router;
