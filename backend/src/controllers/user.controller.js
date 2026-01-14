import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude current user
                { _id: { $nin: currentUser.friends } }, // Exclude current user's friends
                { isOnboarded: true }, // Only include onboarded users
            ]
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
        .select('friends')
        .populate('friends', 'fullName profilePic nativeLanguage learningLanguage');

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}



export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId } = req.params;

        // prevent sending request to yourself
        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send friend request to yourself" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient user not found" });
        }
        
        // Check if they are already friends
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        // Check if a friend request has already been sent
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ],
        });

        if (existingRequest) {
            return res
            .status(400)
            .json({ message: "Friend request already sent to this user" });
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);
    } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        
        // Ensure that only the recipient can accept the request
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request" });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        // Add each other as friends
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: 'pending'
        }).populate('sender', 'fullName profilePic nativeLanguage learningLanguage');

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: 'accepted'
        }).populate('recipient', 'fullName profilePic');

        res.status(200).json({ incomingReqs, acceptedReqs });   
    } catch (error) {
        console.error("Error in getFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingReqs = await FriendRequest.find({
            sender: req.user.id,
            status: 'pending'
        }).populate('recipient', 'fullName profilePic nativeLanguage learningLanguage');

        res.status(200).json(outgoingReqs);   
    } catch (error) {
        console.error("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

        // Validate input - only allow updating specific fields
        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (bio !== undefined) updateData.bio = bio;
        if (nativeLanguage !== undefined) updateData.nativeLanguage = nativeLanguage;
        if (learningLanguage !== undefined) updateData.learningLanguage = learningLanguage;
        if (location !== undefined) updateData.location = location;
        if (profilePic !== undefined) updateData.profilePic = profilePic;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "Profile updated successfully",
            user: updatedUser 
        });
    } catch (error) {
        console.error("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function searchUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const { query } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: "Search query is required" });
        }

        if (query.trim().length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }

        const searchRegex = new RegExp(query.trim(), 'i'); // Case insensitive search

        const users = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude current user
                { isOnboarded: true }, // Only include onboarded users
                {
                    $or: [
                        { fullName: searchRegex },
                        { username: searchRegex },
                        { bio: searchRegex },
                        { nativeLanguage: searchRegex },
                        { learningLanguage: searchRegex },
                        { location: searchRegex }
                    ]
                }
            ]
        })
        .select('fullName username profilePic bio nativeLanguage learningLanguage location friends')
        .limit(20); // Limit results to prevent overwhelming response

        // Add friendship status for each user
        const currentUser = await User.findById(currentUserId).select('friends');
        const usersWithFriendshipStatus = users.map(user => {
            const userObj = user.toObject();
            userObj.isFriend = currentUser.friends.includes(user._id);
            return userObj;
        });

        res.status(200).json({
            users: usersWithFriendshipStatus,
            totalResults: users.length
        });
    } catch (error) {
        console.error("Error in searchUsers controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}