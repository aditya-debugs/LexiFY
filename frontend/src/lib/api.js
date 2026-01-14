import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export async function updateUserProfile(profileData) {
  const response = await axiosInstance.put("/users/profile", profileData);
  return response.data;
}

export async function searchUsers(query) {
  const response = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}`);
  return response.data;
}

// ===== Daily Word Status API =====

export async function createDailyWord(data) {
  const response = await axiosInstance.post("/status", data);
  return response.data;
}

export async function getDailyWordFeed() {
  const response = await axiosInstance.get("/status/feed");
  return response.data;
}

export async function getMyActiveDailyWord() {
  const response = await axiosInstance.get("/status/my-active");
  return response.data;
}

export async function viewDailyWord(statusId) {
  const response = await axiosInstance.post(`/status/${statusId}/view`);
  return response.data;
}

export async function replyToDailyWord(statusId, message) {
  const response = await axiosInstance.post(`/status/${statusId}/reply`, { message });
  return response.data;
}

export async function deleteDailyWord(statusId) {
  const response = await axiosInstance.delete(`/status/${statusId}`);
  return response.data;
}

export async function getStatusById(statusId) {
  const response = await axiosInstance.get(`/status/${statusId}`);
  return response.data;
}

// ===== Translation API =====

export async function translateMessage(text, targetLanguage) {
  const response = await axiosInstance.post('/translate', { text, targetLanguage });
  return response.data;
}
