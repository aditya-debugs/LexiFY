# Shared Learning Goals (Multi-Language) Feature

## Overview

The **Shared Learning Goals** feature allows two friends on Lexify to learn together, even if they are learning different languages. Both users follow the same learning schedule and quiz structure, but each receives content in their own chosen language.

---

## Key Features

✅ **Multi-Language Support**: Each user gets quizzes in their selected learning language  
✅ **Same Structure**: Both users receive the same quiz format, difficulty, and number of questions  
✅ **Progress Tracking**: Users can see their own progress and their friend's completion status  
✅ **Privacy**: Users cannot see each other's answers, only completion status  
✅ **Flexible Duration**: Choose 7-day or 14-day challenges  
✅ **Daily Unlocking**: Quizzes unlock one day at a time  
✅ **Goal Summary**: Detailed statistics and achievements at the end

---

## How It Works

### 1. **Create a Goal**

- Select a friend from your friends list
- Choose duration (7 or 14 days)
- Send invitation

### 2. **Accept the Goal**

- Friend receives invitation
- Goal starts only after acceptance
- Daily quizzes are generated

### 3. **Take Daily Quizzes**

- Each day, a new quiz unlocks
- 5 questions per day with mixed difficulty
- Questions are translated to each user's language
- Immediate scoring after submission

### 4. **Track Progress Together**

- View your completion status
- See your friend's completion (not answers)
- Progress bars show overall achievement

### 5. **View Summary**

- Completion statistics for both users
- Average scores and achievements
- Option to start a new goal

---

## Technical Implementation

### Backend

#### Database Model

**File**: `backend/src/models/SharedLearningGoal.js`

```javascript
{
  creator: ObjectId,           // User who created the goal
  partner: ObjectId,           // Invited friend
  duration: Number,            // 7 or 14 days
  status: String,              // pending, active, completed, cancelled
  creatorLanguage: String,     // Creator's learning language
  partnerLanguage: String,     // Partner's learning language
  progress: [                  // Daily progress tracking
    {
      day: Number,
      quiz: [Questions],
      creatorCompletion: {...},
      partnerCompletion: {...}
    }
  ]
}
```

#### API Endpoints

**File**: `backend/src/routes/learningGoal.routes.js`

| Method | Endpoint                                       | Description            |
| ------ | ---------------------------------------------- | ---------------------- |
| POST   | `/api/learning-goals/create`                   | Create new goal        |
| GET    | `/api/learning-goals`                          | Get all user's goals   |
| GET    | `/api/learning-goals/:goalId`                  | Get specific goal      |
| POST   | `/api/learning-goals/:goalId/accept`           | Accept invitation      |
| POST   | `/api/learning-goals/:goalId/decline`          | Decline invitation     |
| GET    | `/api/learning-goals/:goalId/quiz/:day`        | Get daily quiz         |
| POST   | `/api/learning-goals/:goalId/quiz/:day/submit` | Submit answers         |
| GET    | `/api/learning-goals/:goalId/summary`          | Get completion summary |

#### Controller

**File**: `backend/src/controllers/learningGoal.controller.js`

Key functions:

- `createLearningGoal()`: Validates and creates a new goal
- `acceptLearningGoal()`: Activates goal and generates all quizzes
- `getDailyQuiz()`: Returns quiz translated for user's language
- `submitQuiz()`: Grades answers and updates progress
- `getGoalSummary()`: Calculates statistics and achievements

#### Quiz Generation

Questions are stored as language-neutral keys and translated on the fly:

```javascript
{
  questionKey: "greetings_basic",
  optionsKey: ["hello", "goodbye", "thank_you", "please"],
  correctAnswer: 0
}
```

### Frontend

#### Pages

1. **LearningGoalsPage** (`frontend/src/pages/LearningGoalsPage.jsx`)

   - Lists all goals (pending, active, completed)
   - Accept/decline invitations
   - Navigate to goal details

2. **CreateLearningGoalPage** (`frontend/src/pages/CreateLearningGoalPage.jsx`)

   - Select friend from list
   - Choose duration
   - Create goal invitation

3. **GoalDetailPage** (`frontend/src/pages/GoalDetailPage.jsx`)

   - View overall progress
   - Calendar view of all days
   - Take daily quizzes
   - Track both users' completion

4. **GoalSummaryPage** (`frontend/src/pages/GoalSummaryPage.jsx`)
   - Final statistics
   - Achievements
   - Comparison charts
   - Option to start new goal

#### Translation System

**File**: `frontend/src/lib/quizTranslations.js`

Provides translation dictionary for quiz content:

```javascript
translate(key, language); // Returns translated text
isSupportedLanguage(lang); // Checks if language is supported
getSupportedLanguages(); // Returns all available languages
```

Currently supports: English, Spanish, French, German

#### API Client

**File**: `frontend/src/lib/api.js`

Added functions:

- `createLearningGoal(partnerId, duration)`
- `getLearningGoals()`
- `acceptLearningGoal(goalId)`
- `getDailyQuiz(goalId, day)`
- `submitQuiz(goalId, day, answers)`
- `getGoalSummary(goalId)`

---

## User Interface

### Components

#### Goal Card

Displays:

- Partner's profile picture and name
- Goal duration and languages
- Status badge (Pending/Active/Completed)
- Progress bar for active goals
- Action buttons for pending goals

#### Quiz Modal

Features:

- Question numbering
- Difficulty badges
- Multiple choice options
- Visual feedback for selection
- Submit validation

#### Progress Calendar

Shows:

- All days in grid format
- Color coding:
  - 🟢 Green: Both completed
  - 🔵 Blue: You completed
  - ⚪ Gray: Available
  - 🔒 Locked: Future days
- Visual indicators for partial completion

---

## Setup Instructions

### 1. Backend Setup

The routes are already registered in `backend/src/server.js`:

```javascript
import learningGoalRoutes from "./routes/learningGoal.routes.js";
app.use("/api/learning-goals", learningGoalRoutes);
```

### 2. Frontend Setup

Routes are registered in `frontend/src/App.jsx`:

```javascript
<Route path="/learning-goals" element={<LearningGoalsPage />} />
<Route path="/learning-goals/create" element={<CreateLearningGoalPage />} />
<Route path="/learning-goals/:goalId" element={<GoalDetailPage />} />
<Route path="/learning-goals/:goalId/summary" element={<GoalSummaryPage />} />
```

Navigation link is added in `frontend/src/components/Sidebar.jsx`.

### 3. Start the Application

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

---

## Usage Flow

### Creating a Goal

1. Navigate to **Learning Goals** from sidebar
2. Click **"Start a New Goal"**
3. Select a friend from your friends list
4. Choose duration (7 or 14 days)
5. Click **"Create Learning Goal"**
6. Wait for friend to accept

### Taking Quizzes

1. Open active goal from Learning Goals page
2. Click on an unlocked day
3. Answer all 5 questions
4. Submit quiz
5. View score immediately
6. Return to progress view

### Viewing Summary

1. Complete all days (or wait for goal to end)
2. Click **"View Goal Summary"** button
3. See detailed statistics
4. Compare performance with partner
5. View earned achievements

---

## Quiz Content

### Difficulty Levels

- **Easy** (Days 1-3): Basic vocabulary, greetings, colors, numbers
- **Medium** (Days 4-10): Common phrases, directions, time expressions
- **Hard** (Days 11+): Idioms, formal expressions, complex phrases

### Question Distribution

- **Days 1-3**: 3 easy + 2 medium
- **Days 4-7**: 2 easy + 2 medium + 1 hard (if 14-day goal)
- **Days 8-14**: 1 easy + 3 medium + 1 hard

---

## Extending the Feature

### Adding More Languages

Edit `frontend/src/lib/quizTranslations.js`:

```javascript
const translations = {
  // ... existing languages
  Italian: {
    greetings_basic: "Qual è la parola per 'Ciao'?",
    hello: "Ciao",
    // ... more translations
  },
};
```

### Adding More Questions

Edit `backend/src/controllers/learningGoal.controller.js`:

```javascript
const QUIZ_TEMPLATES = {
  easy: [
    // Add new questions here
    {
      questionKey: "new_question_key",
      optionsKey: ["option1", "option2", "option3", "option4"],
      correctAnswer: 0,
      difficulty: "easy",
    },
  ],
};
```

Then add translations to the frontend translation file.

### Customizing Duration

Modify the duration options in `CreateLearningGoalPage.jsx`:

```javascript
// Add 21-day option
<div onClick={() => setDuration(21)} className="...">
  <div>21</div>
  <div>Days</div>
</div>
```

Also update the backend model enum in `SharedLearningGoal.js`:

```javascript
duration: {
  type: Number,
  enum: [7, 14, 21],  // Add 21
  required: true,
}
```

---

## Best Practices

### For Users

- Complete quizzes daily for best results
- Don't skip days (maintain consistency)
- Encourage your partner to stay consistent
- Review mistakes (future feature: see which answers were wrong)

### For Developers

- Keep quiz templates simple and clear
- Ensure translations are accurate
- Add more questions regularly
- Monitor user engagement metrics
- Consider adding hints or explanations (future enhancement)

---

## Future Enhancements

### Planned Features

- [ ] Show correct answers after quiz completion
- [ ] Add hint system for difficult questions
- [ ] Streak tracking across multiple goals
- [ ] Leaderboard for friends
- [ ] Custom quiz creation by users
- [ ] Voice quiz option
- [ ] Reminders/notifications for daily quizzes
- [ ] Share achievements on social media
- [ ] Multi-user goals (3+ participants)
- [ ] Themed quiz packs (travel, business, etc.)

---

## Troubleshooting

### Common Issues

**Quiz not loading**

- Check if the day is unlocked (current day only)
- Verify the goal is in "active" status
- Check browser console for errors

**Translations not working**

- Ensure user has learning language set in profile
- Verify language is in supported list
- Check translation keys match in both files

**Progress not updating**

- Refresh the page after submission
- Check network requests in browser DevTools
- Verify backend server is running

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── SharedLearningGoal.js          # Database schema
│   ├── controllers/
│   │   └── learningGoal.controller.js     # Business logic
│   ├── routes/
│   │   └── learningGoal.routes.js         # API routes
│   └── server.js                          # Route registration

frontend/
├── src/
│   ├── pages/
│   │   ├── LearningGoalsPage.jsx          # Main goals page
│   │   ├── CreateLearningGoalPage.jsx     # Goal creation
│   │   ├── GoalDetailPage.jsx             # Quiz interface
│   │   └── GoalSummaryPage.jsx            # Final summary
│   ├── lib/
│   │   ├── api.js                         # API functions
│   │   └── quizTranslations.js            # Translation system
│   ├── components/
│   │   └── Sidebar.jsx                    # Navigation
│   └── App.jsx                            # Route definitions
```

---

## Credits

Developed for **Lexify** - A social language-learning platform

Feature: Shared Learning Goals (Multi-Language)  
Version: 1.0.0  
Date: January 2026

---

## License

This feature is part of the Lexify project and follows the same license terms.
