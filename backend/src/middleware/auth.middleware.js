import { getFirebaseAdmin } from "../config/firebase.js";
import User from "../models/User.js";

export const protectRoutes = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - NO TOKEN PROVIDED" });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - NO TOKEN PROVIDED" });
    }

    // Verify Firebase token
    const admin = getFirebaseAdmin();
    if (!admin) {
      return res.status(500).json({ message: "Firebase not initialized" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized - INVALID TOKEN" });
    }

    // Find user by Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid }).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - USER NOT FOUND" });
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Error in protectRoutes middleware:", error);
    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ message: "Token expired - please login again" });
    }
    if (error.code === "auth/argument-error") {
      return res.status(401).json({ message: "Invalid token format" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
