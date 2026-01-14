/**
 * Unit tests for Daily Word streak logic
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import { updateStreakForUser } from '../src/controllers/status.controller.js';
import User from '../src/models/User.js';

describe('Daily Word Streak Logic', () => {
  beforeEach(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/test_lexify');
  });

  afterEach(async () => {
    // Clean up
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should initialize streak to 1 for first post', async () => {
    const user = await User.create({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const result = await updateStreakForUser(user._id, new Date('2025-12-09T10:00:00Z'));

    expect(result.streakCount).toBe(1);
    expect(result.lastStreakDate).toBeDefined();
  });

  it('should increment streak for consecutive days', async () => {
    const user = await User.create({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      streakCount: 5,
      lastStreakDate: new Date('2025-12-08T00:00:00Z'),
    });

    const result = await updateStreakForUser(user._id, new Date('2025-12-09T10:00:00Z'));

    expect(result.streakCount).toBe(6);
  });

  it('should not change streak when posting twice same day', async () => {
    const user = await User.create({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      streakCount: 3,
      lastStreakDate: new Date('2025-12-09T08:00:00Z'),
    });

    const result = await updateStreakForUser(user._id, new Date('2025-12-09T18:00:00Z'));

    expect(result.streakCount).toBe(3);
  });

  it('should reset streak to 1 after missing a day', async () => {
    const user = await User.create({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      streakCount: 10,
      lastStreakDate: new Date('2025-12-07T00:00:00Z'), // 2 days ago
    });

    const result = await updateStreakForUser(user._id, new Date('2025-12-09T10:00:00Z'));

    expect(result.streakCount).toBe(1);
  });

  it('should handle timezone correctly (UTC days)', async () => {
    const user = await User.create({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      streakCount: 1,
      lastStreakDate: new Date('2025-12-08T23:00:00Z'), // Late on Dec 8
    });

    // Early on Dec 9
    const result = await updateStreakForUser(user._id, new Date('2025-12-09T01:00:00Z'));

    expect(result.streakCount).toBe(2);
  });
});

/**
 * Integration test for Daily Word workflow
 */
describe('Daily Word Complete Workflow', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Setup test user and auth
    // (Implement based on your auth system)
  });

  it('should complete full status lifecycle', async () => {
    // 1. Create status
    // 2. Fetch feed
    // 3. Record view
    // 4. Add reply
    // 5. Verify poster receives notification
    // (Implement based on your test framework)
  });
});

export default describe;
