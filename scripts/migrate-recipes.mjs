import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = resolve(__dirname, "../service-account.json");

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function migrateRecipes() {
  const sourceCollection = db.collection("newRecipes");
  const targetCollection = db.collection("recipes");

  console.log("Fetching documents from newRecipes...");
  const snapshot = await sourceCollection.get();

  if (snapshot.empty) {
    console.log("No documents found in newRecipes. Nothing to migrate.");
    return;
  }

  console.log(`Found ${snapshot.size} document(s). Starting migration...`);

  let batch = db.batch();
  let batchCount = 0;
  let totalMigrated = 0;

  for (const doc of snapshot.docs) {
    const targetRef = targetCollection.doc(doc.id);
    batch.set(targetRef, doc.data());
    batchCount++;
    totalMigrated++;

    // Firestore batches are limited to 500 operations
    if (batchCount === 500) {
      await batch.commit();
      console.log(`Committed ${totalMigrated} documents...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✓ Migration complete. ${totalMigrated} document(s) migrated from newRecipes → recipes.`);
  console.log("Verify the data in Firebase Console before deleting newRecipes.");
}

migrateRecipes().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
