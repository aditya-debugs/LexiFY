import pkg from 'stream-chat';
const {StreamChat} = pkg;
import "dotenv/config";

const apikey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apikey || !apiSecret) {
    console.error("STREAM_API_KEY and STREAM_API_SECRET is missing");
}

const streamClient = StreamChat.getInstance(apikey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        // StreamChat.upsertUser expects a plain user object like { id, name, image }
        // Do not nest it under another key.
        const res = await streamClient.upsertUser(userData);
        return res;
    } catch (error) {
        console.error("Error creating/upserting Stream user:", error);
        throw error;
    }
};

export const generateStreamToken = (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};