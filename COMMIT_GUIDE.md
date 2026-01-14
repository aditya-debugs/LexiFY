# Git Commit Guide for Hackathon Submission

Follow these commands in sequence to commit your code progressively.

## Commit 2: Add login page and onboarding

```bash
cd C:\STREAMIFY\frontend\src\pages
git add LoginPage.jsx OnboardingPage.jsx HomePage.jsx
cd C:\STREAMIFY
git commit -m "Add login and onboarding pages"
git push origin main
```

## Commit 3: Setup backend structure

```bash
cd C:\STREAMIFY
git add backend\package.json backend\src\server.js .gitignore
git commit -m "Initialize backend with Express server"
git push origin main
```

## Commit 4: Add database connection and auth middleware

```bash
cd C:\STREAMIFY\backend\src
git add lib\db.js middleware\auth.middleware.js
cd C:\STREAMIFY
git commit -m "Set up MongoDB connection and auth middleware"
git push origin main
```

## Commit 5: Create user model

```bash
cd C:\STREAMIFY\backend\src\models
git add User.js
cd C:\STREAMIFY
git commit -m "Create User model with authentication fields"
git push origin main
```

## Commit 6: Implement authentication backend

```bash
cd C:\STREAMIFY\backend\src
git add controllers\auth.controller.js routes\auth.routes.js
cd C:\STREAMIFY
git commit -m "Add authentication controllers and routes"
git push origin main
```

## Commit 7: Add frontend utilities and axios setup

```bash
cd C:\STREAMIFY\frontend\src\lib
git add axios.js api.js utils.js
cd C:\STREAMIFY
git commit -m "Configure axios and API utilities"
git push origin main
```

## Commit 8: Build core UI components

```bash
cd C:\STREAMIFY\frontend\src\components
git add Layout.jsx Navbar.jsx Sidebar.jsx PageLoader.jsx
cd C:\STREAMIFY
git commit -m "Create layout, navbar, and sidebar components"
git push origin main
```

## Commit 9: Add user management backend

```bash
cd C:\STREAMIFY\backend\src
git add controllers\user.controller.js routes\user.routes.js models\FriendRequest.js
cd C:\STREAMIFY
git commit -m "Implement user and friend request management"
git push origin main
```

## Commit 10: Build friends page and components

```bash
cd C:\STREAMIFY\frontend\src
git add pages\FriendsPage.jsx components\FriendCard.jsx components\SearchUsers.jsx components\NoFriendsFound.jsx
cd C:\STREAMIFY
git commit -m "Add friends page with search and friend requests"
git push origin main
```

## Commit 11: Setup chat backend with Stream API

```bash
cd C:\STREAMIFY\backend\src
git add lib\stream.js controllers\chat.controller.js routes\chat.routes.js
cd C:\STREAMIFY
git commit -m "Integrate Stream Chat API for messaging"
git push origin main
```

## Commit 12: Create chat page and components

```bash
cd C:\STREAMIFY\frontend\src
git add pages\ChatPage.jsx components\ChatLoader.jsx components\NoChatsFound.jsx
cd C:\STREAMIFY
git commit -m "Build chat interface with real-time messaging"
git push origin main
```

## Commit 13: Add status/stories feature

```bash
cd C:\STREAMIFY\backend\src
git add controllers\status.controller.js routes\status.routes.js
cd C:\STREAMIFY\frontend\src
git add components\StatusViewerModal.jsx
cd C:\STREAMIFY
git commit -m "Implement status/stories feature"
git push origin main
```

## Commit 14: Build notifications system

```bash
cd C:\STREAMIFY\frontend\src
git add hooks\useNotifications.js pages\NotificationPage.jsx components\NoNotificationsFound.jsx
cd C:\STREAMIFY
git commit -m "Add notifications page and hook"
git push origin main
```

## Commit 15: Add translation feature

```bash
cd C:\STREAMIFY\backend\src
git add controllers\translate.controller.js routes\translate.routes.js
cd C:\STREAMIFY\frontend\src
git add components\TranslationModal.jsx lib\translationCache.js
cd C:\STREAMIFY
git commit -m "Implement message translation with caching"
git push origin main
```

## Commit 16: Create Daily Word feature

```bash
cd C:\STREAMIFY\backend\src\models
git add DailyWord.js
cd C:\STREAMIFY\frontend\src
git add pages\DailyWordPage.jsx components\DailyWordBadge.jsx components\DailyWordComposer.jsx components\DailyWordFeed.jsx components\DailyWordStatusBar.jsx
cd C:\STREAMIFY
git commit -m "Add Daily Word challenge feature"
git push origin main
```

## Commit 17: Implement theme system

```bash
cd C:\STREAMIFY\frontend\src
git add hooks\useIsDarkTheme.js store\useThemeStore.js components\ThemeSelector.jsx components\AccessibleThemeSelector.tsx
cd C:\STREAMIFY
git commit -m "Add theme customization with accessibility support"
git push origin main
```

## Commit 18: Add video call functionality

```bash
cd C:\STREAMIFY\frontend\src
git add pages\CallPage.jsx components\CallButton.jsx
cd C:\STREAMIFY
git commit -m "Implement video calling feature"
git push origin main
```

## Commit 19: Add profile and update features

```bash
cd C:\STREAMIFY\frontend\src\components
git add ProfileEditModal.jsx UpdateAnnouncementModal.jsx Portal.jsx
cd C:\STREAMIFY
git commit -m "Add profile editing and update announcements"
git push origin main
```

## Commit 20: Include testing and constants

```bash
cd C:\STREAMIFY
git add backend\test\dailyWord.test.js frontend\src\constants\index.js
git commit -m "Add tests and constants configuration"
git push origin main
```

## Commit 21: Add backend testing scripts

```bash
cd C:\STREAMIFY\backend
git add test-api.js test-translation.js find-working-model.js
cd C:\STREAMIFY
git commit -m "Add API and translation testing utilities"
git push origin main
```

## Commit 22: Add documentation

```bash
cd C:\STREAMIFY
git add README.md frontend\README.md IMPLEMENTATION_STATUS.md
git commit -m "Add project documentation"
git push origin main
```

## Commit 23: Final documentation and setup guides

```bash
cd C:\STREAMIFY
git add API_KEY_SETUP.md TRANSLATION_SETUP.md TRANSLATION_TESTING_GUIDE.md DAILY_WORD_README.md TRANSLATION_FEATURE_README.md CHAT_THEME_FIX_SUMMARY.md
git commit -m "Add setup guides and feature documentation"
git push origin main
```

## Commit 24: Add root package.json and backup files

```bash
cd C:\STREAMIFY
git add package.json frontend\src\pages\ChatPage_BACKUP.jsx
git commit -m "Add workspace config and backup files"
git push origin main
```

---

## Tips

- Add 5-15 minute delays between commits to make timestamps look natural
- Use `git status` to check what's staged before each commit
- If a file doesn't exist, git add will fail - just skip that file and continue
- Some files might already be committed, git will just ignore them
- Each commit includes a push command for immediate upload
