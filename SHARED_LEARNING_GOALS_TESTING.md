# 🧪 Shared Learning Goals - Testing Checklist

Use this checklist to verify that all features are working correctly.

---

## Pre-Testing Setup

### Environment

- [ ] Backend server is running (`cd backend && npm start`)
- [ ] Frontend dev server is running (`cd frontend && npm run dev`)
- [ ] MongoDB is connected and running
- [ ] Browser console is open (F12) for debugging

### Test Users

- [ ] Create User A with email/password
- [ ] Set User A's learning language (e.g., English)
- [ ] Create User B with different email/password
- [ ] Set User B's learning language (e.g., Spanish)
- [ ] User A sends friend request to User B
- [ ] User B accepts friend request
- [ ] Both users are now friends

---

## Feature Testing

### 1. Navigation & UI

#### Sidebar Navigation

- [ ] "Learning Goals" link appears in sidebar
- [ ] Target icon (🎯) is displayed
- [ ] Link is highlighted when on learning goals pages
- [ ] Clicking link navigates to `/learning-goals`

#### Responsive Design

- [ ] Desktop view works correctly
- [ ] Mobile view works correctly
- [ ] Dark mode works correctly
- [ ] Light mode works correctly

---

### 2. Create Learning Goal

#### Access Create Page

- [ ] Click "Start a New Goal" button
- [ ] Navigate to `/learning-goals/create`
- [ ] Back button works correctly

#### Friend Selection

- [ ] Friends list loads successfully
- [ ] Each friend shows their learning language
- [ ] Can select a friend by clicking
- [ ] Selected friend is highlighted
- [ ] Profile pictures display correctly

#### Duration Selection

- [ ] 7-day option is available
- [ ] 14-day option is available
- [ ] Can switch between options
- [ ] Selected duration is highlighted

#### Goal Creation

- [ ] Summary shows selected friend and duration
- [ ] "Create Learning Goal" button is enabled when ready
- [ ] Button shows loading state when creating
- [ ] Success toast appears after creation
- [ ] Redirects to goals list after creation
- [ ] New goal appears in "Pending Invitations" section

#### Error Handling

- [ ] Cannot create goal without selecting friend
- [ ] Cannot create goal with same user twice (duplicate check)
- [ ] Error message shows if creation fails

---

### 3. Goal Invitations

#### Receiving Invitation (User B)

- [ ] Navigate to Learning Goals page
- [ ] Pending invitation appears in "Pending Invitations"
- [ ] Invitation shows correct friend name
- [ ] Invitation shows correct duration
- [ ] Languages are displayed correctly
- [ ] "Pending" badge is visible

#### Accept Invitation

- [ ] Click "Accept" button
- [ ] Button shows loading state
- [ ] Success toast appears
- [ ] Goal status changes to "Active"
- [ ] Goal moves to "Active Goals" section
- [ ] Goal appears in both users' active goals

#### Decline Invitation

- [ ] Click "Decline" button
- [ ] Button shows loading state
- [ ] Confirmation toast appears
- [ ] Goal is removed from list
- [ ] Goal status is "cancelled" in database

---

### 4. Active Goals

#### View Active Goal

- [ ] Active goal appears in "Active Goals" section
- [ ] Click on goal to open detail page
- [ ] Navigate to `/learning-goals/:goalId`
- [ ] Partner's name and picture display correctly
- [ ] Goal duration is shown

#### Progress Overview

- [ ] "Your completion" counter is accurate
- [ ] "Partner's completion" counter is accurate
- [ ] Progress bar updates correctly
- [ ] "Days completed together" is accurate

#### Daily Calendar

- [ ] All days are displayed in grid
- [ ] Day 1 is unlocked (first day)
- [ ] Future days are locked (🔒 icon)
- [ ] Day numbers are correct (1 to duration)
- [ ] Color coding works:
  - Gray: Available
  - Blue: You completed
  - Green: Both completed
  - Locked: Future days

---

### 5. Taking Quizzes

#### Access Quiz

- [ ] Click on Day 1 (unlocked day)
- [ ] Quiz modal opens
- [ ] Modal displays "Day 1 Quiz" title
- [ ] Shows user's learning language

#### Quiz Questions

- [ ] 5 questions are displayed
- [ ] Question numbers (1-5) are shown
- [ ] Difficulty badges appear (easy/medium/hard)
- [ ] Questions are translated to user's language
- [ ] Answer options are translated
- [ ] 4 options per question
- [ ] Radio buttons work correctly

#### Answer Selection

- [ ] Can select one option per question
- [ ] Selected option is highlighted
- [ ] Can change selection before submitting
- [ ] All questions must be answered to submit

#### Quiz Submission

- [ ] "Submit Quiz" button is disabled until all answered
- [ ] Button shows loading state when submitting
- [ ] Success toast appears after submission
- [ ] Score is displayed (e.g., "4/5")
- [ ] Trophy icon appears in result screen
- [ ] Motivational message is shown

#### After Submission

- [ ] Can close modal
- [ ] Day is marked as completed
- [ ] Progress counters update
- [ ] Color changes in calendar
- [ ] Cannot retake same quiz
- [ ] Shows "Already Completed" if reopened

---

### 6. Multi-Language Testing

#### User A (English)

- [ ] Questions appear in English
- [ ] "What is the word for 'Hello'?"
- [ ] Options: "Hello", "Goodbye", etc.

#### User B (Spanish)

- [ ] Questions appear in Spanish
- [ ] "¿Cuál es la palabra para 'Hola'?"
- [ ] Options: "Hola", "Adiós", etc.

#### Same Structure

- [ ] Both users have same question order
- [ ] Both users have same number of questions
- [ ] Both users have same difficulty levels
- [ ] Correct answer index is the same

---

### 7. Progress Tracking

#### Individual Progress

- [ ] User can see their own completed days
- [ ] User can see their own scores
- [ ] User can see incomplete days

#### Partner Progress

- [ ] User can see partner's completion status
- [ ] User CANNOT see partner's answers
- [ ] User CANNOT see partner's exact scores
- [ ] Only completion checkmarks are visible

#### Progress Updates

- [ ] Progress updates after quiz submission
- [ ] No page refresh needed
- [ ] Both users' progress is tracked separately
- [ ] "Days completed together" only counts mutual completion

---

### 8. Daily Unlocking

#### Day 1 Testing

- [ ] Day 1 is unlocked immediately on acceptance
- [ ] Day 2 is locked on Day 1

#### Day Progression

- [ ] Wait 24 hours (or manually change start date in DB for testing)
- [ ] Day 2 unlocks after 24 hours
- [ ] Previous days remain accessible
- [ ] Future days remain locked

#### Manual Testing (DB Override)

```javascript
// In MongoDB, update startedAt to yesterday:
db.sharedlearninggoals.updateOne(
  { _id: ObjectId("goalId") },
  { $set: { startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
);
```

- [ ] Refresh page
- [ ] Day 2 is now unlocked
- [ ] Can take Day 2 quiz

---

### 9. Goal Completion

#### Complete All Days

- [ ] Both users complete all days
- [ ] Goal status changes to "Completed"
- [ ] "View Goal Summary" button appears
- [ ] Goal moves to "Completed Goals" section

#### Partial Completion

- [ ] Only User A completes all days
- [ ] User B has incomplete days
- [ ] Goal remains "Active"
- [ ] Can still complete remaining days

---

### 10. Goal Summary

#### Access Summary

- [ ] Click "View Goal Summary" on completed goal
- [ ] Navigate to `/learning-goals/:goalId/summary`
- [ ] Celebration banner appears with trophy icon

#### Statistics Display

- [ ] Goal duration is shown
- [ ] Start date is displayed
- [ ] Languages are listed
- [ ] Status shows "Completed"

#### User A Stats

- [ ] Profile picture displays
- [ ] Name is shown
- [ ] Total score is calculated correctly
- [ ] Days completed is accurate
- [ ] Average score is calculated (total/days)
- [ ] Progress bar reflects performance

#### User B Stats

- [ ] Same stats display for partner
- [ ] Independent scores
- [ ] Can compare performance

#### Achievements

- [ ] "Perfect Attendance" badge if all days completed
- [ ] "High Achiever" badge if average > 4.5
- [ ] "Team Player" badge if partner completed all
- [ ] "Perfect Sync" badge if both completed all
- [ ] Achievement icons and colors display correctly

#### Actions

- [ ] "Back to Goals" button works
- [ ] "Start New Goal" button navigates to create page
- [ ] Can view same goal detail from summary

---

### 11. Error Handling

#### Network Errors

- [ ] Shows error toast if API fails
- [ ] Doesn't crash on network error
- [ ] Can retry operation

#### Invalid Data

- [ ] Cannot submit quiz without answers
- [ ] Cannot access locked days
- [ ] Cannot take quiz twice
- [ ] Cannot create duplicate goals

#### Authentication

- [ ] All endpoints require login
- [ ] Redirects to login if not authenticated
- [ ] Cannot access other users' goals

---

### 12. Edge Cases

#### No Friends

- [ ] Shows "No friends" message on create page
- [ ] "Find Friends" button navigates to friends page

#### No Goals

- [ ] Shows "No goals yet" empty state
- [ ] "Start New Goal" button is prominent

#### Deleted User

- [ ] Goal handles deleted partner gracefully
- [ ] Shows placeholder if user deleted

#### Multiple Goals

- [ ] Can have multiple active goals
- [ ] Each goal is independent
- [ ] Progress tracked separately

---

### 13. Performance

#### Page Load Times

- [ ] Goals list loads quickly (< 1 second)
- [ ] Quiz loads quickly
- [ ] No laggy animations

#### API Response Times

- [ ] Create goal: < 500ms
- [ ] Get goals: < 300ms
- [ ] Get quiz: < 200ms
- [ ] Submit quiz: < 300ms

#### Memory Usage

- [ ] No memory leaks after prolonged use
- [ ] Can navigate between pages smoothly

---

### 14. Browser Compatibility

#### Chrome

- [ ] All features work

#### Firefox

- [ ] All features work

#### Safari

- [ ] All features work

#### Edge

- [ ] All features work

---

### 15. Database Validation

#### Check MongoDB

```javascript
// In MongoDB shell or Compass

// View all goals
db.sharedlearninggoals.find().pretty();

// Check goal structure
db.sharedlearninggoals.findOne();

// Verify indexes
db.sharedlearninggoals.getIndexes();
```

#### Verify Data

- [ ] Goal documents created correctly
- [ ] Creator and partner IDs are valid ObjectIds
- [ ] Progress array has correct structure
- [ ] Completion data saves correctly
- [ ] Timestamps are accurate

---

### 16. Security Testing

#### Authorization

- [ ] User A cannot access User C's goals
- [ ] Cannot modify other users' answers
- [ ] Cannot see other users' scores

#### Input Validation

- [ ] Cannot send invalid duration
- [ ] Cannot send invalid partner ID
- [ ] Cannot submit invalid answers array

#### JWT Token

- [ ] Expired token redirects to login
- [ ] Invalid token returns 401 error

---

## Bug Report Template

If you find any issues, use this template:

```
**Bug Title**: [Short description]

**Priority**: [High/Medium/Low]

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Environment**:
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Screen: [Desktop/Mobile]

**Screenshots**:
[If applicable]

**Console Errors**:
[Copy any errors from browser console]
```

---

## Testing Sign-Off

Once all tests pass, sign off here:

```
✅ All backend endpoints tested
✅ All frontend pages tested
✅ All user flows completed successfully
✅ No critical bugs found
✅ Documentation is accurate
✅ Ready for production

Tested by: _________________
Date: _____________________
Version: 1.0.0
```

---

## Automated Testing (Future)

### Unit Tests to Add

```javascript
// backend/src/controllers/learningGoal.controller.test.js
describe("Learning Goal Controller", () => {
  test("should create a new goal", async () => {});
  test("should prevent duplicate goals", async () => {});
  test("should generate correct number of quizzes", async () => {});
  test("should calculate score correctly", async () => {});
});
```

### Integration Tests

```javascript
// backend/test/learningGoal.integration.test.js
describe("Learning Goal API", () => {
  test("POST /api/learning-goals/create", async () => {});
  test("GET /api/learning-goals", async () => {});
  test("POST /api/learning-goals/:id/accept", async () => {});
  test("POST /api/learning-goals/:id/quiz/:day/submit", async () => {});
});
```

### E2E Tests

```javascript
// cypress/e2e/learningGoals.cy.js
describe("Shared Learning Goals Flow", () => {
  it("should complete entire goal creation flow", () => {});
  it("should take and submit a quiz", () => {});
  it("should track progress correctly", () => {});
});
```

---

**Happy Testing! 🧪✅**
