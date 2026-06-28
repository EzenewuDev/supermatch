import { eq, desc, count } from "drizzle-orm";
import { getDb } from "./connection.js";
import { allocations, students, supervisors, preferences } from "../../db/schema.js";

export async function findAllAllocations(filter?: "all" | "allocated" | "unallocated") {
  const db = getDb();

  if (filter === "unallocated") {
    // Return students who are unallocated
    return db
      .select({
        studentId: students.id,
        studentName: students.name,
        studentIdCode: students.studentId,
        cgpa: students.cgpa,
        supervisorName: sql<string>`NULL`,
        preferenceRank: sql<number>`0`,
        status: sql<string>`'unallocated'`,
        allocatedAt: sql<Date>`NULL`,
      })
      .from(students)
      .where(eq(students.allocationStatus, "unallocated"))
      .orderBy(desc(students.cgpa));
  }

  // Join allocations with students and supervisors
  const results = await db
    .select({
      studentId: students.id,
      studentName: students.name,
      studentIdCode: students.studentId,
      cgpa: students.cgpa,
      supervisorName: supervisors.name,
      preferenceRank: allocations.preferenceRank,
      status: sql<string>`'allocated'`,
      allocatedAt: allocations.allocatedAt,
    })
    .from(allocations)
    .innerJoin(students, eq(allocations.studentId, students.id))
    .innerJoin(supervisors, eq(allocations.supervisorId, supervisors.id))
    .orderBy(desc(students.cgpa));

  if (filter === "allocated") {
    return results;
  }

  // "all" — combine allocated and unallocated
  const unallocated = await db
    .select({
      studentId: students.id,
      studentName: students.name,
      studentIdCode: students.studentId,
      cgpa: students.cgpa,
      supervisorName: sql<string>`NULL`,
      preferenceRank: sql<number>`0`,
      status: sql<string>`'unallocated'`,
      allocatedAt: sql<Date>`NULL`,
    })
    .from(students)
    .where(eq(students.allocationStatus, "unallocated"))
    .orderBy(desc(students.cgpa));

  return [...results, ...unallocated];
}

export async function getAllocationStats() {
  const db = getDb();

  const [totalResult, allocatedResult, unallocatedResult] = await Promise.all([
    db.select({ count: count() }).from(students),
    db
      .select({ count: count() })
      .from(students)
      .where(eq(students.allocationStatus, "allocated")),
    db
      .select({ count: count() })
      .from(students)
      .where(eq(students.allocationStatus, "unallocated")),
  ]);

  return {
    total: totalResult[0].count,
    allocated: allocatedResult[0].count,
    unallocated: unallocatedResult[0].count,
  };
}

export async function getFirstPreferenceRate() {
  const db = getDb();

  const result = await db
    .select({
      total: count(),
      firstPrefs: count(sql`CASE WHEN ${allocations.preferenceRank} = 1 THEN 1 END`),
    })
    .from(allocations);

  const total = result[0].total;
  const firstPrefs = result[0].firstPrefs;

  return total > 0 ? Math.round((firstPrefs / total) * 100) : 0;
}

export async function getRecentAllocations(limit: number = 10) {
  const db = getDb();
  return db
    .select({
      studentName: students.name,
      studentId: students.studentId,
      cgpa: students.cgpa,
      supervisorName: supervisors.name,
      preferenceRank: allocations.preferenceRank,
      allocatedAt: allocations.allocatedAt,
    })
    .from(allocations)
    .innerJoin(students, eq(allocations.studentId, students.id))
    .innerJoin(supervisors, eq(allocations.supervisorId, supervisors.id))
    .orderBy(desc(allocations.allocatedAt))
    .limit(limit);
}

import { sql } from "drizzle-orm";

export async function clearAllocations() {
  const db = getDb();
  await db.delete(allocations);
  await db.update(students).set({ allocationStatus: "pending" });
  await db.update(supervisors).set({ currentLoad: 0 });
}

export async function runAllocationAlgorithm() {
  const db = getDb();
  const startTime = Date.now();

  // 1. Clear existing allocations
  await clearAllocations();

  // 2. Get all students sorted by CGPA descending with their preferences
  const allStudents = await db
    .select()
    .from(students)
    .orderBy(desc(students.cgpa));

  // 3. Get all available supervisors
  const allSupervisors = await db
    .select()
    .from(supervisors)
    .where(eq(supervisors.isAvailable, true));

  // Build capacity map
  const supervisorCapacity = new Map<number, number>();
  for (const sup of allSupervisors) {
    supervisorCapacity.set(sup.id, sup.maxStudents);
  }

  // 4. Get all preferences
  const allPreferences = await db
    .select()
    .from(preferences)
    .orderBy(preferences.preferenceRank);

  // Group preferences by student
  const studentPreferences = new Map<number, typeof allPreferences>();
  for (const pref of allPreferences) {
    if (!studentPreferences.has(pref.studentId)) {
      studentPreferences.set(pref.studentId, []);
    }
    studentPreferences.get(pref.studentId)!.push(pref);
  }

  const newAllocations: {
    studentId: number;
    supervisorId: number;
    preferenceRank: number;
  }[] = [];
  const unallocatedStudentIds: number[] = [];
  let firstPreferenceCount = 0;

  // 5. Greedy assignment — higher CGPA first
  for (const student of allStudents) {
    const prefs = studentPreferences.get(student.id) || [];
    let assigned = false;

    for (const pref of prefs) {
      const remainingCapacity = supervisorCapacity.get(pref.supervisorId);
      if (remainingCapacity && remainingCapacity > 0) {
        newAllocations.push({
          studentId: student.id,
          supervisorId: pref.supervisorId,
          preferenceRank: pref.preferenceRank,
        });

        if (pref.preferenceRank === 1) {
          firstPreferenceCount++;
        }

        supervisorCapacity.set(pref.supervisorId, remainingCapacity - 1);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      unallocatedStudentIds.push(student.id);
    }
  }

  // 6. Save allocations
  if (newAllocations.length > 0) {
    await db.insert(allocations).values(newAllocations);
  }

  // 7. Update student statuses
  for (const alloc of newAllocations) {
    await db
      .update(students)
      .set({ allocationStatus: "allocated" })
      .where(eq(students.id, alloc.studentId));
  }

  for (const studentId of unallocatedStudentIds) {
    await db
      .update(students)
      .set({ allocationStatus: "unallocated" })
      .where(eq(students.id, studentId));
  }

  // 8. Update supervisor loads
  for (const [supervisorId, remaining] of supervisorCapacity) {
    const sup = allSupervisors.find((s) => s.id === supervisorId);
    if (sup) {
      await db
        .update(supervisors)
        .set({ currentLoad: sup.maxStudents - remaining })
        .where(eq(supervisors.id, supervisorId));
    }
  }

  const executionTime = Date.now() - startTime;
  const totalWithPreferences = allStudents.filter(
    (s) => (studentPreferences.get(s.id) || []).length > 0
  ).length;

  return {
    allocated: newAllocations.length,
    unallocated: unallocatedStudentIds.length,
    firstPreferenceRate:
      totalWithPreferences > 0
        ? Math.round((firstPreferenceCount / totalWithPreferences) * 100)
        : 0,
    executionTimeMs: executionTime,
  };
}

export async function exportAllocationsToCSV() {
  const db = getDb();

  const allocated = await db
    .select({
      rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${students.cgpa} DESC)`,
      studentId: students.studentId,
      name: students.name,
      cgpa: students.cgpa,
      department: students.department,
      supervisor: supervisors.name,
      preferenceRank: allocations.preferenceRank,
      status: sql<string>`'Allocated'`,
    })
    .from(allocations)
    .innerJoin(students, eq(allocations.studentId, students.id))
    .innerJoin(supervisors, eq(allocations.supervisorId, supervisors.id))
    .orderBy(desc(students.cgpa));

  const unallocated = await db
    .select({
      rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${students.cgpa} DESC)`,
      studentId: students.studentId,
      name: students.name,
      cgpa: students.cgpa,
      department: students.department,
      supervisor: sql<string>`'N/A'`,
      preferenceRank: sql<number>`0`,
      status: sql<string>`'Unallocated'`,
    })
    .from(students)
    .where(eq(students.allocationStatus, "unallocated"))
    .orderBy(desc(students.cgpa));

  const allResults = [...allocated, ...unallocated].sort((a, b) => {
    const cgpaA = parseFloat(String(a.cgpa));
    const cgpaB = parseFloat(String(b.cgpa));
    return cgpaB - cgpaA;
  });

  // Generate CSV
  const headers = ["Rank", "Student ID", "Name", "CGPA", "Department", "Supervisor", "Preference Rank", "Status"];
  const rows = allResults.map((r, i) => [
    i + 1,
    r.studentId,
    r.name,
    r.cgpa,
    r.department,
    r.supervisor,
    r.preferenceRank,
    r.status,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csv;
}
