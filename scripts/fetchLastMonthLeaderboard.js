// Fetches last month's leaderboard history and enriches it with user emails from Firestore.
// Writes the result to leaderboard_<month>.txt in the same directory.
//
// Usage: node scripts/fetchLastMonthLeaderboard.js
// Run from deliverde-app/.

const path = require("path");
const fs = require("fs");

const admin = require(path.resolve(__dirname, "../node_modules/firebase-admin"));
const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const getPreviousMonthKey = () => {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  return `${year}-${String(month).padStart(2, "0")}`;
};

const main = async () => {
  const monthKey = getPreviousMonthKey();
  console.log(`Fetching leaderboard history for ${monthKey}...`);

  const historyDoc = await db.collection("leaderboardHistory").doc(monthKey).get();

  if (!historyDoc.exists) {
    console.error(`No leaderboardHistory document found for ${monthKey}.`);
    process.exit(1);
  }

  const { topUsers, savedAt } = historyDoc.data();

  if (!topUsers || topUsers.length === 0) {
    console.error("leaderboardHistory document has no topUsers.");
    process.exit(1);
  }

  console.log(`Found ${topUsers.length} users in leaderboard. Fetching emails...`);

  const uids = topUsers.map((u) => u.uid);

  // Fetch user docs in parallel
  const userDocs = await Promise.all(
    uids.map((uid) => db.collection("users").doc(uid).get())
  );

  const emailByUid = {};
  userDocs.forEach((doc) => {
    if (doc.exists) {
      emailByUid[doc.id] = doc.data().email || "no-email";
    } else {
      emailByUid[doc.id] = "user-not-found";
    }
  });

  // Build enriched entries
  const entries = topUsers.map((u) => ({
    rank: u.rank,
    uid: u.uid,
    username: u.username,
    points: u.points,
    email: emailByUid[u.uid] || "no-email",
  }));

  // Format output
  const savedAtStr = savedAt ? savedAt.toDate().toISOString() : "unknown";
  const lines = [
    `Leaderboard History — ${monthKey}`,
    `Saved at: ${savedAtStr}`,
    `Generated at: ${new Date().toISOString()}`,
    "",
    `${"Rank".padEnd(6)}${"Username".padEnd(20)}${"Points".padEnd(10)}${"Email"}`,
    "-".repeat(70),
    ...entries.map((e) =>
      `${String(e.rank).padEnd(6)}${(e.username || "").padEnd(20)}${String(e.points).padEnd(10)}${e.email}`
    ),
  ];

  const output = lines.join("\n") + "\n";
  const outputPath = path.join(__dirname, `leaderboard_${monthKey}.txt`);
  fs.writeFileSync(outputPath, output, "utf8");

  console.log(`Done. Results written to ${outputPath}`);
};

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
