import { eq, count, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { supervisors, allocations, students } from "@db/schema";
import type { InsertSupervisor } from "@db/schema";

export async function findAllSupervisors() {
  const db = getDb();
  return db.select().from(supervisors).orderBy(supervisors.name);
}

export async function findAvailableSupervisors() {
  const db = getDb();
  return db
    .select()
    .from(supervisors)
    .where(eq(supervisors.isAvailable, true))
    .orderBy(supervisors.name);
}

export async function findSupervisorById(id: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(supervisors)
    .where(eq(supervisors.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findSupervisorWithStudents(id: number) {
  const db = getDb();
  const supervisor = await findSupervisorById(id);
  if (!supervisor) return null;

  const assignedStudents = await db
    .select({
      studentId: students.studentId,
      name: students.name,
      cgpa: students.cgpa,
      department: students.department,
      level: students.level,
      preferenceRank: allocations.preferenceRank,
      allocatedAt: allocations.allocatedAt,
    })
    .from(allocations)
    .innerJoin(students, eq(allocations.studentId, students.id))
    .where(eq(allocations.supervisorId, id))
    .orderBy(desc(students.cgpa));

  return { ...supervisor, assignedStudents };
}

export async function createSupervisor(data: InsertSupervisor) {
  const db = getDb();
  const result = await db.insert(supervisors).values(data).$returningId();
  return findSupervisorById(result[0].id);
}

export async function updateSupervisor(id: number, data: Partial<InsertSupervisor>) {
  const db = getDb();
  await db.update(supervisors).set(data).where(eq(supervisors.id, id));
  return findSupervisorById(id);
}

export async function deleteSupervisor(id: number) {
  const db = getDb();
  await db.delete(supervisors).where(eq(supervisors.id, id));
}

export async function getSupervisorCount() {
  const db = getDb();
  const result = await db.select({ count: count() }).from(supervisors);
  return result[0].count;
}

export async function getLoadDistribution() {
  const db = getDb();
  return db
    .select({
      id: supervisors.id,
      name: supervisors.name,
      maxStudents: supervisors.maxStudents,
      currentLoad: supervisors.currentLoad,
    })
    .from(supervisors)
    .orderBy(supervisors.name);
}
