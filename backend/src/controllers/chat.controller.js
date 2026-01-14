import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // Ensure the Stream user exists/upserted before creating a token.
    // Use the same id that the frontend uses (Mongo _id string).
    const userId = req.user.id;

    const userData = {
      id: userId,
      name: req.user.fullName || req.user.name || "",
      image: req.user.profilePic || "",
    };

    // Upsert the Stream user so Stream has the user object available.
    await upsertStreamUser(userData);

    const token = generateStreamToken(userId);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message || error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
