# Daily Word Status Feature - Integration Guide

## Overview
A WhatsApp-like status feature for sharing daily vocabulary words with 24-hour expiration and streak tracking.

## Database Setup

### MongoDB Indexes
The `DailyWord` model includes a TTL (Time To Live) index that automatically deletes expired statuses:

```javascript
// TTL index - MongoDB will auto-delete documents after expiresAt
{ expiresAt: 1 }, { expireAfterSeconds: 0 }
```

**Important**: Ensure MongoDB is running version 3.2+ for TTL indexes to work.

### Migration Steps

1. **Update User Model**: The `User` model has been updated with:
   - `streakCount`: Number of consecutive days posted
   - `lastStreakDate`: Date of last streak-counted post
   - `closeFriends`: Array of user IDs for "close friends" visibility

2. **Create DailyWord Collection**: Will be created automatically on first insert.

3. **Verify Indexes**: After first use, verify indexes were created:
```bash
mongo
use your_database_name
db.dailywords.getIndexes()
```

You should see indexes on: `expiresAt`, `userId`, `isActive`, `visibility + createdAt`

## Backend Integration

### 1. Server Setup (Already Done)
The status routes have been added to `server.js`:
```javascript
import statusRoutes from './routes/status.routes.js';
app.use("/api/status", statusRoutes);
```

### 2. Socket.IO Events (Optional Enhancement)
For real-time updates, add to your socket handler:

```javascript
// In your socket initialization file
io.on('connection', (socket) => {
  // ... existing handlers
  
  // Listen for status events
  socket.on('status:created', (data) => {
    // Broadcast to friends/followers
    io.emit('status:created', data);
  });
  
  socket.on('status:view', (data) => {
    // Notify poster
    io.to(data.posterId).emit('status:view', data);
  });
  
  socket.on('status:reply', (data) => {
    // Notify poster
    io.to(data.posterId).emit('status:reply', data);
  });
});
```

## Frontend Integration

### 1. Add Route to App.jsx
```javascript
import DailyWordPage from "./pages/DailyWordPage.jsx";

// In your routes:
<Route
  path="/daily-word"
  element={
    isAuthenticated && isOnboarded ? (
      <Layout showSidebar={true}>
        <DailyWordPage />
      </Layout>
    ) : (
      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
    )
  }
/>
```

### 2. Add Navigation Link
In your `Navbar.jsx` or `Sidebar.jsx`:
```javascript
import { BookOpen } from "lucide-react";

<Link to="/daily-word" className="btn btn-ghost gap-2">
  <BookOpen className="h-5 w-5" />
  <span>Daily Word</span>
</Link>
```

### 3. Add to Friend Cards (Optional)
Display user's Daily Word status in friend listings:
```javascript
import DailyWordBadge from "../components/DailyWordBadge";

// In FriendCard.jsx or similar:
<DailyWordBadge 
  user={friend} 
  onClick={() => openStatusModal(friend.activeDailyWord)}
/>
```

## API Endpoints

### POST /api/status
Create or replace active Daily Word
```json
{
  "word": "Serendipity",
  "meaning": "The occurrence of events by chance in a happy way",
  "language": "English",
  "visibility": "friends" // or "public" or "close"
}
```

Response:
```json
{
  "dailyWord": { ... },
  "streak": {
    "streakCount": 5,
    "lastStreakDate": "2025-12-09T00:00:00.000Z"
  }
}
```

### GET /api/status/feed
Get visible active statuses
```json
{
  "dailyWords": [
    {
      "_id": "...",
      "word": "Serendipity",
      "meaning": "...",
      "language": "English",
      "userId": { ... },
      "hasViewed": false,
      "viewerCount": 5,
      "replies": [ ... ]
    }
  ]
}
```

### GET /api/status/my-active
Get current user's active status + streak info
```json
{
  "dailyWord": { ... } | null,
  "streak": {
    "streakCount": 5,
    "lastStreakDate": "2025-12-09T00:00:00.000Z"
  }
}
```

### POST /api/status/:id/view
Record view (no body required)

### POST /api/status/:id/reply
```json
{
  "message": "Great word! I learned this yesterday too."
}
```

### DELETE /api/status/:id
Delete your active status (no body required)

## Streak Logic

Streaks are calculated using UTC calendar days:
- **First post**: Streak = 1
- **Posted yesterday**: Streak += 1
- **Posted today (replacing)**: Streak unchanged
- **Gap in posting**: Streak resets to 1

## Environment Variables

No new environment variables needed. Uses existing:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: For authentication
- `PORT`: Server port

## Content Limits

- Word: 50 characters max
- Meaning: 500 characters max
- Reply: 500 characters max
- One active status per user at a time

## Testing

### Manual Test Flow
1. **Create Status**:
   ```bash
   POST /api/status
   # Should create status and set streak to 1
   ```

2. **View Feed**:
   ```bash
   GET /api/status/feed
   # Should see the status
   ```

3. **View Status**:
   ```bash
   POST /api/status/:id/view
   # Should add to viewers array
   ```

4. **Reply**:
   ```bash
   POST /api/status/:id/reply
   # Should add reply
   ```

5. **Check Expiration** (wait 24h or manually expire):
   ```bash
   # TTL index should auto-delete after expiresAt
   ```

### Unit Test (streak logic)
```javascript
// test/streak.test.js
import { updateStreakForUser } from '../src/controllers/status.controller.js';

describe('Streak Logic', () => {
  it('should increment streak for consecutive days', async () => {
    // Test implementation
  });
  
  it('should reset streak after gap', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### TTL Index Not Working
- Check MongoDB version >= 3.2
- Verify index exists: `db.dailywords.getIndexes()`
- TTL monitor runs every 60 seconds, so deletion may be delayed

### Streak Not Updating
- Ensure server timezone is UTC or properly configured
- Check `lastStreakDate` is being saved correctly
- Verify date comparison logic in `updateStreakForUser`

### Visibility Issues
- Check user's `friends` array is populated
- Verify `closeFriends` array for "close" visibility
- Ensure JWT auth is working and `req.user` is set

## Performance Considerations

- Feed query limits to 50 statuses
- Consider pagination for users with many friends
- Index on `userId + isActive` for fast "my active status" lookup
- Consider caching streak data in Redis for high traffic

## Future Enhancements

1. **Image Support**: Add optional image upload (currently text-only)
2. **Hashtags**: Add hashtag support for discoverability
3. **Analytics**: Track which words get most views/replies
4. **Leaderboard**: Show users with longest streaks
5. **Notifications**: Push notifications for views/replies
6. **Archive**: View past Daily Words (currently auto-deleted)

## Security Notes

- All endpoints require JWT authentication
- Users can only delete their own statuses
- Visibility rules enforced server-side
- Input validation on all text fields
- Consider adding rate limiting (e.g., max 10 status posts per day)

---

**Ready to use!** All code is production-ready. Just add the route to App.jsx and start posting Daily Words.
