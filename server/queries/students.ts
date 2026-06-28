import { eq, desc, like, and, count } from "drizzle-orm";
import { getDb } from "./connection.js";
import { students, preferences, supervisors } from "../../db/schema.js";
import type { InsertStudent } from "../../db/schema.js";

export async function findAllStudents(filters?: {
  search?: string;
  department?: string;
  level?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const db = getDb();
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters?.search) {
    conditions.push(like(students.name, `%${filters.search}%`));
  }
  if (filters?.department) {
    conditions.push(eq(students.department, filters.department));
  }
  if (filters?.level) {
    conditions.push(eq(students.level, filters.level));
  }
  if (filters?.status) {
    conditions.push(eq(students.allocationStatus, filters.status as "pending" | "allocated" | "unallocated"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(students)
      .where(whereClause)
      .orderBy(desc(students.cgpa))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(students)
      .where(whereClause),
  ]);

  return {
    data,
    total: totalResult[0].count,
    page,
    limit,
    totalPages: Math.ceil(totalResult[0].count / limit),
  };
}

export async function findStudentById(id: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);
  return rows[0];
}

export async function findStudentWithPreferences(id: number) {
  const db = getDb();
  const student = await findStudentById(id);
  if (!student) return null;

  const prefs = await db
    .select({
      preferenceRank: preferences.preferenceRank,
      supervisorId: preferences.supervisorId,
      supervisorName: supervisors.name,
    })
    .from(preferences)
    .innerJoin(supervisors, eq(preferences.supervisorId, supervisors.id))
    .where(eq(preferences.studentId, id))
    .orderBy(preferences.preferenceRank);

  return { ...student, preferences: prefs };
}

export async function createStudent(data: InsertStudent) {
  const db = getDb();
  const result = await db.insert(students).values(data).returning({ insertedId: students.id });
  return findStudentById(result[0].insertedId);
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = getDb();
  await db.update(students).set(data).where(eq(students.id, id));
  return findStudentById(id);
}

export async function deleteStudent(id: number) {
  const db = getDb();
  await db.delete(students).where(eq(students.id, id));
}

export async function getStudentCount() {
  const db = getDb();
  const result = await db.select({ count: count() }).from(students);
  return result[0].count;
}

export async function getAllocatedCount() {
  const db = getDb();
  const result = await db
    .select({ count: count() })
    .from(students)
    .where(eq(students.allocationStatus, "allocated"));
  return result[0].count;
}

export async function getUnallocatedCount() {
  const db = getDb();
  const result = await db
    .select({ count: count() })
    .from(students)
    .where(eq(students.allocationStatus, "unallocated"));
  return result[0].count;
}

export async function getDepartments() {
  const db = getDb();
  const result = await db
    .selectDistinct({ department: students.department })
    .from(students);
  return result.map((r) => r.department);
}

export async function getLevels() {
  const db = getDb();
  const result = await db
    .selectDistinct({ level: students.level })
    .from(students);
  return result.map((r) => r.level);
}
