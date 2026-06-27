import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { preferences, supervisors } from "@db/schema";

export async function findPreferencesByStudent(studentId: number) {
  const db = getDb();
  return db
    .select({
      id: preferences.id,
      studentId: preferences.studentId,
      supervisorId: preferences.supervisorId,
      preferenceRank: preferences.preferenceRank,
      submittedAt: preferences.submittedAt,
      supervisorName: supervisors.name,
    })
    .from(preferences)
    .innerJoin(supervisors, eq(preferences.supervisorId, supervisors.id))
    .where(eq(preferences.studentId, studentId))
    .orderBy(preferences.preferenceRank);
}

export async function findPreferencesBySupervisor(supervisorId: number) {
  const db = getDb();
  return db
    .select()
    .from(preferences)
    .where(eq(preferences.supervisorId, supervisorId));
}

export async function savePreferences(
  studentId: number,
  prefs: { supervisorId: number; rank: number }[]
) {
  const db = getDb();

  // Delete existing preferences for this student
  await db.delete(preferences).where(eq(preferences.studentId, studentId));

  // Insert new preferences
  if (prefs.length > 0) {
    const values = prefs.map((p) => ({
      studentId,
      supervisorId: p.supervisorId,
      preferenceRank: p.rank,
    }));
    await db.insert(preferences).values(values);
  }

  return findPreferencesByStudent(studentId);
}

export async function deletePreferencesByStudent(studentId: number) {
  const db = getDb();
  await db.delete(preferences).where(eq(preferences.studentId, studentId));
}
