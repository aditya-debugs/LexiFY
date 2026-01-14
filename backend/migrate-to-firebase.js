/**
 * Migration Script: Move existing users to Firebase
 *
 * This script helps migrate existing JWT-based users to Firebase Authentication.
 * Run this ONCE after setting up Firebase.
 *
 * Usage:
 * 1. Make sure your Firebase Admin SDK is configured in .env
 * 2. Run: node migrate-to-firebase.js
 * 3. Users will receive password reset emails to set new passwords
 */

import dotenv from "dotenv";
import { connectDB } from "./src/lib/db.js";
import User from "./src/models/User.js";
import { getFirebaseAdmin } from "./src/config/firebase.js";

// Load environment variables
dotenv.config();

async function migrateUsers() {
  try {
    console.log("🔄 Starting user migration to Firebase...\n");

    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Initialize Firebase Admin
    const admin = getFirebaseAdmin();
    if (!admin) {
      throw new Error(
        "Firebase Admin not initialized. Check your .env configuration."
      );
    }
    console.log("✅ Firebase Admin initialized\n");

    // Find users without Firebase UID
    const usersToMigrate = await User.find({
      firebaseUid: { $exists: false },
    }).select("email fullName username");

    if (usersToMigrate.length === 0) {
      console.log(
        "✅ No users to migrate. All users are already using Firebase!\n"
      );
      process.exit(0);
    }

    console.log(`📊 Found ${usersToMigrate.length} users to migrate\n`);

    let successCount = 0;
    let failCount = 0;
    const resetLinks = [];

    for (const user of usersToMigrate) {
      try {
        console.log(`🔄 Migrating: ${user.email}...`);

        // Check if user already exists in Firebase
        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUserByEmail(user.email);
          console.log(`   ℹ️  User already exists in Firebase`);
        } catch (error) {
          if (error.code === "auth/user-not-found") {
            // Create new Firebase user with random password
            const randomPassword =
              Math.random().toString(36).slice(-12) +
              Math.random().toString(36).slice(-12);

            firebaseUser = await admin.auth().createUser({
              email: user.email,
              password: randomPassword,
              displayName: user.fullName,
              disabled: false,
            });
            console.log(`   ✅ Created Firebase user`);
          } else {
            throw error;
          }
        }

        // Update MongoDB user with Firebase UID
        user.firebaseUid = firebaseUser.uid;
        await user.save();
        console.log(`   ✅ Updated MongoDB with Firebase UID`);

        // Generate password reset link
        const resetLink = await admin
          .auth()
          .generatePasswordResetLink(user.email);
        resetLinks.push({
          email: user.email,
          link: resetLink,
        });
        console.log(`   ✅ Generated password reset link\n`);

        successCount++;
      } catch (error) {
        console.error(
          `   ❌ Failed to migrate ${user.email}:`,
          error.message,
          "\n"
        );
        failCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Failed: ${failCount} users`);
    console.log("=".repeat(60) + "\n");

    // Show password reset links
    if (resetLinks.length > 0) {
      console.log("📧 PASSWORD RESET LINKS");
      console.log("=".repeat(60));
      console.log(
        "Send these links to your users so they can set new passwords:\n"
      );

      resetLinks.forEach(({ email, link }) => {
        console.log(`Email: ${email}`);
        console.log(`Link: ${link}\n`);
      });

      console.log("💡 TIP: In production, send these via email automatically");
      console.log("     using a service like SendGrid or AWS SES.\n");
    }

    console.log("✅ Migration complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateUsers();
