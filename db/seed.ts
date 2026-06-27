import { getDb } from "../api/queries/connection";
import { students, supervisors, preferences } from "./schema";

const DEPARTMENTS = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Mathematics"];
const LEVELS = ["300", "400", "MSc"];

const SUPERVISOR_NAMES = [
  "DR. SOFOROWA",
  "Dr. Sakpere",
  "Dr Adediran",
  "Mr Likinyo",
  "Mr Babajide",
  "Dr. Afe",
  "Dr John-Dewole",
  "Miss Fatoki",
  "Mr. Ogunsanwo",
  "Mr Omotosho",
  "Mrs Adeleke",
  "Dr. Akolade",
  "Mr Okoya",
  "Mrs Akanmu",
  "Dr. Waheed",
  "Dr Ayoade",
  "Mr Raheeem",
  "Miss Olowe",
];

function randomCGPA(): number {
  // Normal distribution μ=3.0, σ=0.5, truncated [0, 4]
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  let cgpa = 3.0 + z * 0.5;
  cgpa = Math.max(0.0, Math.min(4.0, cgpa));
  return parseFloat(cgpa.toFixed(2));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(preferences);
  await db.delete(students);
  await db.delete(supervisors);
  console.log("Cleared existing data");

  // Seed supervisors
  const supervisorData: { name: string; department: string; maxStudents: number; isAvailable: boolean }[] = [];
  for (let i = 0; i < SUPERVISOR_NAMES.length; i++) {
    supervisorData.push({
      name: SUPERVISOR_NAMES[i],
      department: randomItem(DEPARTMENTS),
      maxStudents: Math.floor(Math.random() * 4) + 3, // 3-6
      isAvailable: true,
    });
  }

  const insertedSupervisors = await db.insert(supervisors).values(supervisorData).returning({ id: supervisors.id });
  console.log(`Inserted ${insertedSupervisors.length} supervisors`);

  // Seed 50 students
  const studentData: { studentId: string; name: string; cgpa: number; department: string; level: string }[] = [];
  for (let i = 1; i <= 50; i++) {
    const num = i.toString().padStart(3, "0");
    studentData.push({
      studentId: `S${num}`,
      name: `Student ${num}`,
      cgpa: randomCGPA(),
      department: randomItem(DEPARTMENTS),
      level: randomItem(LEVELS),
    });
  }

  const insertedStudents = await db.insert(students).values(studentData).returning({ id: students.id });
  console.log(`Inserted ${insertedStudents.length} students`);

  // Seed preferences for each student (5 random supervisors, ranked 1-5)
  const supervisorIds = insertedSupervisors.map((s) => s.id);
  const preferenceData: { studentId: number; supervisorId: number; preferenceRank: number }[] = [];

  for (const student of insertedStudents) {
    const shuffled = shuffleArray(supervisorIds).slice(0, 5);
    for (let rank = 0; rank < shuffled.length; rank++) {
      preferenceData.push({
        studentId: student.id,
        supervisorId: shuffled[rank],
        preferenceRank: rank + 1,
      });
    }
  }

  await db.insert(preferences).values(preferenceData);
  console.log(`Inserted ${preferenceData.length} preferences`);

  // Update preferenceSubmitted flag for all students
  await db.update(students).set({ preferenceSubmitted: true });
  console.log("Updated student preferenceSubmitted flags");

  console.log("Seeding complete!");
}

(async () => {
  try {
    await seed();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();
