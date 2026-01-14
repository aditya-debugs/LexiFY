import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import { getFirebaseAdmin } from "../config/firebase.js";

export async function signup(req, res) {
  const { email, fullName, username, firebaseUid } = req.body;

  try {
    if (!email || !fullName || !username || !firebaseUid) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (username.length < 3 || username.length > 20) {
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 20 characters" });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res
        .status(400)
        .json({
          message:
            "Username can only contain letters, numbers, and underscores",
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }, { firebaseUid }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({
            message: "Email already exists, please use a different one",
          });
      }
      if (existingUser.username === username.toLowerCase()) {
        return res
          .status(400)
          .json({
            message: "Username is already taken, please choose a different one",
          });
      }
      if (existingUser.firebaseUid === firebaseUid) {
        return res.status(400).json({ message: "User already exists" });
      }
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      firebaseUid,
      email,
      fullName,
      username: username.toLowerCase(),
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error during signup controller :", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ message: "Firebase UID is required" });
    }

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found. Please sign up first." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function logout(req, res) {
  // With Firebase, logout is handled on the client side
  // This endpoint is kept for compatibility
  res.status(200).json({ message: "Logged out successfully" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const {
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePic,
    } = req.body;

    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({
        message: "All fields are required",
        receivedData: req.body,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(
        `Stream user updated after onboarding for ${updatedUser.fullName}`
      );
    } catch (error) {}

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in onboarding controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
